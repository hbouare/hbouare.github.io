// app/config/motion.ts
//
// Single source of truth for motion. Components must never hardcode a
// duration, ease or delay — import from here so the whole site can be
// retimed in one place and stays rhythmically coherent.
//
// The design system reads as "engineered, flat, precise". Motion follows:
// short, decisive, no overshoot. Bounce and elastic eases are deliberately
// absent — they would contradict the visual identity.

export const DURATION = {
  /** Micro-feedback: hover, focus, small state flips. */
  fast: 0.25,
  /** Default UI motion: reveals, nav, most transitions. */
  base: 0.6,
  /** Editorial moments: masked line reveals, hero beats. */
  slow: 0.9,
} as const

export const EASE = {
  /** Decisive settle. The house ease — used unless there's a reason not to. */
  out: "power3.out",
  /** Symmetric, for things that move and come back. */
  inOut: "power2.inOut",
  /** Linear, for continuous motion (marquee, velocity-driven effects). */
  none: "none",
} as const

export const STAGGER = {
  /** Between lines of a masked heading. */
  line: 0.08,
  /** Between hero beats. */
  beat: 0.12,
} as const

/** Vertical travel for reveals, in px. Kept small — this is a text site. */
export const DISTANCE = {
  sm: 16,
  base: 28,
} as const

/** ScrollTrigger start position shared by every scroll-driven reveal. */
export const SCROLL_START = "top 85%"
