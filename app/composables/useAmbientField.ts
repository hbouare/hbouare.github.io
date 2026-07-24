// app/composables/useAmbientField.ts
//
// The shared foundation for every ambient background field on the site (the
// blog's generative trees, the research wave field, …). It owns ONLY the
// invariants that must be identical everywhere — the canvas, its sizing, the
// animation loop, the reduced-motion contract, theme recolouring and cleanup —
// and delegates the actual *phenomenon* to a pluggable FieldGenerator.
//
// This is the "same instrument, different melody" split: coherence lives here
// (a fixed, faint, monochrome, behind-content canvas that honours reduced
// motion); variety lives in the generator (what is drawn). Adding a new field
// means writing one generator in app/config/fields, never touching this file.
//
// Not built on GSAP: a canvas draw loop is not a tween, so useMotion supplies
// only the `motion`/`mobile` conditions and the breakpoint re-run. The loop and
// the resize listener are torn down by run()'s cancel-on-entry and onUnmounted,
// so a re-run can never stack a second loop.
import type { Ref } from "vue"

export interface FieldEnv {
  ctx: CanvasRenderingContext2D
  /** CSS-pixel dimensions (the backing store is already DPR-scaled). */
  width: number
  height: number
  /** Current theme ink as an "r,g,b" string. Read per draw so theme flips take. */
  ink: () => string
  /** Below 768px — generators drop or thin out expensive detail. */
  mobile: boolean
}

export interface FieldGenerator {
  /** Build/seed geometry for the current size. Called on start and after resize. */
  setup: (env: FieldEnv) => void
  /**
   * Paint one animation frame. `elapsed` is ms since the run started.
   * Return `false` to stop the loop (a finite growth that completes);
   * return `true`/`undefined` to keep looping (a continuous field).
   */
  frame: (env: FieldEnv, elapsed: number) => boolean | void
  /** The meaningful STATIC image, drawn once under reduced motion. */
  still: (env: FieldEnv) => void
  /**
   * Optional: repaint existing geometry in the current ink on a theme flip,
   * without regenerating it. Accumulating fields (the plum) need this; a
   * continuous field recolours itself on its next frame and can omit it.
   */
  repaint?: (env: FieldEnv) => void
}

export type FieldFactory = () => FieldGenerator

export const useAmbientField = (
  root: Ref<HTMLElement | null>,
  canvas: Ref<HTMLCanvasElement | null>,
  factory: FieldFactory,
) => {
  const { isDark } = useAppTheme()

  let ctx: CanvasRenderingContext2D | null = null
  let gen: FieldGenerator | null = null
  let env: FieldEnv | null = null
  let rafId = 0
  let removeResize: (() => void) | null = null

  const ink = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--v-theme-primary").trim() || "255,255,255"

  /** Match the backing store to the field's box (× DPR for crisp hairlines). */
  const size = () => {
    const el = root.value
    const cv = canvas.value
    if (!el || !cv) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    cv.width = Math.round(el.clientWidth * dpr)
    cv.height = Math.round(el.clientHeight * dpr)
    ctx = cv.getContext("2d")
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const stopLoop = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = 0
  }

  const run = (mobile: boolean, motion: boolean) => {
    stopLoop()
    removeResize?.()
    removeResize = null

    size()
    const el = root.value
    if (!ctx || !el) return

    env = { ctx, width: el.clientWidth, height: el.clientHeight, ink, mobile }
    gen = factory()
    gen.setup(env)

    if (!motion) {
      // Reduced motion: the static, meaningful image — no rAF, no listeners.
      gen.still(env)
      return
    }

    const startTime = performance.now()
    const loop = (now: number) => {
      if (!gen || !env) return
      // Clamp: a frame's rAF timestamp can be marginally earlier than the
      // startTime captured just before scheduling it, which would hand a
      // generator a negative elapsed.
      const cont = gen.frame(env, Math.max(0, now - startTime))
      if (cont === false) {
        rafId = 0
        return
      }
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    // Rebuild on resize (debounced) so geometry refits the new box.
    let t: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(() => run(mobile, true), 200)
    }
    window.addEventListener("resize", onResize, { passive: true })
    removeResize = () => {
      clearTimeout(t)
      window.removeEventListener("resize", onResize)
    }
  }

  useMotion(root, ({ motion, mobile }) => run(mobile, motion))

  // Theme flip: recolour without regenerating. An accumulating field exposes
  // repaint(); a static (reduced-motion) field is redrawn via still(); a
  // running continuous field recolours itself on its next frame (no-op here).
  watch(isDark, () => {
    if (!gen || !env || !ctx) return
    if (gen.repaint) gen.repaint(env)
    else if (!rafId) {
      ctx.clearRect(0, 0, env.width, env.height)
      gen.still(env)
    }
  })

  onUnmounted(() => {
    stopLoop()
    removeResize?.()
    removeResize = null
    gen = null
    env = null
  })
}
