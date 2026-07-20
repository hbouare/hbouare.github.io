<!-- app/components/ui/PlumBlossom.vue -->
<!--
  Ambient branches that frame the blog page from its corners — but instead of
  a one-shot entrance you might miss on load, they DRAW THEMSELVES as you
  read: each branch's growth is scrubbed by scroll position, root to tips.
  The page builds its frame the deeper you scroll.

  Why scroll-linked rather than time-based: the site's identity is
  deterministic and "engineered", so tying the motion to a real signal (how
  far you've read) is more coherent — and more distinctive — than an
  arbitrary timed reveal. Top branches draw early, bottom branches as you
  near the footer, so the frame assembles top-to-bottom.

  The branch geometry is still the generative canvas art, generated ONCE.
  Only what fraction of it is painted changes on scroll — a trivial redraw.
  A whisper of parallax (foreground drifts more than background) adds depth.

  Every tunable lives in the TREES config below (no magic values scattered).
-->
<template>
  <div ref="fieldRoot" class="plum-field" aria-hidden="true">
    <div
      v-for="t in TREES"
      :key="t.pos"
      :ref="(el) => registerWrap(t.pos, el)"
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
const { gsap, ScrollTrigger } = useGsap()

// ── Config — the single source of every tunable ─────────────────────────
// Depth: bottom corners are foreground (bigger, more opaque, more parallax);
// top corners are background (smaller, dimmer). growStart/growEnd are the
// window of overall scroll progress [0..1] across which each branch draws;
// base is how much is already drawn at scroll top (a hint before you move).
type Pos = "bl" | "br" | "tl" | "tr"
interface Tree {
  pos: Pos
  anchor: string // transform-origin (the rooted corner)
  size: number // display size in px at --rs = 1
  op: number // resting opacity (depth)
  growStart: number // scroll progress where this branch starts drawing
  growEnd: number // scroll progress where it is fully drawn
  base: number // fraction already drawn at scroll top
  parallax: number // vertical parallax amplitude in px (depth)
  swayDur: number
  swayDeg: number
}

// Growth windows are tuned so each branch draws WHILE it is on screen: the
// top pair (anchored at the page top) grows in the first sliver of scroll,
// before it leaves the viewport; the bottom pair grows as the footer nears.
const TREES: Tree[] = [
  { pos: "tl", anchor: "0% 0%", size: 240, op: 0.4, growStart: 0, growEnd: 0.13, base: 0.28, parallax: 10, swayDur: 9000, swayDeg: 0.6 },
  { pos: "tr", anchor: "100% 0%", size: 240, op: 0.4, growStart: 0, growEnd: 0.15, base: 0.28, parallax: 10, swayDur: 9600, swayDeg: 0.6 },
  { pos: "bl", anchor: "0% 100%", size: 300, op: 0.55, growStart: 0.5, growEnd: 0.9, base: 0, parallax: 22, swayDur: 7000, swayDeg: 0.8 },
  { pos: "br", anchor: "100% 100%", size: 300, op: 0.55, growStart: 0.55, growEnd: 0.94, base: 0, parallax: 22, swayDur: 7800, swayDeg: 0.8 },
]

/** Logical space the branch geometry lives in. Fixed, so the canvas never
 *  needs regenerating on resize — CSS scales it, shapes stay stable. */
const DRAW_SIZE = 360

const styleFor = (t: Tree) => ({
  "--size": `${t.size}px`,
  "--rest-op": String(t.op),
  "--sway-dur": `${t.swayDur}ms`,
  "--sway-deg": `${t.swayDeg}deg`,
  "--anchor": t.anchor,
})

// ── Geometry: generate once, paint a growing fraction on scroll ──────────
// Each segment carries [t0, t1]: its start/end position along the branch,
// normalised 0 (root) → 1 (furthest tip). Painting up to progress p draws
// every segment with t0 < p, clipping the one straddling p to a growing tip.
interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
  w: number
  a: number
  t0: number
  t1: number
}
interface Blossom {
  x: number
  y: number
  r: number
  a: number
  t: number
}

const canvases = new Map<Pos, HTMLCanvasElement>()
const wraps = new Map<Pos, HTMLElement>()
const geometry = new Map<Pos, { segs: Segment[]; blossoms: Blossom[] }>()
const fieldRoot = ref<HTMLElement | null>(null)

const registerCanvas = (pos: Pos, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLCanvasElement) canvases.set(pos, el)
}
const registerWrap = (pos: Pos, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLElement) wraps.set(pos, el)
}

const rand = (a: number, b: number) => Math.random() * (b - a) + a
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

const ROOTS: Record<Pos, { x: number; y: number; angle: number }> = {
  bl: { x: 0, y: DRAW_SIZE, angle: -Math.PI / 4 },
  br: { x: DRAW_SIZE, y: DRAW_SIZE, angle: (-3 * Math.PI) / 4 },
  tl: { x: 0, y: 0, angle: Math.PI / 4 },
  tr: { x: DRAW_SIZE, y: 0, angle: (3 * Math.PI) / 4 },
}

/** Deterministic tapering trunk that drifts inward and occasionally forks
 *  into a shorter side branch. `lenFromRoot` accumulates so each segment can
 *  later be ordered by distance from the corner (the growth order). */
const grow = (
  segs: Segment[],
  blossoms: Blossom[],
  startX: number,
  startY: number,
  startAngle: number,
  steps: number,
  width: number,
  lenFromRoot: number,
) => {
  let x = startX
  let y = startY
  let angle = startAngle
  let w = width
  let acc = lenFromRoot

  for (let i = 0; i < steps; i++) {
    const len = rand(6, 10)
    const nx = x + len * Math.cos(angle)
    const ny = y + len * Math.sin(angle)
    if (nx < -20 || nx > DRAW_SIZE + 20 || ny < -20 || ny > DRAW_SIZE + 20) break

    const a = Math.max(0.06, 0.42 - i * 0.012)
    segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: Math.max(0.35, w), a, t0: acc, t1: acc + len })

    if (i > steps * 0.5 && Math.random() < 0.08) {
      blossoms.push({ x: nx, y: ny, r: rand(1, 2.2), a: a * 0.85, t: acc + len })
    }

    if (i > 3 && Math.random() < 0.16) {
      const dir = Math.random() > 0.5 ? 1 : -1
      grow(segs, blossoms, nx, ny, angle + dir * rand(0.4, 0.85), Math.floor(steps * rand(0.3, 0.55)), w * 0.7, acc + len)
    }

    x = nx
    y = ny
    acc += len
    angle += rand(-0.13, 0.13)
    w *= 0.97
  }
}

const generate = (pos: Pos) => {
  const root = ROOTS[pos]
  const segs: Segment[] = []
  const blossoms: Blossom[] = []
  const trunks = Math.floor(rand(2, 4))
  for (let i = 0; i < trunks; i++) {
    grow(segs, blossoms, root.x, root.y, root.angle + rand(-0.35, 0.35), Math.floor(rand(20, 28)), 1, 0)
  }
  // Normalise growth params to [0,1] per tree so `progress` is comparable.
  let max = 0
  for (const s of segs) if (s.t1 > max) max = s.t1
  max = max || 1
  for (const s of segs) {
    s.t0 /= max
    s.t1 /= max
  }
  for (const b of blossoms) b.t /= max
  geometry.set(pos, { segs, blossoms })
}

const inkColor = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--v-theme-primary").trim() || "255,255,255"

/** Paint the branch up to `progress` (0..1) in the current ink colour. */
const render = (pos: Pos, progress: number) => {
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
    if (s.t0 >= progress) continue
    // Clip the segment straddling `progress` to a growing tip.
    const f = s.t1 <= progress ? 1 : (progress - s.t0) / (s.t1 - s.t0)
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x1 + (s.x2 - s.x1) * f, s.y1 + (s.y2 - s.y1) * f)
    ctx.strokeStyle = `rgba(${color}, ${s.a})`
    ctx.lineWidth = s.w
    ctx.stroke()
  }
  for (const b of geo.blossoms) {
    if (b.t > progress) continue
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${color}, ${b.a})`
    ctx.fill()
  }
}

/** Per-tree growth fraction for a given overall scroll progress. */
const growthOf = (t: Tree, scroll: number) => {
  const local = clamp01((scroll - t.growStart) / (t.growEnd - t.growStart))
  return t.base + (1 - t.base) * local
}

let scrollProgress = 0
const paintAll = () => TREES.forEach((t) => render(t.pos, growthOf(t, scrollProgress)))

useMotion(fieldRoot, ({ motion }) => {
  TREES.forEach((t) => generate(t.pos))

  // Reduced motion: draw the finished branches once, no scrub, no parallax.
  if (!motion) {
    scrollProgress = 1
    paintAll()
    return
  }

  const setY = new Map<Pos, (v: number) => void>()
  TREES.forEach((t) => {
    const wrap = wraps.get(t.pos)
    if (wrap) setY.set(t.pos, gsap.quickSetter(wrap, "y", "px") as (v: number) => void)
  })

  ScrollTrigger.create({
    trigger: fieldRoot.value ?? undefined,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => {
      scrollProgress = self.progress
      for (const t of TREES) {
        render(t.pos, growthOf(t, scrollProgress))
        // Parallax: foreground drifts more; centred so it's ~0 mid-scroll.
        setY.get(t.pos)?.((scrollProgress - 0.5) * -2 * t.parallax)
      }
    },
  })

  // Initial paint (base growths). The scrub's onUpdate takes over on the
  // first scroll / ScrollTrigger refresh.
  paintAll()
})

// Re-paint (same geometry, new ink) on theme flip — a discrete event.
// Declared at setup root, NOT inside useMotion's callback: matchMedia re-runs
// that callback on breakpoint changes, which would stack duplicate watchers.
watch(isDark, () => paintAll())
</script>

<style scoped lang="scss">
.plum-field {
  position: absolute;
  inset: 0;
  overflow: hidden; // clips anything past the edges → no horizontal scrollbar
  pointer-events: none;
  z-index: 0;
  color: rgb(var(--v-theme-primary));
  --rs: 1; // responsive master knob: scales every tree at once
}

.plum {
  position: absolute;
  width: calc(var(--size) * var(--rs));
  height: calc(var(--size) * var(--rs));
  opacity: var(--rest-op);
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
  // Idle ambient sway, staggered per tree — almost imperceptible.
  animation: plum-sway var(--sway-dur) ease-in-out infinite;
}

.plum-canvas {
  display: block;
  width: 100%;
  height: 100%;
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

// ── Reduced motion: static, no sway (growth is drawn full by the script) ─
@media (prefers-reduced-motion: reduce) {
  .plum-sway {
    animation: none;
  }
}
</style>
