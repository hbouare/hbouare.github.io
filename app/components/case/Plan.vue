<!-- app/components/case/Plan.vue -->
<!--
  The technical plan: the architecture as an ordered chain of layers.

  This replaces reading a ~90-word single paragraph to work out what talks to
  what. The layers come from the `stack` array in frontmatter, so the diagram
  and its detail column are the SAME data and cannot drift apart.

  Why not an image or an imported SVG diagram: the design system has no
  photography tier and no raster media anywhere, the page's LCP is currently
  text (worth protecting), and diagram images do not restyle themselves for
  light mode or reflow on a phone. Hairline boxes plus a 1px connector are
  the system's own vocabulary, cost nothing, and stay legible at 390px.

  The connector scales in on scroll — the page's one signature flourish.
  Below 768px it is hidden: the numbered boxes already carry the sequence,
  and a vertical rule threading a single-column stack reads as noise.
-->
<template>
  <ol ref="root" class="case-plan">
    <li v-for="(layer, i) in layers" :key="layer.layer" class="plan-layer">
      <div class="plan-node-col">
        <div class="plan-node">
          <span class="plan-num type-micro-cap text-muted">
            {{ String(i + 1).padStart(2, "0") }}
          </span>
          <span class="plan-name type-micro-cap">{{ layer.layer }}</span>
        </div>
        <span
          v-if="i < layers.length - 1"
          class="plan-link"
          aria-hidden="true"
        />
      </div>

      <p class="plan-detail type-body-md">{{ layer.detail }}</p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { DURATION, EASE, DISTANCE, STAGGER, SCROLL_START } from "~/config/motion"

defineProps<{
  layers: { layer: string; detail: string }[]
}>()

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const el = root.value
  if (!el || !motion) return

  const tl = gsap.timeline({
    defaults: { ease: EASE.out },
    scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
  })

  tl.fromTo(
    el.querySelectorAll(".plan-layer"),
    { autoAlpha: 0, y: DISTANCE.sm },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      stagger: STAGGER.beat,
      clearProps: "transform",
    },
  ).fromTo(
    el.querySelectorAll(".plan-link"),
    { scaleY: 0 },
    { scaleY: 1, duration: DURATION.base, stagger: STAGGER.beat },
    0.2,
  )
})
</script>

<style scoped lang="scss">
.case-plan {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.plan-layer {
  display: grid;
  grid-template-columns: minmax(150px, 220px) 1fr;
  gap: var(--space-xxl);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
}

// The node column stretches to the row height so the connector can simply
// take the leftover space — no per-row height maths, and the chain stays
// unbroken whatever length the detail text is.
.plan-node-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plan-node {
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid rgb(var(--v-theme-border));
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.plan-name {
  color: rgb(var(--v-theme-on-background));
}

.plan-link {
  flex: 1;
  min-height: var(--space-xxl);
  width: 1px;
  background: rgb(var(--v-theme-border));
  transform-origin: top center;

  @media (max-width: 767px) {
    display: none;
  }
}

.plan-detail {
  margin: 0;
  padding-bottom: var(--space-xxl);
  max-width: 62ch;
  color: rgb(var(--v-theme-muted));

  @media (max-width: 767px) {
    padding-bottom: var(--space-xl);
  }
}
.plan-layer:last-child .plan-detail {
  padding-bottom: 0;
}

html.js {
  .plan-layer {
    opacity: 0;
  }
  .plan-link {
    transform: scaleY(0);
  }
}
@media (prefers-reduced-motion: reduce) {
  html.js {
    .plan-layer {
      opacity: 1;
    }
    .plan-link {
      transform: scaleY(1);
    }
  }
}
</style>
