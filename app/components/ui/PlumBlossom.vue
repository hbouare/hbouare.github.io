<!-- app/components/ui/PlumBlossom.vue -->
<!--
  Ambient generative branches — a faithful reimplementation of Anthony Fu's
  "plum" (antfu.me). A single fixed, full-viewport canvas sits BEHIND the page
  content; branches seed from the middle of each screen edge and grow inward.

  What makes it read as alive is NOT scroll: it is TIME. The tree grows over a
  few seconds after load via requestAnimationFrame, and — crucially — its
  growth is deliberately UNEVEN. A queue of pending branch-tips is advanced one
  "tick" every few frames, and each tick runs only a random ~60% of the ready
  tips while deferring the rest to the next tick. That per-frame scatter is the
  whole trick: it stops the tree radiating in clean geometric rings and makes
  it creep organically, like ink wicking through paper.

  The canvas is `position: fixed`, so the finished tree then stays anchored to
  the viewport while the page scrolls over it — that is where the "it follows
  the scroll" impression comes from; nothing is actually scroll-linked.

  Design fit: strokes are the theme INK colour at a low alpha, so the frame
  stays strictly monochrome and reads on both themes. Every tunable lives in
  the CFG block below — no magic values scattered through the logic.

  Accessibility: purely decorative (`aria-hidden`). Under reduced motion the
  same final tree is drawn in one synchronous pass — identical image, zero
  motion, no rAF.
-->
<template>
  <div ref="fieldRoot" class="plum-field" aria-hidden="true">
    <canvas ref="canvasEl" class="plum-canvas" />
  </div>
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()

// ── Config — the single source of every tunable ─────────────────────────
const CFG = {
  /** Max length of one drawn segment, px. Short = smooth, curved branches. */
  segLen: 6,
  /** Max angular jitter (rad) when a tip forks. antfu's r15 = π/12. */
  branchAngle: Math.PI / 12,
  /** Steps a lineage keeps the dense fork rate before it tapers. Longer =
   *  branches reach further inward before thinning to wispy tips. */
  steadySteps: 44,
  /** Fork probability while dense (early) then sparse (late). */
  rateEarly: 0.8,
  rateLate: 0.5,
  /** Advance the growth queue every Nth animation frame — paces the reveal. */
  frameEvery: 3,
  /** Fraction of ready tips deferred to the next tick. THIS is what makes the
   *  growth look organic rather than radiating in rings. */
  deferChance: 0.4,
  /** Stroke width, px (constant — no taper, matches the original). */
  lineWidth: 1,
  /** Ink opacity. Ambient: present but never competing with the content. */
  alpha: 0.16,
  /** How far outside the edge each seed starts, px. */
  seedInset: 5,
  /** Hard cap so a pathological run can never allocate without bound. */
  maxSegments: 24000,
} as const

const R90 = Math.PI / 2
const R180 = Math.PI

const fieldRoot = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

/** A drawn segment, kept so the whole tree can be repainted in a new ink
 *  colour on a theme flip without regrowing it. */
interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}
/** A live branch tip waiting to grow. `count` is shared down a lineage so the
 *  fork rate tapers as that lineage lengthens (dense base, airy canopy). */
interface Tip {
  x: number
  y: number
  theta: number
  count: { v: number }
}

let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0
const segments: Seg[] = []
let pending: Tip[] = []
let rafId = 0
let frameCount = 0
let removeResize: (() => void) | null = null

const inkColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--v-theme-primary").trim() || "255,255,255"

const applyStyle = () => {
  if (!ctx) return
  ctx.lineCap = "round"
  ctx.lineWidth = CFG.lineWidth
  ctx.strokeStyle = `rgba(${inkColor()}, ${CFG.alpha})`
}

const stroke = (s: Seg) => {
  if (!ctx) return
  ctx.beginPath()
  ctx.moveTo(s.x1, s.y1)
  ctx.lineTo(s.x2, s.y2)
  ctx.stroke()
}

/** Grow one tip: draw its short segment, then maybe fork into two new tips. */
const grow = (b: Tip) => {
  if (segments.length >= CFG.maxSegments) return
  const len = Math.random() * CFG.segLen
  b.count.v += 1
  const x2 = b.x + len * Math.cos(b.theta)
  const y2 = b.y + len * Math.sin(b.theta)

  const seg: Seg = { x1: b.x, y1: b.y, x2, y2 }
  segments.push(seg)
  stroke(seg)

  // Past the edge (with a margin) → this lineage stops here.
  if (x2 < -100 || x2 > W + 100 || y2 < -100 || y2 > H + 100) return

  const rate = b.count.v <= CFG.steadySteps ? CFG.rateEarly : CFG.rateLate
  if (Math.random() < rate)
    pending.push({ x: x2, y: y2, theta: b.theta + Math.random() * CFG.branchAngle, count: b.count })
  if (Math.random() < rate)
    pending.push({ x: x2, y: y2, theta: b.theta - Math.random() * CFG.branchAngle, count: b.count })
}

/** One growth tick: run most ready tips now, defer a random slice. */
const tick = () => {
  const ready = pending
  pending = []
  for (const b of ready) {
    if (Math.random() < CFG.deferChance) pending.push(b)
    else grow(b)
  }
}

const loop = () => {
  rafId = requestAnimationFrame(loop)
  frameCount += 1
  if (frameCount % CFG.frameEvery !== 0) return
  tick()
  if (pending.length === 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

/** Seed the middle 20–80% of each edge, pointing inward. 2 seeds on mobile. */
const seeds = (mobile: boolean): Tip[] => {
  const mid = () => Math.random() * 0.6 + 0.2
  const s = CFG.seedInset
  const all: Tip[] = [
    { x: mid() * W, y: -s, theta: R90, count: { v: 0 } }, // top → down
    { x: mid() * W, y: H + s, theta: -R90, count: { v: 0 } }, // bottom → up
    { x: -s, y: mid() * H, theta: 0, count: { v: 0 } }, // left → right
    { x: W + s, y: mid() * H, theta: R180, count: { v: 0 } }, // right → left
  ]
  return mobile ? all.slice(0, 2) : all
}

/** Match the backing store to the field's box (× DPR for crisp hairlines). */
const sizeCanvas = () => {
  const el = fieldRoot.value
  const canvas = canvasEl.value
  if (!el || !canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = el.clientWidth
  H = el.clientHeight
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  ctx = canvas.getContext("2d")
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
}

/** Repaint the stored tree in the current ink — used on a theme flip. */
const repaint = () => {
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  applyStyle()
  for (const s of segments) stroke(s)
}

/** Grow a fresh tree. `animate=false` draws the finished tree in one pass. */
const start = (mobile: boolean, animate: boolean) => {
  cancelAnimationFrame(rafId)
  rafId = 0
  frameCount = 0
  segments.length = 0
  sizeCanvas()
  if (!ctx) return
  ctx.clearRect(0, 0, W, H)
  applyStyle()
  pending = seeds(mobile)

  if (!animate) {
    // Reduced motion: drain the queue synchronously — same image, no motion.
    let guard = 0
    while (pending.length && guard++ < CFG.maxSegments) {
      const ready = pending
      pending = []
      for (const b of ready) grow(b)
    }
    return
  }
  loop()
}

// ── Lifecycle via useMotion: reduced-motion flag + breakpoint re-runs ────
// The rAF loop is not GSAP, so useMotion only supplies `motion`/`mobile` and
// re-runs this on a breakpoint cross. Cleanup of the loop and the resize
// listener is handled by start()'s cancel-on-entry and onUnmounted below, so a
// re-run never stacks a second loop.
useMotion(fieldRoot, ({ motion, mobile }) => {
  if (removeResize) {
    removeResize()
    removeResize = null
  }

  start(mobile, motion)

  if (!motion) return // static tree: no resize regrow, no live loop

  // Regrow on resize (debounced) — matches the original, which restarts.
  let timer: ReturnType<typeof setTimeout> | undefined
  const onResize = () => {
    clearTimeout(timer)
    timer = setTimeout(() => start(mobile, true), 200)
  }
  window.addEventListener("resize", onResize, { passive: true })
  removeResize = () => {
    clearTimeout(timer)
    window.removeEventListener("resize", onResize)
  }
})

// Theme flip: same geometry, new ink — repaint, don't regrow. Declared at the
// setup root (NOT inside useMotion) so a breakpoint re-run can't stack watchers.
watch(isDark, () => repaint())

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  rafId = 0
  removeResize?.()
  removeResize = null
})
</script>

<style scoped lang="scss">
.plum-field {
  position: fixed; // anchored to the viewport — the page scrolls over the tree
  inset: 0;
  overflow: hidden; // clips any branch past the edge → never a scrollbar
  pointer-events: none;
  z-index: 0; // behind the page content (which sits in a later, positioned box)
}

.plum-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
