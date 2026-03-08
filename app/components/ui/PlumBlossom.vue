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

  // Each pending step: a function that draws one tiny segment and may queue more
  type Step = () => void
  const pending: Step[] = []
  const prevPending: Step[] = []

  const polar = (x: number, y: number, r: number, theta: number): [number, number] => {
    return [x + r * Math.cos(theta), y + r * Math.sin(theta)]
  }

  const step = (
    x: number,
    y: number,
    angle: number,
    depth: number,
  ) => {
    // Out of bounds — stop
    if (x < -20 || x > W() + 20 || y < -20 || y > H() + 20) return
    // Max depth
    if (depth > 120) return

    const color = getColor()
    const len = rand(4, 7)
    const [nx, ny] = polar(x, y, len, angle)

    // Draw one small segment
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(nx, ny)
    ctx.strokeStyle = `rgba(${color}, 0.5)`
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.stroke()

    // Blossom dot at deeper branches
    if (depth > 5 && Math.random() < 0.08) {
      ctx.beginPath()
      ctx.arc(nx, ny, rand(1, 2.5), 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${color}, 0.6)`
      ctx.fill()
    }

    // Continue growing — queue next segments
    const nextDepth = depth + 1

    // Main continuation
    if (Math.random() < 0.85) {
      pending.push(() =>
        step(nx, ny, angle + rand(-0.2, 0.2), nextDepth),
      )
    }

    // Branch split
    if (Math.random() < 0.3) {
      const dir = Math.random() > 0.5 ? 1 : -1
      pending.push(() =>
        step(nx, ny, angle + dir * rand(0.3, 1.0), nextDepth),
      )
    }
  }

  // Seed initial trees from all edges
  const seed = () => {
    // Bottom
    pending.push(() => step(rand(0, W() * 0.3), H(), -Math.PI / 2 + rand(-0.2, 0.2), 0))
    pending.push(() => step(rand(W() * 0.7, W()), H(), -Math.PI / 2 + rand(-0.2, 0.2), 0))
    // Top
    pending.push(() => step(rand(W() * 0.2, W() * 0.8), 0, Math.PI / 2 + rand(-0.2, 0.2), 0))
    // Sides
    pending.push(() => step(0, rand(H() * 0.2, H() * 0.7), rand(-0.3, 0.3), 0))
    pending.push(() => step(W(), rand(H() * 0.3, H() * 0.8), Math.PI + rand(-0.3, 0.3), 0))
  }

  // Spawn a single new tree from a random edge
  const spawnOne = () => {
    const edge = Math.floor(rand(0, 4))
    if (edge === 0)
      pending.push(() => step(rand(0, W()), H(), -Math.PI / 2 + rand(-0.3, 0.3), 0))
    else if (edge === 1)
      pending.push(() => step(rand(0, W()), 0, Math.PI / 2 + rand(-0.3, 0.3), 0))
    else if (edge === 2)
      pending.push(() => step(0, rand(0, H()), rand(-0.4, 0.4), 0))
    else
      pending.push(() => step(W(), rand(0, H()), Math.PI + rand(-0.4, 0.4), 0))
  }

  seed()

  // Animation: each frame, execute a few pending steps.
  // When all current steps are done, swap buffers so new branches
  // generated this "wave" become the next wave — gives a continuous feel.
  let spawnCounter = 0

  const frame = () => {
    if (stopped) return

    // Process a small batch each frame for smooth progressive growth
    const batch = Math.min(10, pending.length)

    if (batch > 0) {
      for (let i = 0; i < batch; i++) {
        const fn = pending.shift()!
        fn()
      }
    } else if (prevPending.length > 0) {
      // Move previous wave into pending
      pending.push(...prevPending.splice(0))
    }

    spawnCounter++
    // Spawn new tree every ~3 seconds (180 frames at 60fps)
    if (spawnCounter >= 180) {
      spawnCounter = 0
      spawnOne()
    }

    animId = requestAnimationFrame(frame)
  }

  frame()

  const onResize = () => {
    resize()
    ctx.clearRect(0, 0, W(), H())
    pending.length = 0
    prevPending.length = 0
    spawnCounter = 0
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