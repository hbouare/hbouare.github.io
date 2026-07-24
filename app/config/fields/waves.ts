// app/config/fields/waves.ts
//
// The research page's ambient field — the one background on the site that is
// not decorative but literally the subject: mechanical / acoustic / EM waves.
//
// Two emitters cast thin, faint wavefronts; where the fronts from the two
// sources overlap, the moiré of their crossings reads as interference — the
// nodal/antinodal pattern of superposition. The fronts drift outward very
// slowly, so the field feels like a standing pattern that barely breathes
// rather than a propagating "radar", keeping it calm behind dense reading.
//
// Restraint is deliberate (this page is text-heavy): low peak opacity, a
// distance fade so fronts dissolve before they cross the centred reading
// column, a 30fps cap (slow waves gain nothing from 60), and a single emitter
// on mobile. Under reduced motion a single interference frame is drawn — still
// a meaningful, on-subject image.
import type { FieldEnv, FieldGenerator } from "~/composables/useAmbientField"

const WAVE = {
  /** Distance between successive wavefronts, px. */
  spacing: 32,
  /** Outward drift speed, px/s. Slow enough to read as a standing pattern. */
  pxPerSec: 5,
  /** Peak opacity of a wavefront (faded down with distance from there). */
  alpha: 0.055,
  lineWidth: 1,
  /** Internal frame cap — slow waves don't need 60fps, and this halves cost. */
  fps: 30,
} as const

interface Src {
  x: number
  y: number
}

export const waveField = (): FieldGenerator => {
  let sources: Src[] = []
  let maxR = 0
  let lastDraw = Number.NEGATIVE_INFINITY

  const build = (env: FieldEnv) => {
    const { width: W, height: H } = env
    // Emitters sit just OFF the viewport, so only the flatter, far arcs cross
    // the page — curved wavefronts, no bullseye at a visible centre — and the
    // two sets overlap into interference fringes over the (dimmer) margins
    // rather than the centred reading column. One source on mobile (calmer,
    // cheaper on a narrow column).
    sources = env.mobile
      ? [{ x: W * 1.04, y: -H * 0.04 }]
      : [
          { x: -W * 0.06, y: H * 0.14 },
          { x: W * 1.06, y: H * 0.86 },
        ]
    // maxR = farthest corner from any source, so rings always span the canvas.
    const corners: [number, number][] = [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ]
    maxR = 0
    for (const s of sources) {
      for (const [cx, cy] of corners) {
        const d = Math.hypot(s.x - cx, s.y - cy)
        if (d > maxR) maxR = d
      }
    }
  }

  const paint = (env: FieldEnv, offset: number) => {
    const { ctx, width: W, height: H } = env
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = WAVE.lineWidth
    const rgb = env.ink()
    for (const s of sources) {
      for (let r = offset; r < maxR; r += WAVE.spacing) {
        const a = WAVE.alpha * (1 - r / maxR) // fade with distance from the source
        if (a <= 0.002) continue
        ctx.strokeStyle = `rgba(${rgb}, ${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  return {
    setup(env) {
      build(env)
      lastDraw = Number.NEGATIVE_INFINITY
    },
    frame(env, elapsed) {
      if (elapsed - lastDraw < 1000 / WAVE.fps) return true
      lastDraw = elapsed
      // Sign-safe modulo so the first ring radius is always ≥ 0.
      const drift = (elapsed / 1000) * WAVE.pxPerSec
      const offset = ((drift % WAVE.spacing) + WAVE.spacing) % WAVE.spacing
      paint(env, offset)
      return true // continuous field
    },
    still(env) {
      paint(env, 0)
    },
  }
}
