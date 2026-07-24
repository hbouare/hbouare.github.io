<!-- app/components/case/Facts.vue -->
<!--
  The scannable facts strip: role · period · team · status.

  This block exists because the previous case study offered no structured
  facts at all — `period` was even declared in the content schema and never
  rendered anywhere. A recruiter scanning for ten seconds now gets the
  shape of the engagement without reading a paragraph.

  Empty facts are filtered out by the caller, so a project with two known
  facts renders two columns rather than two blanks.
-->
<template>
  <dl ref="root" class="case-facts">
    <div v-for="fact in facts" :key="fact.label" class="case-fact">
      <span class="case-fact-rule" aria-hidden="true" />
      <dt class="type-micro-cap text-muted">{{ fact.label }}</dt>
      <dd class="case-fact-value type-body-md">{{ fact.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { DURATION, EASE, STAGGER, DISTANCE, SCROLL_START } from "~/config/motion"

defineProps<{
  facts: { label: string; value: string }[]
}>()

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const el = root.value
  if (!el || !motion) return

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    // Fires immediately when the strip is already above the fold, which is
    // the normal case; the delay lets the hero timeline land first so the
    // two entrances read as one sequence instead of competing.
    delay: 0.35,
    scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
  })

  // The hairline draws itself, then the text rises — the rule reads as the
  // thing that introduces the fact rather than decoration around it.
  tl.fromTo(
    el.querySelectorAll(".case-fact-rule"),
    { scaleX: 0 },
    { scaleX: 1, duration: DURATION.base, stagger: STAGGER.beat },
  ).fromTo(
    el.querySelectorAll(".case-fact > :not(.case-fact-rule)"),
    { autoAlpha: 0, y: DISTANCE.sm },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      stagger: STAGGER.line,
      clearProps: "transform",
    },
    0.15,
  )
})
</script>

<style scoped lang="scss">
// auto-fit rather than a fixed column count: the strip stays correct for
// two facts or four without a per-count modifier class.
.case-facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-xl);
  margin: 0;
  padding: var(--space-xxl) 0;
  border-top: 1px solid rgb(var(--v-theme-border));
  border-bottom: 1px solid rgb(var(--v-theme-border));

  @media (max-width: 599px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-lg);
  }
}

.case-fact {
  dt,
  dd {
    margin: 0;
  }
}

.case-fact-rule {
  display: block;
  width: 28px;
  height: 1px;
  margin-bottom: var(--space-sm);
  background: rgb(var(--v-theme-on-background));
  transform-origin: left center;
}

.case-fact-value {
  margin-top: var(--space-xxs);
  color: rgb(var(--v-theme-on-background));
}

// Resting state for the draw-in, guarded by html.js so the rules are always
// present without scripting; reduced motion restores them too.
html.js .case-fact-rule {
  transform: scaleX(0);
}
@media (prefers-reduced-motion: reduce) {
  html.js .case-fact-rule {
    transform: scaleX(1);
  }
}
</style>
