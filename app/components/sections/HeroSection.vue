<template>
  <section ref="heroRoot" class="hero-section">
    <v-container class="hero-inner px-6 px-md-10" fluid>
      <v-row align="center" class="hero-fill section-v-pad">
        <!-- LEFT -->
        <v-col cols="12" md="7" class="hero-left">
          <UiEyebrow class="hero-tag hero-beat">
            {{ $t("hero.tag") }}
          </UiEyebrow>
          <UiDisplayTitle ref="titleEl" tag="h1" level="xxl" class="hero-title">
            {{ $t("hero.title_1") }}<br />
            <span class="text-muted">{{ $t("hero.title_em") }}</span
            ><br />
            {{ $t("hero.title_3") }}
          </UiDisplayTitle>
          <p class="hero-subtitle type-body-lg text-muted hero-beat">
            {{ $t("hero.subtitle") }}
          </p>

          <!--
            The system allows a single ghost pill per band. All three
            destinations are kept (none of them is redundant), but only the
            primary one takes the pill; the other two drop to text links so
            the band still reads as having one CTA.
          -->
          <div class="d-flex align-center ga-4 mt-10 hero-beat flex-wrap">
            <v-btn :to="localePath('/projects')"  size="large">
              {{ $t("hero.cta_projects") }}
            </v-btn>
            <v-btn :to="localePath('/contact')"  size="large">
              {{ $t("hero.cta_contact") }}
            </v-btn>
            <v-btn
              :href="`/cv/cv-hamed-bouare-${locale}.pdf`"
              download
              
              size="large"
            >
              {{ $t("hero.cta_cv") }}
            </v-btn>
          </div>

          <!-- International pills -->
          <div class="hero-beat mt-12">
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
        <v-col cols="12" md="5" class="d-none d-md-flex justify-end hero-beat">
          <v-row ref="statsRef" class="stats-grid" no-gutters>
            <v-col v-for="(stat, index) in stats" :key="stat.key" cols="12">
              <!--
                No `color` prop: on an outlined card Vuetify applies it to
                the text and border, not the background. `color="surface"`
                was painting the label in the surface colour — invisible
                against the canvas.
              -->
              <v-card class="stat-box hairline-interactive pa-5" variant="outlined">
                <div class="stat-number">
                  <span>{{ statsStarted ? animatedValues[index] : 0 }}</span>
                  <span v-if="stat.suffix" class="stat-suffix">{{
                    stat.suffix
                  }}</span>
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
    <div class="scroll-hint type-micro-cap text-muted hero-beat" aria-hidden="true">
      <span class="scroll-line" />
      Scroll
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { SplitText } from "gsap/SplitText"
import { DURATION, EASE, STAGGER, DISTANCE } from "~/config/motion"

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
]

const statsRef = ref<HTMLElement | ComponentPublicInstance | null>(null)
const statsStarted = ref(false)
const animatedValues = ref<number[]>(stats.map(() => 0))

/** Ease-out count-up. GSAP drives the tick so it obeys the global ticker. */
const animateCountUp = () => {
  const targets = stats.map((s) => s.numeric ?? 0)
  const proxy = { p: 0 }
  gsap.to(proxy, {
    p: 1,
    duration: 2.5,
    ease: EASE.out,
    onUpdate: () => {
      animatedValues.value = targets.map((v) => Math.round(v * proxy.p))
    },
  })
}

const unwrap = (r: HTMLElement | ComponentPublicInstance | null) =>
  r && "$el" in r ? (r.$el as HTMLElement) : r

const heroRoot = ref<HTMLElement | null>(null)
const titleEl = ref<ComponentPublicInstance | null>(null)

const { gsap, ScrollTrigger } = useGsap()

useMotion(heroRoot, ({ motion, mobile }) => {
  const statsEl = unwrap(statsRef.value)
  const titleNode = unwrap(titleEl.value)
  const targets = stats.map((s) => s.numeric ?? 0)

  // ── Reduced motion: reveal the final counter values immediately, with no
  // scroll dependency, and skip every reveal. Everything else already rests
  // at its final state in the DOM.
  if (!motion) {
    statsStarted.value = true
    animatedValues.value = targets
    return
  }

  // ── Count-up: fire when the stats grid enters view (immediately if it is
  // already above the fold). Hidden on mobile, so guarded by statsEl.
  if (statsEl) {
    ScrollTrigger.create({
      trigger: statsEl,
      start: "top 90%",
      once: true,
      onEnter: () => {
        if (statsStarted.value) return
        statsStarted.value = true
        animateCountUp()
      },
    })
  }

  const beats = gsap.utils.toArray<HTMLElement>(".hero-beat")

  const tl = gsap.timeline({ defaults: { ease: EASE.out } })

  // Display title: a masked line reveal — each line rises out from behind
  // its own clipped edge. This is the hero's signature moment.
  //
  // On mobile the line split is skipped: recomputing line breaks on every
  // resize is expensive, and the whole-title fade reads just as well at
  // that size. SplitText.create's onSplit re-runs on font load and resize,
  // so line breaks are always correct; the instance is reverted by
  // matchMedia on cleanup.
  // The SplitText instance is created inside this matchMedia scope, so it is
  // reverted automatically on cleanup — no manual revert needed.
  if (titleNode && !mobile) {
    SplitText.create(titleNode, {
      type: "lines",
      mask: "lines",
      linesClass: "hero-line",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: DURATION.slow,
          ease: EASE.out,
          stagger: STAGGER.line,
        }),
    })
  } else if (titleNode) {
    tl.fromTo(
      titleNode,
      { autoAlpha: 0, y: DISTANCE.base },
      { autoAlpha: 1, y: 0, duration: DURATION.base },
      0,
    )
  }

  // Supporting beats rise in just behind the title. fromTo (not from):
  // the beats rest at opacity 0 in CSS to avoid a pre-reveal flash, so the
  // end state must be stated explicitly rather than read from the DOM.
  tl.fromTo(
    beats,
    { autoAlpha: 0, y: DISTANCE.base },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      stagger: STAGGER.beat,
      // Clear ONLY transform: the inline opacity:1 must persist, otherwise
      // the element falls back to the CSS resting `opacity: 0` and vanishes.
      clearProps: "transform",
    },
    mobile ? 0.1 : 0.25,
  )
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
// Forces the row to fill the viewport so `align="center"` centres the hero
// content vertically. Named semantically (not `.min-h-screen`) so it is not
// mistaken for a Vuetify utility — Vuetify ships no min-height helper.
// Vertical rhythm comes from the shared `.section-v-pad` token in main.scss
// (the local `.py-24` duplicate is gone).
.hero-fill {
  min-height: 100vh;
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

// ── Entrance (GSAP) ────────────────────────────────────────────────────
// The staggered CSS keyframes were replaced by an orchestrated timeline in
// script. Beats rest hidden so there is no flash before the timeline runs;
// they are revealed by gsap.from(), which also clears these inline styles.
// Guards: no-JS and reduced-motion keep everything visible.
html.js .hero-beat {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  html.js .hero-beat {
    opacity: 1;
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
