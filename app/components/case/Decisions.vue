<!-- app/components/case/Decisions.vue -->
<!--
  Decisions & trade-offs: problem → choice → what it costs.

  The single biggest content gap in the old case study. It listed features
  and deliverables but never showed an engineering judgement, which is
  precisely what a senior developer or a delivery lead reads a case study
  for. FleetOps already contained one (materialised alerts versus recomputing
  on read) buried mid-paragraph in the architecture prose.

  `consequence` is mandatory in the schema on purpose: a decision presented
  without its cost reads as marketing, and an audience able to judge the
  trade-off will notice the omission.
-->
<template>
  <div ref="root" class="case-decisions">
    <article
      v-for="(decision, i) in decisions"
      :key="decision.choice"
      class="decision"
    >
      <span class="decision-num type-micro-cap text-muted" aria-hidden="true">
        {{ String(i + 1).padStart(2, "0") }}
      </span>

      <dl class="decision-body">
        <dt class="type-micro-cap text-muted">{{ labels.problem }}</dt>
        <dd class="type-body-md">{{ decision.problem }}</dd>

        <dt class="type-micro-cap text-muted">{{ labels.choice }}</dt>
        <dd class="decision-choice type-body-md">{{ decision.choice }}</dd>

        <dt class="type-micro-cap text-muted">{{ labels.consequence }}</dt>
        <dd class="type-body-md">{{ decision.consequence }}</dd>
      </dl>
    </article>
  </div>
</template>

<script setup lang="ts">
import { DURATION, EASE, DISTANCE, STAGGER, SCROLL_START } from "~/config/motion"

defineProps<{
  decisions: { problem: string; choice: string; consequence: string }[]
  labels: { problem: string; choice: string; consequence: string }
}>()

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const el = root.value
  if (!el || !motion) return

  gsap.fromTo(
    el.querySelectorAll(".decision"),
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
.case-decisions {
  display: flex;
  flex-direction: column;
  gap: var(--space-huge);
}

.decision {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: var(--space-md);
  padding-top: var(--space-lg);
  border-top: 1px solid rgb(var(--v-theme-border));

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
}

// Label rail | text. Collapses to stacked label-over-text on phones, where a
// 120px rail would leave the text an unreadable measure.
.decision-body {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: var(--space-sm) var(--space-xl);
  margin: 0;

  dt,
  dd {
    margin: 0;
  }

  dd {
    max-width: 62ch;
    color: rgb(var(--v-theme-muted));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-xxs);

    dd {
      margin-bottom: var(--space-md);
    }
    dd:last-child {
      margin-bottom: 0;
    }
  }
}

// The choice is the sentence being defended — it reads in full ink while the
// problem and its cost stay in the muted narrative tone around it.
// Scoped under .decision-body to out-specify the `dd` rule above rather than
// reaching for !important.
.decision-body .decision-choice {
  color: rgb(var(--v-theme-on-background));
}

html.js .decision {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  html.js .decision {
    opacity: 1;
  }
}
</style>
