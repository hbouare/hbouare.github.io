<template>
  <section class="hero-section">
    <!-- Background ghost text -->
    <div class="hero-bg-text font-playfair" aria-hidden="true">
      {{ isDark ? "Build" : "Create" }}
    </div>

    <v-container class="hero-inner" fluid>
      <v-row align="center" class="min-h-screen py-24">
        <!-- LEFT -->
        <v-col cols="12" md="7" class="hero-left">
          <p class="hero-tag font-mono text-primary section-label animate-1">
            {{ $t("hero.tag") }}
          </p>
          <h1 class="hero-title font-playfair animate-2">
            {{ $t("hero.title_1") }}<br />
            <em class="text-primary">{{ $t("hero.title_em") }}</em
            ><br />
            {{ $t("hero.title_3") }}
          </h1>
          <p class="hero-subtitle font-mono animate-3">
            {{ $t("hero.subtitle") }}
          </p>

          <div class="d-flex align-center ga-4 mt-10 animate-4 flex-wrap">
            <v-btn
              :to="localePath('/projects')"
              color="primary"
              variant="flat"
              rounded="0"
              size="large"
              class="font-mono text-uppercase hero-cta"
            >
              {{ $t("hero.cta_projects") }}
            </v-btn>
            <v-btn
              :to="localePath('/contact')"
              color="primary"
              variant="flat"
              rounded="0"
              size="large"
              class="font-mono text-uppercase hero-cta"
            >
              {{ $t("hero.cta_contact") }}
            </v-btn>
          </div>

          <!-- International pills -->
          <div class="animate-5 mt-12">
            <p class="font-mono text-muted section-label mb-3">
              {{ $t("hero.intl_label") }}
            </p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="country in countries"
                :key="country"
                variant="outlined"
                color="primary"
                rounded="0"
                class="font-mono"
                size="small"
              >
                {{ country }}
              </v-chip>
            </div>
          </div>
        </v-col>

        <!-- RIGHT: stats -->
        <v-col cols="12" md="5" class="d-none d-md-flex justify-end animate-4">
          <v-row ref="statsRef" class="stats-grid" no-gutters>
            <v-col v-for="(stat, index) in stats" :key="stat.key" cols="6">
              <v-card class="stat-box pa-5" color="surface" variant="outlined">
                <div class="stat-number font-playfair text-primary">
                  <template v-if="stat.numeric !== undefined">
                    <span>{{ statsStarted ? animatedValues[index] : 0 }}</span>
                    <span v-if="stat.suffix" class="stat-suffix">{{ stat.suffix }}</span>
                  </template>
                  <template v-else>
                    {{ stat.value }}
                  </template>
                </div>
                <div class="stat-label font-mono text-muted mt-1">
                  {{ $t(`hero.${stat.key}`) }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Scroll indicator -->
    <div class="scroll-hint font-mono text-muted animate-5" aria-hidden="true">
      <span class="scroll-line" />
      Scroll
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()
const localePath = useLocalePath()

const { t } = useI18n()

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
const statsRef = ref<HTMLElement | null>(null)
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
  const el = statsRef.value?.$el ?? statsRef.value
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
  scroll-snap-align: start;
}
.hero-bg-text {
  position: absolute;
  top: 50%;
  left: -10px;
  transform: translateY(-50%);
  font-size: clamp(100px, 17vw, 240px);
  font-weight: 900;
  font-style: italic;
  color: transparent;
  -webkit-text-stroke: 1px rgba(var(--v-theme-primary), 0.06);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}
.hero-inner {
  position: relative;
  z-index: 1;
  padding: 0 40px;
}
.min-h-screen {
  min-height: 100vh;
}
.py-24 {
  padding-top: 5.5rem;
  padding-bottom: 4.5rem;
}

.hero-tag {
  margin-bottom: 1.5rem;
}
.hero-title {
  font-size: clamp(48px, 6vw, 90px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.025em;
  em {
    font-style: italic;
  }
}
.hero-subtitle {
  font-size: 0.82rem;
  line-height: 1.9;
  color: rgb(var(--v-theme-muted));
  margin-top: 1.5rem;
  max-width: 440px;
}
.hero-cta {
  letter-spacing: 0.12em;
}

// Stats — border-color handled by global .v-card--variant-outlined override
.stats-grid {
  width: 320px;
}
.stat-box {
  transition: border-color 0.3s;
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.45);
  }
}
.stat-number {
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
}
.stat-suffix {
  font-size: 0.65em;
  vertical-align: super;
  margin-left: 1px;
}
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

// Scroll hint
.scroll-hint {
  position: absolute;
  bottom: 36px;
  right: 50px;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
  writing-mode: vertical-lr;
}
.scroll-line {
  display: block;
  width: 1px;
  height: 44px;
  background: rgb(var(--v-theme-primary));
  animation: scrollPulse 2s ease-in-out infinite;
}

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
