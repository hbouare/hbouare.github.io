<!-- app/components/case/Hero.vue -->
<!--
  Case-study opener. Unlike UiSectionHeader (which reveals on scroll-in),
  this is the first thing on the page, so it drives its own on-load timeline
  — the same signature move as the landing hero: masked line reveal on the
  title, supporting beats rising just behind it.

  Before the redesign the case-study title had no reveal at all, so the most
  important entrance on the site was a generic block fade.
-->
<template>
  <header ref="root" class="case-hero">
    <UiEyebrow v-if="context" class="case-beat mb-5">{{ context }}</UiEyebrow>

    <UiDisplayTitle ref="titleEl" tag="h1" level="xxl" class="case-hero-title">
      {{ title }}
    </UiDisplayTitle>

    <p v-if="hook" class="case-hook type-body-lg case-beat mt-8">
      {{ hook }}
    </p>
  </header>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from "vue"
import { SplitText } from "gsap/SplitText"
import { DURATION, EASE, STAGGER, DISTANCE } from "~/config/motion"

defineProps<{
  context?: string
  title: string
  hook?: string
}>()

const root = ref<HTMLElement | null>(null)
const titleEl = ref<ComponentPublicInstance | null>(null)

const { gsap } = useGsap()

useMotion(root, ({ motion, mobile }) => {
  // Reduced motion: the beats rest hidden only under `html.js`, and the
  // stylesheet below already re-reveals them — nothing to do.
  if (!motion) return

  const titleNode = titleEl.value?.$el as HTMLElement | undefined
  const beats = gsap.utils.toArray<HTMLElement>(".case-beat", root.value)
  const tl = gsap.timeline({ defaults: { ease: EASE.out } })

  // Line splitting is desktop/tablet only: recomputing line breaks on every
  // resize is not worth it at phone width, where a single fade reads the
  // same. Same trade-off as the landing hero.
  if (titleNode && !mobile) {
    SplitText.create(titleNode, {
      type: "lines",
      mask: "lines",
      linesClass: "case-hero-line",
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

  // fromTo, not from: the beats rest at opacity 0 in CSS to avoid a flash
  // before the timeline runs, so the end state must be stated explicitly.
  // clearProps is transform-only — clearing opacity would drop them back to
  // that resting 0.
  tl.fromTo(
    beats,
    { autoAlpha: 0, y: DISTANCE.base },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      stagger: STAGGER.beat,
      clearProps: "transform",
    },
    mobile ? 0.1 : 0.25,
  )
})
</script>

<style scoped lang="scss">
.case-hero {
  padding-bottom: var(--space-huge);
}

// The display tier stair-steps from :root; only the measure is local. Capped
// in ch so the title keeps a deliberate 2–3 line break at every size rather
// than running edge to edge.
.case-hero-title {
  max-width: 20ch;
}

// The lead reads in FULL ink. Body prose further down is muted; the hook is
// the one paragraph that outranks it.
.case-hook {
  max-width: 60ch;
  color: rgb(var(--v-theme-on-background));
}

// Beats rest hidden so the timeline has something to reveal. Guarded by
// html.js — without JS the class never lands and everything stays visible.
html.js .case-beat {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  html.js .case-beat {
    opacity: 1;
  }
}
</style>
