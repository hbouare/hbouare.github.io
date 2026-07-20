<!-- app/components/ui/PlumBlossom.vue -->
<!--
  Ambient plum-blossom branches that frame the blog page from its corners.

  The generative branch art is kept from the original, but the mechanics
  changed: instead of a continuous rAF loop that *grows* the fractal pixel by
  pixel, each corner's branch is generated ONCE into its own canvas, and all
  motion (entrance choreography + idle sway) is pure CSS on transform/opacity.

  That switch is what makes the requested cinematic entrance possible — a
  canvas fractal cannot be translated/rotated/scaled/overshot — while also
  removing the continuous JavaScript and being far cheaper.

  Every tunable lives in the TREES config below (no magic values scattered).
-->
<template>
  <div class="plum-field" aria-hidden="true">
    <div
      v-for="t in TREES"
      :key="t.pos"
      class="plum"
      :class="`plum--${t.pos}`"
      :style="styleFor(t)"
    >
      <div class="plum-sway">
        <canvas :ref="(el) => registerCanvas(t.pos, el)" class="plum-canvas" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"

const { isDark } = useAppTheme()

// ── Config — the single source of every tunable ─────────────────────────
// Depth is baked in: bottom corners read as foreground (bigger, more opaque,
// more travel, faster, more sway); top corners as background (smaller,
// dimmer, slower, less sway). Entrance order is bl → br → tl → tr.
type Pos = "bl" | "br" | "tl" | "tr"
interface Tree {
  pos: Pos
  dx: -1 | 1 // entrance travel direction (x): -1 from left, +1 from right
  dy: -1 | 1 // entrance travel direction (y): -1 from top, +1 from bottom
  anchor: string // transform-origin (the corner the branch is rooted at)
  size: number // display size in px at --rs = 1
  op: number // resting opacity (depth)
  travel: number // entrance offset distance in px
  rot: number // entrance start rotation in deg
  scale: number // entrance start scale
  dur: number // entrance duration in ms
  delay: number // entrance delay in ms
  swayDur: number // idle sway period in ms
  swayDeg: number // idle sway amplitude in deg
}

const TREES: Tree[] = [
  { pos: "bl", dx: -1, dy: 1, anchor: "0% 100%", size: 300, op: 0.5, travel: 90, rot: -6, scale: 0.82, dur: 1100, delay: 0, swayDur: 7000, swayDeg: 0.8 },
  { pos: "br", dx: 1, dy: 1, anchor: "100% 100%", size: 300, op: 0.5, travel: 90, rot: 6, scale: 0.82, dur: 1100, delay: 140, swayDur: 7800, swayDeg: 0.8 },
  { pos: "tl", dx: -1, dy: -1, anchor: "0% 0%", size: 240, op: 0.35, travel: 70, rot: -5, scale: 0.86, dur: 1300, delay: 300, swayDur: 9000, swayDeg: 0.6 },
  { pos: "tr", dx: 1, dy: -1, anchor: "100% 0%", size: 240, op: 0.35, travel: 70, rot: 5, scale: 0.86, dur: 1300, delay: 440, swayDur: 9600, swayDeg: 0.6 },
]

/** Logical space the branch geometry is generated in. Fixed, so the canvas
 *  never needs regenerating on resize — CSS scales it, shapes stay stable. */
const DRAW_SIZE = 360

const styleFor = (t: Tree) => ({
  "--dx": String(t.dx),
  "--dy": String(t.dy),
  "--anchor": t.anchor,
  "--size": `${t.size}px`,
  "--rest-op": String(t.op),
  "--travel": `${t.travel}px`,
  "--rot": `${t.rot}deg`,
  "--scale": String(t.scale),
  "--dur": `${t.dur}ms`,
  "--delay": `${t.delay}ms`,
  "--sway-dur": `${t.swayDur}ms`,
  "--sway-deg": `${t.swayDeg}deg`,
  // Sway begins once the entrance has landed.
  "--sway-delay": `${t.delay + t.dur}ms`,
})

// ── Geometry: generate once, render per theme ───────────────────────────
interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  w: number
  a: number
}
interface Blossom {
  x: number
  y: number
  r: number
  a: number
}

const canvases = new Map<Pos, HTMLCanvasElement>()
const geometry = new Map<Pos, { segs: Segment[]; blossoms: Blossom[] }>()

const registerCanvas = (pos: Pos, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLCanvasElement) canvases.set(pos, el)
}

const rand = (a: number, b: number) => Math.random() * (b - a) + a

/** Root point + initial growth angle (radians) per corner, in DRAW_SIZE
 *  space. Each branch grows inward from its outer corner. */
const ROOTS: Record<Pos, { x: number; y: number; angle: number }> = {
  bl: { x: 0, y: DRAW_SIZE, angle: -Math.PI / 4 },
  br: { x: DRAW_SIZE, y: DRAW_SIZE, angle: (-3 * Math.PI) / 4 },
  tl: { x: 0, y: 0, angle: Math.PI / 4 },
  tr: { x: DRAW_SIZE, y: 0, angle: (3 * Math.PI) / 4 },
}

/**
 * Grow one branch: a deterministic tapering trunk of `steps` segments that
 * drifts inward, occasionally spawning a SHORTER side branch. Using a fixed
 * trunk length (rather than pure per-step probability) keeps the branch long
 * and delicate without the exponential blow-up that would fill the canvas.
 */
const grow = (
  segs: Segment[],
  blossoms: Blossom[],
  startX: number,
  startY: number,
  startAngle: number,
  steps: number,
  width: number,
) => {
  let x = startX
  let y = startY
  let angle = startAngle
  let w = width

  for (let i = 0; i < steps; i++) {
    const len = rand(6, 10)
    const nx = x + len * Math.cos(angle)
    const ny = y + len * Math.sin(angle)
    if (nx < -20 || nx > DRAW_SIZE + 20 || ny < -20 || ny > DRAW_SIZE + 20) break

    const a = Math.max(0.06, 0.42 - i * 0.012)
    segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: Math.max(0.35, w), a })

    // A few blossoms toward the tips.
    if (i > steps * 0.5 && Math.random() < 0.08) {
      blossoms.push({ x: nx, y: ny, r: rand(1, 2.2), a: a * 0.85 })
    }

    // Occasional side branch — shorter, so recursion always terminates.
    if (i > 3 && Math.random() < 0.16) {
      const dir = Math.random() > 0.5 ? 1 : -1
      grow(
        segs,
        blossoms,
        nx,
        ny,
        angle + dir * rand(0.4, 0.85),
        Math.floor(steps * rand(0.3, 0.55)),
        w * 0.7,
      )
    }

    x = nx
    y = ny
    angle += rand(-0.13, 0.13) // gentle inward drift
    w *= 0.97
  }
}

const generate = (pos: Pos) => {
  const root = ROOTS[pos]
  const segs: Segment[] = []
  const blossoms: Blossom[] = []
  const trunks = Math.floor(rand(2, 4))
  for (let i = 0; i < trunks; i++) {
    grow(
      segs,
      blossoms,
      root.x,
      root.y,
      root.angle + rand(-0.35, 0.35),
      Math.floor(rand(20, 28)),
      1,
    )
  }
  geometry.set(pos, { segs, blossoms })
}

const inkColor = () =>
  getComputedStyle(document.documentElement)
    .getPropertyValue("--v-theme-primary")
    .trim() || "255,255,255"

/** Paint stored geometry with the current ink colour. Reused on theme flip
 *  so the shape stays identical and only the colour changes. */
const render = (pos: Pos) => {
  const canvas = canvases.get(pos)
  const geo = geometry.get(pos)
  if (!canvas || !geo) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  if (canvas.width !== DRAW_SIZE * dpr) {
    canvas.width = DRAW_SIZE * dpr
    canvas.height = DRAW_SIZE * dpr
  }
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, DRAW_SIZE, DRAW_SIZE)
  ctx.lineCap = "round"

  const color = inkColor()
  for (const s of geo.segs) {
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x2, s.y2)
    ctx.strokeStyle = `rgba(${color}, ${s.a})`
    ctx.lineWidth = s.w
    ctx.stroke()
  }
  for (const b of geo.blossoms) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${color}, ${b.a})`
    ctx.fill()
  }
}

const renderAll = () => TREES.forEach((t) => render(t.pos))

onMounted(() => {
  TREES.forEach((t) => generate(t.pos))
  renderAll()
  // Re-paint (same geometry, new ink) when the theme flips — a discrete
  // event, not a loop.
  watch(isDark, () => renderAll())
})
</script>

<style scoped lang="scss">
.plum-field {
  position: absolute;
  inset: 0;
  overflow: hidden; // clips the off-screen entrance → no horizontal scrollbar
  pointer-events: none;
  z-index: 0;
  color: rgb(var(--v-theme-primary));
  // Responsive master knob: one value scales every tree's size and travel.
  --rs: 1;
}

.plum {
  position: absolute;
  width: calc(var(--size) * var(--rs));
  height: calc(var(--size) * var(--rs));
  opacity: 0;
  transform-origin: var(--anchor);
  // Entrance: slide in from the corner + rotate + scale + fade, with a
  // restrained overshoot (no bounce — it would fight the engineered feel).
  animation: plum-enter var(--dur) cubic-bezier(0.22, 1.1, 0.36, 1)
    var(--delay) forwards;
}

.plum--bl {
  left: 0;
  bottom: 0;
}
.plum--br {
  right: 0;
  bottom: 0;
}
.plum--tl {
  left: 0;
  top: 0;
}
.plum--tr {
  right: 0;
  top: 0;
}

.plum-sway {
  width: 100%;
  height: 100%;
  transform-origin: var(--anchor);
  // Idle ambient sway, staggered per tree, starting after the entrance.
  animation: plum-sway var(--sway-dur) ease-in-out var(--sway-delay) infinite;
}

.plum-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

@keyframes plum-enter {
  from {
    opacity: 0;
    transform: translate(
        calc(var(--dx) * var(--travel) * var(--rs)),
        calc(var(--dy) * var(--travel) * var(--rs))
      )
      rotate(var(--rot)) scale(var(--scale));
  }
  to {
    opacity: var(--rest-op);
    transform: translate(0, 0) rotate(0deg) scale(1);
  }
}

@keyframes plum-sway {
  0%,
  100% {
    transform: rotate(calc(var(--sway-deg) * -1));
  }
  50% {
    transform: rotate(var(--sway-deg));
  }
}

// ── Responsive: shrink amplitude; drop the far (top) trees on mobile ─────
@media (max-width: 960px) {
  .plum-field {
    --rs: 0.7;
  }
}
@media (max-width: 600px) {
  .plum-field {
    --rs: 0.5;
  }
  .plum--tl,
  .plum--tr {
    display: none;
  }
}

// ── Reduced motion: rest at final state, no entrance, no sway ────────────
@media (prefers-reduced-motion: reduce) {
  .plum {
    animation: none;
    opacity: var(--rest-op);
    transform: none;
  }
  .plum-sway {
    animation: none;
  }
}
</style>
