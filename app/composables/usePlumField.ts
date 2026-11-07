// app/composables/usePlumField.ts
//
// The blog's ambient tree (/blog and every article): generative "plum"
// branches (after Anthony Fu's antfu.me) growing in from the middle of each
// screen edge. Restored from master's app/config/fields/plum.ts with the same
// constants and growth, without its GSAP-based engine.
//
// What makes it read as alive is uneven growth: a queue of branch tips is
// advanced one tick every few frames, and each tick grows only a random ~60%
// of the ready tips. That scatter stops the tree radiating in clean rings.
//
// Client-only by construction (called from onMounted). The colour comes from
// --plum-trace (the accent at low alpha) and is re-read when data-theme flips;
// the existing branches are repainted, not regrown.

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}
/** A live branch tip. `count` is shared down a lineage so the fork rate
 *  tapers as the lineage lengthens: dense base, airy canopy. */
interface Tip {
  x: number
  y: number
  theta: number
  count: { v: number }
}

const MOBILE_MAX = 768 // master's motion breakpoint (max-width: 767px), not the site's 760
const SEG_LEN = 6 // max length of one segment, px
const BRANCH_ANGLE = Math.PI / 12 // max angular jitter when a tip forks
const STEADY_STEPS = 44 // steps a lineage keeps the dense fork rate
const RATE_EARLY = 0.8
const RATE_LATE = 0.5
const FRAME_EVERY = 3 // advance the queue every Nth frame
const DEFER = 0.4 // share of ready tips deferred to the next tick
const SEED_INSET = 5 // seeds start this far outside the edge, px
const MAX_SEGMENTS = 24000

export function createPlumField(canvas: HTMLCanvasElement, opts: { still: boolean }) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return { destroy: () => {} }

  let W = 0
  let H = 0
  let color = ""
  let segments: Seg[] = []
  let pending: Tip[] = []
  let frames = 0
  let raf = 0

  const readColor = () => {
    color = getComputedStyle(canvas).getPropertyValue("--plum-trace").trim()
  }

  const applyStyle = () => {
    ctx.lineCap = "round"
    ctx.lineWidth = 1
    ctx.strokeStyle = color
  }

  const stroke = (s: Seg) => {
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x2, s.y2)
    ctx.stroke()
  }

  /** Grow one tip: draw its short segment, then maybe fork into two tips. */
  const grow = (b: Tip) => {
    if (segments.length >= MAX_SEGMENTS) return
    const len = Math.random() * SEG_LEN
    b.count.v += 1
    const seg = {
      x1: b.x,
      y1: b.y,
      x2: b.x + len * Math.cos(b.theta),
      y2: b.y + len * Math.sin(b.theta),
    }
    segments.push(seg)
    stroke(seg)

    // Past the edge (with a margin): this lineage stops here.
    if (seg.x2 < -100 || seg.x2 > W + 100 || seg.y2 < -100 || seg.y2 > H + 100) return

    const rate = b.count.v <= STEADY_STEPS ? RATE_EARLY : RATE_LATE
    if (Math.random() < rate)
      pending.push({ x: seg.x2, y: seg.y2, theta: b.theta + Math.random() * BRANCH_ANGLE, count: b.count })
    if (Math.random() < rate)
      pending.push({ x: seg.x2, y: seg.y2, theta: b.theta - Math.random() * BRANCH_ANGLE, count: b.count })
  }

  /** Size the backing store to the box and plant the seeds. */
  const setup = () => {
    W = canvas.offsetWidth
    H = canvas.offsetHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    readColor()
    applyStyle()

    segments = []
    frames = 0
    // Middle 20–80% of each edge, pointing inward; two seeds on mobile.
    const mid = () => Math.random() * 0.6 + 0.2
    const seeds: Tip[] = [
      { x: mid() * W, y: -SEED_INSET, theta: Math.PI / 2, count: { v: 0 } },
      { x: mid() * W, y: H + SEED_INSET, theta: -Math.PI / 2, count: { v: 0 } },
      { x: -SEED_INSET, y: mid() * H, theta: 0, count: { v: 0 } },
      { x: W + SEED_INSET, y: mid() * H, theta: Math.PI, count: { v: 0 } },
    ]
    pending = W < MOBILE_MAX ? seeds.slice(0, 2) : seeds
  }

  const loop = () => {
    frames += 1
    if (frames % FRAME_EVERY === 0) {
      const ready = pending
      pending = []
      for (const b of ready) {
        if (Math.random() < DEFER) pending.push(b)
        else grow(b)
      }
    }
    raf = pending.length ? requestAnimationFrame(loop) : 0
  }

  /** Reduced motion: drain the queue at once — the same tree, no growth. */
  const drain = () => {
    let guard = 0
    while (pending.length && guard++ < MAX_SEGMENTS) {
      const ready = pending
      pending = []
      for (const b of ready) grow(b)
    }
  }

  const start = () => {
    cancelAnimationFrame(raf)
    raf = 0
    setup()
    if (opts.still) drain()
    else raf = requestAnimationFrame(loop)
  }
  start()

  // Regrow for the new box, once the resize settles.
  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      if (canvas.offsetWidth !== W || canvas.offsetHeight !== H) start()
    }, 200)
  }
  window.addEventListener("resize", onResize, { passive: true })

  // Theme flip: same branches, new colour.
  const themeObserver = new MutationObserver(() => {
    readColor()
    ctx.clearRect(0, 0, W, H)
    applyStyle()
    for (const s of segments) stroke(s)
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  })

  return {
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      clearTimeout(resizeTimer)
      window.removeEventListener("resize", onResize)
      themeObserver.disconnect()
    },
  }
}

/** Mounts the plum field on `canvas` for the lifetime of the component. */
export function usePlumField(canvas: Ref<HTMLCanvasElement | null>) {
  let field: ReturnType<typeof createPlumField> | undefined
  onMounted(() => {
    if (!canvas.value) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    field = createPlumField(canvas.value, { still })
  })
  onBeforeUnmount(() => field?.destroy())
}
