<template>
  <section class="hero-section">
    <v-container class="hero-inner px-6 px-md-10" fluid>
      <v-row align="center" class="min-h-screen py-24">
        <!-- LEFT -->
        <v-col cols="12" md="7" class="hero-left">
          <UiEyebrow class="hero-tag animate-1">
            {{ $t("hero.tag") }}
          </UiEyebrow>
          <UiDisplayTitle tag="h1" level="xxl" class="animate-2">
            {{ $t("hero.title_1") }}<br />
            <span class="text-muted">{{ $t("hero.title_em") }}</span
            ><br />
            {{ $t("hero.title_3") }}
          </UiDisplayTitle>
          <p class="hero-subtitle type-body-lg text-muted animate-3">
            {{ $t("hero.subtitle") }}
          </p>

          <!--
            The system allows a single ghost pill per band. All three
            destinations are kept (none of them is redundant), but only the
            primary one takes the pill; the other two drop to text links so
            the band still reads as having one CTA.
          -->
          <div class="d-flex align-center ga-4 mt-10 animate-4 flex-wrap">
            <v-btn :to="localePath('/projects')" size="large">
              {{ $t("hero.cta_projects") }}
            </v-btn>
            <v-btn :to="localePath('/contact')" variant="text" size="large">
              {{ $t("hero.cta_contact") }}
            </v-btn>
            <v-btn
              :href="`/cv/cv-hamed-bouare-${locale}.pdf`"
              download
              variant="text"
              size="large"
            >
              {{ $t("hero.cta_cv") }}
            </v-btn>
          </div>

          <!-- International pills -->
          <div class="animate-5 mt-12">
            <UiEyebrow tone="muted" class="mb-3">
              {{ $t("hero.intl_label") }}
            </UiEyebrow>
            <div class="d-flex flex-wrap ga-2">
              <v-chip v-for="country in countries" :key="country">
                {{ country }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <!-- RIGHT: stats -->
        <v-col cols="12" md="5" class="d-none d-md-flex justify-end animate-4">
          <v-row ref="statsRef" class="stats-grid" no-gutters>
            <v-col v-for="(stat, index) in stats" :key="stat.key" cols="6">
              <!--
                No `color` prop: on an outlined card Vuetify applies it to
                the text and border, not the background. `color="surface"`
                was painting the label in the surface colour — invisible
                against the canvas.
              -->
              <v-card class="stat-box hairline-interactive pa-5" variant="outlined">
                <div class="stat-number">
                  <template v-if="stat.numeric !== undefined">
                    <span>{{ statsStarted ? animatedValues[index] : 0 }}</span>
                    <span v-if="stat.suffix" class="stat-suffix">{{
                      stat.suffix
                    }}</span>
                  </template>
                  <template v-else>
                    <svg
                      class="infinity-svg"
                      :class="{ 'infinity-animate': statsStarted }"
                      viewBox="0 0 60 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        class="infinity-path"
                        d="M30 15C30 15 38 3 47 3C52.5 3 57 7.5 57 15C57 22.5 52.5 27 47 27C38 27 30 15 30 15C30 15 22 3 13 3C7.5 3 3 7.5 3 15C3 22.5 7.5 27 13 27C22 27 30 15 30 15Z"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                      />
                    </svg>
                  </template>
                </div>
                <div class="stat-label type-micro-cap text-muted mt-1">
                  {{ $t(`hero.${stat.key}`) }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Scroll indicator -->
    <div class="scroll-hint type-micro-cap text-muted animate-5" aria-hidden="true">
      <span class="scroll-line" />
      Scroll
    </div>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()

const { t, locale } = useI18n()

const countries = computed(() => [
  t("hero.country_france"),
  t("hero.country_uk"),
  t("hero.country_algeria"),
])

const stats = [
  { value: "8+", key: "stat_years", numeric: 8, suffix: "+" },
  { value: "3", key: "stat_countries", numeric: 3 },
  { value: "20+", key: "stat_projects", numeric: 20, suffix: "+" },
  { value: "∞", key: "stat_curiosity" },
]

// Animated counter
const statsRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const statsStarted = ref(false)
const animatedValues = ref<number[]>(stats.map(() => 0))

const animateCountUp = () => {
  const duration = 2500
  const startTime = performance.now()
  const targets = stats.map((s) => s.numeric ?? 0)

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic

    animatedValues.value = targets.map((target) => Math.round(target * eased))

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

onMounted(() => {
  // statsRef is bound to <v-row>, so at runtime it is a component instance
  // whose root element hangs off $el — not an HTMLElement directly.
  const raw = statsRef.value
  const el = raw && "$el" in raw ? (raw.$el as HTMLElement) : raw
  if (!el) return

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && !statsStarted.value) {
        statsStarted.value = true
        animateCountUp()
        observer.disconnect()
      }
    },
    { threshold: 0.2 },
  )

  observer.observe(el)
})
</script>

<style scoped lang="scss">
.hero-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
.hero-inner {
  position: relative;
  z-index: 1;
}
.min-h-screen {
  min-height: 100vh;
}

// Vertical rhythm follows the shared section token — the three duplicated
// breakpoint blocks that used to live here are gone.
.py-24 {
  padding-top: var(--section-pad);
  padding-bottom: var(--section-pad);
}

// Size comes from the micro-cap tier; only the rhythm is local.
.hero-tag {
  margin-bottom: 1.5rem;
}
.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 440px;
}

// Stats — border colour and hover come from .hairline-interactive.
.stats-grid {
  width: 320px;
}
.stat-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-number {
  font-family: var(--font-display);
  font-size: var(--type-display-lg);
  font-weight: 700;
  line-height: 1;
}
.stat-suffix {
  font-size: 0.65em;
  vertical-align: super;
  margin-left: 1px;
}

// Infinity SVG draw animation
.infinity-svg {
  height: 1em;
  width: 2em;
  vertical-align: middle;
  display: inline-block;
}
.infinity-path {
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
}
.infinity-animate .infinity-path {
  animation: drawInfinity 2.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
@keyframes drawInfinity {
  to {
    stroke-dashoffset: 0;
  }
}
// Scroll hint — the micro-cap tier supplies size and tracking.
.scroll-hint {
  position: absolute;
  bottom: 36px;
  right: 50px;
  display: flex;
  align-items: center;
  gap: 10px;
  writing-mode: vertical-lr;
}
.scroll-line {
  display: block;
  width: 1px;
  height: 44px;
  background: rgb(var(--v-theme-on-background));
  animation: scrollPulse 2s ease-in-out infinite;
}

// No per-component type breakpoints: every tier used here (display-xxl,
// micro-cap, body-lg) stair-steps from the :root tokens in main.scss.

// Entrance animations
@for $i from 1 through 5 {
  .animate-#{$i} {
    animation: fadeUp 0.8s ease forwards #{$i * 0.2}s;
    opacity: 0;
  }
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes scrollPulse {
  0%,
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(0.5);
    opacity: 0.3;
  }
}
</style>
