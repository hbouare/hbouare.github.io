// app/config/fields/plum.ts
//
// The blog's generative branches — a faithful reimplementation of Anthony Fu's
// "plum" (antfu.me), expressed as a FieldGenerator for useAmbientField.
//
// Branches seed from the middle of each screen edge and grow inward. What makes
// it read as alive is TIME, not scroll: the tree grows over a few seconds, and
// its growth is deliberately UNEVEN. A queue of pending branch-tips is advanced
// one tick every few frames, and each tick runs only a random ~60% of the ready
// tips while deferring the rest. That per-frame scatter is the whole trick — it
// stops the tree radiating in clean rings and makes it creep like ink in paper.
//
// Meaning (per the motion memo): organic accumulation of thoughts over time.
import type { FieldEnv, FieldGenerator } from "~/composables/useAmbientField"

const CFG = {
  /** Max length of one drawn segment, px. Short = smooth, curved branches. */
  segLen: 6,
  /** Max angular jitter (rad) when a tip forks. antfu's r15 = π/12. */
  branchAngle: Math.PI / 12,
  /** Steps a lineage keeps the dense fork rate before it thins to wispy tips. */
  steadySteps: 44,
  /** Fork probability while dense (early) then sparse (late). */
  rateEarly: 0.8,
  rateLate: 0.5,
  /** Advance the growth queue every Nth frame — paces the reveal. */
  frameEvery: 3,
  /** Fraction of ready tips deferred to the next tick — the organic scatter. */
  deferChance: 0.4,
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

interface Seg {
  x1: number
  y1: number
  x2: number
  y2: number
}
/** A live branch tip. `count` is shared down a lineage so the fork rate tapers
 *  as that lineage lengthens (dense base, airy canopy). */
interface Tip {
  x: number
  y: number
  theta: number
  count: { v: number }
}

export const plumField = (): FieldGenerator => {
  const segments: Seg[] = []
  let pending: Tip[] = []
  let frameCount = 0

  const applyStyle = (env: FieldEnv) => {
    env.ctx.lineCap = "round"
    env.ctx.lineWidth = CFG.lineWidth
    env.ctx.strokeStyle = `rgba(${env.ink()}, ${CFG.alpha})`
  }

  const stroke = (ctx: CanvasRenderingContext2D, s: Seg) => {
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x2, s.y2)
    ctx.stroke()
  }

  /** Grow one tip: draw its short segment, then maybe fork into two new tips. */
  const grow = (env: FieldEnv, b: Tip) => {
    if (segments.length >= CFG.maxSegments) return
    const len = Math.random() * CFG.segLen
    b.count.v += 1
    const x2 = b.x + len * Math.cos(b.theta)
    const y2 = b.y + len * Math.sin(b.theta)

    const seg: Seg = { x1: b.x, y1: b.y, x2, y2 }
    segments.push(seg)
    stroke(env.ctx, seg)

    // Past the edge (with a margin) → this lineage stops here.
    if (x2 < -100 || x2 > env.width + 100 || y2 < -100 || y2 > env.height + 100) return

    const rate = b.count.v <= CFG.steadySteps ? CFG.rateEarly : CFG.rateLate
    if (Math.random() < rate)
      pending.push({ x: x2, y: y2, theta: b.theta + Math.random() * CFG.branchAngle, count: b.count })
    if (Math.random() < rate)
      pending.push({ x: x2, y: y2, theta: b.theta - Math.random() * CFG.branchAngle, count: b.count })
  }

  /** One growth tick: run most ready tips now, defer a random slice. */
  const tick = (env: FieldEnv) => {
    const ready = pending
    pending = []
    for (const b of ready) {
      if (Math.random() < CFG.deferChance) pending.push(b)
      else grow(env, b)
    }
  }

  /** Seed the middle 20–80% of each edge, pointing inward. 2 seeds on mobile. */
  const seed = (env: FieldEnv): Tip[] => {
    const mid = () => Math.random() * 0.6 + 0.2
    const s = CFG.seedInset
    const { width: W, height: H } = env
    const all: Tip[] = [
      { x: mid() * W, y: -s, theta: R90, count: { v: 0 } }, // top → down
      { x: mid() * W, y: H + s, theta: -R90, count: { v: 0 } }, // bottom → up
      { x: -s, y: mid() * H, theta: 0, count: { v: 0 } }, // left → right
      { x: W + s, y: mid() * H, theta: R180, count: { v: 0 } }, // right → left
    ]
    return env.mobile ? all.slice(0, 2) : all
  }

  return {
    setup(env) {
      segments.length = 0
      frameCount = 0
      env.ctx.clearRect(0, 0, env.width, env.height)
      applyStyle(env)
      pending = seed(env)
    },
    frame(env) {
      frameCount += 1
      if (frameCount % CFG.frameEvery !== 0) return true
      tick(env)
      return pending.length > 0
    },
    still(env) {
      // Reduced motion: drain the queue synchronously — same image, no motion.
      applyStyle(env)
      let guard = 0
      while (pending.length && guard++ < CFG.maxSegments) {
        const ready = pending
        pending = []
        for (const b of ready) grow(env, b)
      }
    },
    repaint(env) {
      // Theme flip: same geometry, new ink — no regrow.
      env.ctx.clearRect(0, 0, env.width, env.height)
      applyStyle(env)
      for (const s of segments) stroke(env.ctx, s)
    },
  }
}
