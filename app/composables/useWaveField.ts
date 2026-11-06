// app/composables/useWaveField.ts
//
// The hero's signature interaction: a seismogram field. Horizontal traces are
// displaced by the sum of travelling wave fronts emitted by an ambient source,
// the pointer and clicks. Ported from `waveSim()` in
// design_handoff_portfolio_refonte/Portfolio.dc.html — keep the constants in
// step with the README if either changes.
//
// Client-only by construction (called from onMounted). Colours come from the
// CSS tokens (--wave-trace, --accent) and are re-read when data-theme flips.

interface Source {
  x: number
  y: number
  t: number
  a: number
}

interface WaveFieldOptions {
  /** Element whose text is overwritten each frame with the t / sources readout. */
  readout?: () => HTMLElement | null | undefined
  /** prefers-reduced-motion: one frozen front at t = 1.7s, no interaction. */
  still: boolean
}

const MOBILE_MAX = 760
const AMBIENT_EVERY = 2.8 // s
const LIFETIME = 5.5 // s
const MAX_SOURCES = 18
const STILL_T = 1.7 // s
const HIGHLIGHT = 0.28 // |d| above which a segment is drawn in accent

export function createWaveField(canvas: HTMLCanvasElement, opts: WaveFieldOptions) {
  const ctx = canvas.getContext("2d")
  const host = canvas.parentElement
  if (!ctx || !host) return { destroy: () => {} }

  let W = 0
  let H = 0
  let dpr = 1
  const src: Source[] = []
  let cur: { x: number; y: number } | null = null
  let lp: { x: number; y: number } | null = null
  let lastEmit = -1
  let lastAmb = -10
  let t = 0
  const T0 = performance.now()

  // ── Palette from tokens ────────────────────────────────────────────
  let pal = { trace: "", accent: "" }
  const readPalette = () => {
    const cs = getComputedStyle(canvas)
    pal = {
      trace: cs.getPropertyValue("--wave-trace").trim(),
      accent: cs.getPropertyValue("--accent").trim(),
    }
  }
  readPalette()

  // ── Pointer ────────────────────────────────────────────────────────
  const loc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect()
    const s = canvas.offsetWidth / (r.width || 1)
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s }
  }
  const onMove = (e: PointerEvent) => {
    const p = loc(e)
    cur = p
    if (!lp || (Math.hypot(p.x - lp.x, p.y - lp.y) > 36 && t - lastEmit > 0.12)) {
      src.push({ x: p.x, y: p.y, t, a: 0.45 })
      lp = p
      lastEmit = t
    }
  }
  const onDown = (e: PointerEvent) => {
    const p = loc(e)
    src.push({ x: p.x, y: p.y, t, a: 1.4 })
  }
  const onLeave = () => {
    cur = null
  }

  // ── Frame ──────────────────────────────────────────────────────────
  const frame = (now: number) => {
    const w = canvas.offsetWidth
    const hh = canvas.offsetHeight
    if (w !== W || hh !== H) {
      W = w
      H = hh
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = W * dpr
      canvas.height = H * dpr
    }
    if (!W) return

    const mobile = W < MOBILE_MAX
    t = opts.still ? STILL_T : (now - T0) / 1000
    const ax = W * (mobile ? 0.72 : 0.78)
    const ay = H * (mobile ? 0.24 : 0.5)

    if (opts.still) {
      src.length = 0
      src.push({ x: ax, y: ay, t: 0, a: 1 })
    } else if (t - lastAmb > AMBIENT_EVERY) {
      src.push({ x: ax, y: ay, t, a: 1 })
      lastAmb = t
    }
    while (!opts.still && src.length && t - src[0]!.t > LIFETIME) src.shift()
    if (src.length > MAX_SOURCES) src.splice(0, src.length - MAX_SOURCES)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    const sp = mobile ? 11 : 15 // line spacing
    const step = mobile ? 5 : 7 // sample step
    const C = mobile ? 160 : 230 // front speed, px/s
    const wid = mobile ? 24 : 34 // front width
    const k = mobile ? 0.14 : 0.1 // carrier wavenumber
    const w2 = 2 * wid * wid
    const lim = 3 * wid

    const base = new Path2D()
    const hi = new Path2D()
    for (let y0 = sp * 0.5; y0 < H + sp; y0 += sp) {
      let px = 0
      let py = y0
      let pd = 0
      for (let x = 0; x <= W + step; x += step) {
        let d = 0
        for (const s of src) {
          const dx = x - s.x
          const dy = y0 - s.y
          const r = Math.sqrt(dx * dx + dy * dy)
          const age = t - s.t
          const dr = r - C * age
          if (dr > -lim && dr < lim) {
            d +=
              (s.a * Math.exp((-dr * dr) / w2) * Math.cos(dr * k) * Math.exp(-age / 2.4)) /
              (1 + r / 420)
          }
        }
        const y = y0 + d * sp * 1.1
        if (x === 0) base.moveTo(x, y)
        else {
          base.lineTo(x, y)
          if (Math.abs(d) > HIGHLIGHT || Math.abs(pd) > HIGHLIGHT) {
            hi.moveTo(px, py)
            hi.lineTo(x, y)
          }
        }
        px = x
        py = y
        pd = d
      }
    }
    ctx.lineWidth = 1
    ctx.strokeStyle = pal.trace
    ctx.stroke(base)
    ctx.lineWidth = 1.4
    ctx.strokeStyle = pal.accent
    ctx.stroke(hi)

    // Ambient source marker.
    ctx.fillStyle = pal.accent
    ctx.beginPath()
    ctx.arc(ax, ay, 3, 0, Math.PI * 2)
    ctx.fill()

    // Pointer crosshair, 18px.
    if (cur) {
      ctx.strokeStyle = pal.accent
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cur.x - 9, cur.y)
      ctx.lineTo(cur.x + 9, cur.y)
      ctx.moveTo(cur.x, cur.y - 9)
      ctx.lineTo(cur.x, cur.y + 9)
      ctx.stroke()
    }

    const ro = opts.readout?.()
    if (ro) {
      ro.textContent = `t = ${t.toFixed(2).padStart(6, "0")} s · ${src.length} source${src.length > 1 ? "s" : ""}`
    }
  }

  // ── Scheduling: one rAF loop, paused off-screen ────────────────────
  let raf = 0
  let visible = false
  const loop = (now: number) => {
    frame(now)
    raf = visible ? requestAnimationFrame(loop) : 0
  }
  const redraw = () => requestAnimationFrame(frame)

  const io = new IntersectionObserver(([e]) => {
    visible = !!e?.isIntersecting
    if (opts.still) return
    if (visible && !raf) raf = requestAnimationFrame(loop)
  })
  io.observe(canvas)

  // Still mode draws on demand: on resize and on theme change.
  const ro = opts.still ? new ResizeObserver(redraw) : null
  ro?.observe(canvas)

  const themeObserver = new MutationObserver(() => {
    readPalette()
    if (opts.still) redraw()
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  })

  if (!opts.still) {
    host.addEventListener("pointermove", onMove)
    host.addEventListener("pointerdown", onDown)
    host.addEventListener("pointerleave", onLeave)
  }

  return {
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      visible = false
      io.disconnect()
      ro?.disconnect()
      themeObserver.disconnect()
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerdown", onDown)
      host.removeEventListener("pointerleave", onLeave)
    },
  }
}

/** Mounts the wave field on `canvas` for the lifetime of the component. */
export function useWaveField(
  canvas: Ref<HTMLCanvasElement | null>,
  readout?: () => HTMLElement | null | undefined,
) {
  let field: ReturnType<typeof createWaveField> | undefined
  onMounted(() => {
    if (!canvas.value) return
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    field = createWaveField(canvas.value, { readout, still })
  })
  onBeforeUnmount(() => field?.destroy())
}
