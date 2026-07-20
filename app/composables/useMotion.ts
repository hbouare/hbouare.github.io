// app/composables/useMotion.ts
import type { ComponentPublicInstance } from "vue"
import { gsap } from "gsap"

type Root = HTMLElement | ComponentPublicInstance | null | undefined

/** Conditions every motion callback receives. */
export interface MotionConditions {
  /** False when the user asked for reduced motion — skip or shorten. */
  motion: boolean
  /** Below 768px. Used to drop expensive effects (e.g. line splitting). */
  mobile: boolean
  /** 768–1279px. */
  tablet: boolean
  /** 1280px and up. */
  desktop: boolean
}

const unwrap = (root: Root): HTMLElement | null => {
  if (!root) return null
  return "$el" in root ? (root.$el as HTMLElement) : root
}

/**
 * Scoped, reduced-motion-aware, self-cleaning GSAP entry point.
 *
 * This is the ONLY way components should create animations. It guarantees
 * the three things that are easy to get wrong:
 *
 * 1. **Reduced motion is honoured.** The CSS `prefers-reduced-motion` block
 *    in main.scss cannot stop GSAP — GSAP writes inline styles from JS and
 *    is immune to `animation-duration: 0`. Without this composable, adding
 *    GSAP would silently break accessibility.
 * 2. **Selectors are scoped** to the component root, so `.card` never
 *    reaches into another instance or the rest of the page.
 * 3. **Everything is reverted on unmount** — tweens, ScrollTriggers and the
 *    inline styles they wrote. No leaks across page navigations.
 *
 * The callback re-runs automatically when a media condition changes (e.g.
 * resize across the mobile breakpoint), reverting the previous run first.
 *
 * @param root   Template ref for the component's root element.
 * @param build  Receives the live conditions; create animations inside.
 */
export const useMotion = (
  root: Ref<Root>,
  build: (conditions: MotionConditions) => void,
) => {
  let mm: gsap.MatchMedia | undefined

  onMounted(() => {
    const el = unwrap(root.value)
    if (!el) return

    mm = gsap.matchMedia(el)

    // The breakpoint conditions are EXHAUSTIVE (mobile ∪ tablet ∪ desktop
    // covers every width) on purpose: gsap.matchMedia only invokes the
    // callback when at least one condition matches. If they left a gap, then
    // at a width in that gap with reduced motion on, NO condition would match
    // and the callback would never run — leaving the component un-initialised
    // (e.g. a counter stuck at 0). `motion` is read, never required to match.
    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px)",
        tablet: "(min-width: 768px) and (max-width: 1279px)",
        desktop: "(min-width: 1280px)",
      },
      (ctx) => {
        const c = ctx.conditions as unknown as MotionConditions
        build(c)
      },
    )
  })

  onUnmounted(() => {
    mm?.revert()
    mm = undefined
  })
}
