<!-- app/components/ui/PlumBlossom.vue -->
<template>
  <canvas ref="canvas" class="plum-canvas" />
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()

const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
  const el = canvas.value
  if (!el) return

  const ctx = el.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  let stopped = false
  let animId = 0

  const resize = () => {
    const parent = el.parentElement!
    const w = parent.clientWidth
    const h = parent.clientHeight
    el.width = w * dpr
    el.height = h * dpr
    el.style.width = `${w}px`
    el.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  resize()

  const W = () => el.width / dpr
  const H = () => el.height / dpr
  const rand = (a: number, b: number) => Math.random() * (b - a) + a

  const getColor = () => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--v-theme-primary')
      .trim()
    return raw || '200,169,110'
  }

  type Step = () => void
  // One queue per corner so they all grow in parallel
  const queues: Step[][] = [[], [], [], []]

  const polar = (x: number, y: number, r: number, theta: number): [number, number] => {
    return [x + r * Math.cos(theta), y + r * Math.sin(theta)]
  }

  const step = (
    queue: Step[],
    x: number,
    y: number,
    angle: number,
    depth: number,
  ) => {
    if (x < -20 || x > W() + 20 || y < -20 || y > H() + 20) return
    if (depth > 160) return

    const color = getColor()
    const len = rand(3, 6)
    const [nx, ny] = polar(x, y, len, angle)

    const alpha = Math.max(0.05, 0.35 - depth * 0.002)

    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.strokeStyle = `rgba(${color}, ${alpha})`
    ctx.lineWidth = Math.max(0.3, 0.8 - depth * 0.004)
    ctx.lineCap = 'round'
    ctx.stroke()

    if (depth > 20 && Math.random() < 0.04) {
      ctx.beginPath()
      ctx.arc(nx, ny, rand(0.8, 1.8), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${color}, ${alpha * 0.8})`
      ctx.fill()
    }

    const nextDepth = depth + 1

    if (Math.random() < 0.88) {
      queue.push(() =>
        step(queue, nx, ny, angle + rand(-0.15, 0.15), nextDepth),
      )
    }

    if (Math.random() < 0.2) {
      const dir = Math.random() > 0.5 ? 1 : -1
      queue.push(() =>
        step(queue, nx, ny, angle + dir * rand(0.25, 0.7), nextDepth),
      )
    }
  }

  const seed = () => {
    const w = W()
    const h = H()
    const corners = [
      { x: 0, y: 0, angle: Math.PI / 4 },
      { x: w, y: 0, angle: (3 * Math.PI) / 4 },
      { x: 0, y: h, angle: -Math.PI / 4 },
      { x: w, y: h, angle: (-3 * Math.PI) / 4 },
    ]

    corners.forEach((corner, qi) => {
      // Offset only inward (toward center) so branches never start out of bounds
      const ox = corner.x === 0 ? rand(0, 20) : rand(-20, 0)
      const oy = corner.y === 0 ? rand(0, 20) : rand(-20, 0)
      const count = Math.floor(rand(2, 4))
      for (let i = 0; i < count; i++) {
        const cx = corner.x + ox + rand(0, 10)
        const cy = corner.y + oy + rand(0, 10)
        const a = corner.angle + rand(-0.3, 0.3)
        queues[qi].push(() => step(queues[qi], cx, cy, a, 0))
      }
    })
  }

  seed()

  let lastTime = 0
  const frameInterval = 1000 / 40

  const frame = (timestamp: number) => {
    if (stopped) return

    if (timestamp - lastTime >= frameInterval) {
      lastTime = timestamp
      // Process 1 step from each corner every frame — perfectly synchronized
      for (const queue of queues) {
        if (queue.length > 0) {
          const fn = queue.shift()!
          fn()
        }
      }
    }

    animId = requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)

  const onResize = () => {
    resize()
    ctx.clearRect(0, 0, W(), H())
    for (const q of queues) q.length = 0
    seed()
  }

  window.addEventListener('resize', onResize)

  onUnmounted(() => {
    stopped = true
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', onResize)
  })
})
</script>

<style scoped>
.plum-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
