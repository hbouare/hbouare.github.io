<!-- app/components/case/Outcomes.vue -->
<!--
  The results, hoisted to the top of the case study.

  Previously `impact` rendered sixth of eight sections, in a quiet bordered
  panel, below three prose blocks and two bullet lists — i.e. the strongest
  content on the page sat past the point most visitors stop reading. It is
  now the first thing after the facts strip.

  Class name `.case-impact` is retained: tests/e2e/design-system.spec.ts
  asserts the results block renders, and that guarantee should survive a
  layout change rather than be rewritten around it.
-->
<template>
  <section ref="root" class="case-impact" :aria-label="heading">
    <UiEyebrow :rule="false" class="mb-6">{{ heading }}</UiEyebrow>

    <ol class="case-outcomes">
      <li v-for="(item, i) in items" :key="item" class="case-outcome">
        <span class="case-outcome-num type-micro-cap text-muted" aria-hidden="true">
          {{ String(i + 1).padStart(2, "0") }}
        </span>
        <p class="case-outcome-text type-body-lg">{{ item }}</p>
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import { DURATION, EASE, DISTANCE, STAGGER, SCROLL_START } from "~/config/motion"

defineProps<{
  heading: string
  items: string[]
}>()

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const el = root.value
  if (!el || !motion) return

  // The items stagger against EACH OTHER. The old page faded the whole block
  // as one unit, eleven times over, which read as noise rather than rhythm.
  gsap.fromTo(
    el.querySelectorAll(".case-outcome"),
    { autoAlpha: 0, y: DISTANCE.base },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      stagger: STAGGER.beat,
      clearProps: "transform",
      scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
    },
  )
})
</script>

<style scoped lang="scss">
.case-impact {
  padding: var(--space-huge) 0;
  border-bottom: 1px solid rgb(var(--v-theme-border));
}

.case-outcomes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-xxl);
}

// Each result is introduced by its own hairline: the system's separation
// device, applied per item so the three read as peers rather than as a list.
.case-outcome {
  padding-top: var(--space-md);
  border-top: 1px solid rgb(var(--v-theme-border));
}

.case-outcome-num {
  display: block;
  margin-bottom: var(--space-xs);
}

// Full ink, body-lg: this is the payoff, so it outranks the muted narrative
// prose below it.
.case-outcome-text {
  margin: 0;
  color: rgb(var(--v-theme-on-background));
}

html.js .case-outcome {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  html.js .case-outcome {
    opacity: 1;
  }
}
</style>
