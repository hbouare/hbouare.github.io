<!-- app/components/sections/KeyFigures.vue -->
<!--
  Key figures with a count-up. SSR renders the FINAL values (a crawler, a
  no-JS reader or a slow hydration never sees "0"); the client rewinds to 0
  only when motion is allowed, then counts up once 30% of the strip is in
  view. ⚠️ Values to be confirmed by the client (see the handoff README).
-->
<template>
  <section ref="root" class="figures cells" :aria-label="$t('home.figures_label')">
    <div v-for="f in figures" :key="f.label" class="figure">
      <div class="figure-value tabular" :class="{ 'figure-value--text': f.text }">{{ display(f) }}</div>
      <div class="label">{{ f.label }}</div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Figure {
  label: string
  value?: number
  suffix?: string
  text?: string
}

const { t } = useI18n()

const figures = computed<Figure[]>(() => [
  { value: 8, suffix: "+", label: t("hero.stat_years") },
  { value: 5, label: t("hero.stat_sectors") },
  { value: 5, label: t("hero.stat_pubs") },
  { text: "FR · UK", label: t("hero.intl_label") },
])

const COUNT_MS = 1600
const progress = ref(1)

const display = (f: Figure) =>
  f.value === undefined ? f.text : `${Math.round(f.value * progress.value)}${f.suffix ?? ""}`

const root = ref<HTMLElement | null>(null)
let io: IntersectionObserver | undefined
let raf = 0

onMounted(() => {
  if (!root.value) return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  progress.value = 0
  io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      io?.disconnect()
      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / COUNT_MS)
        progress.value = 1 - Math.pow(1 - p, 3) // ease-out cubic
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    },
    { threshold: 0.3 },
  )
  io.observe(root.value)
})

onBeforeUnmount(() => {
  io?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.figures {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  border-bottom: 1px solid var(--rule);
}
.figure {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(22px, 3vw, 40px) clamp(20px, 3.4vw, 48px);
}
.figure-value {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: var(--fs-figure);
  line-height: 1;
  letter-spacing: -0.03em;
}
/* "FR · UK" is wider than a number: at the full figure size it wrapped
   onto two lines in a 1440px cell. Smaller, and never broken. */
.figure-value--text {
  font-size: clamp(36px, 4.4vw, 88px);
  white-space: nowrap;
}
</style>
