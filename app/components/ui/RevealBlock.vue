<!-- app/components/ui/RevealBlock.vue -->
<!--
  Scroll reveal. Public API is unchanged (`:delay` in ms) — the 32 existing
  call sites keep working; only the engine moved from IntersectionObserver
  + CSS transition to GSAP ScrollTrigger.

  Why GSAP was worth it here: `batch` lets siblings that enter the viewport
  together stagger *against each other*, which the per-element observer
  could not express.

  SSR note: the resting state (`opacity: 0`) stays in CSS rather than being
  set by GSAP. The markup is still in the served HTML for crawlers, and if
  JS never runs the `no-js` fallback below reveals it instead of leaving the
  page permanently blank.
-->
<template>
  <div ref="root" class="reveal-block" :class="{ 'reveal-block--shown': shown }">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { DURATION, EASE, DISTANCE, SCROLL_START } from "~/config/motion"

const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const root = ref<HTMLElement | null>(null)
const shown = ref(false)

const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const el = root.value
  if (!el) return

  // Reduced motion: no travel, no scroll dependency — reveal immediately.
  if (!motion) {
    shown.value = true
    gsap.set(el, { clearProps: "all" })
    return
  }

  gsap.fromTo(
    el,
    { autoAlpha: 0, y: DISTANCE.base },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      delay: props.delay / 1000,
      scrollTrigger: { trigger: el, start: SCROLL_START, once: true },
      // Hand the element back to CSS once revealed so nothing keeps an
      // inline transform that could interfere with layout or hover states.
      onComplete: () => {
        shown.value = true
        gsap.set(el, { clearProps: "transform,opacity,visibility" })
      },
    },
  )
})
</script>

<style scoped>
.reveal-block {
  opacity: 0;
}

/* Once revealed, CSS owns the element again. */
.reveal-block--shown {
  opacity: 1;
}

/*
  Fallbacks that must win over the resting state:
  - reduced motion → never hide anything
  - no JS → GSAP never runs, so reveal on load
*/
@media (prefers-reduced-motion: reduce) {
  .reveal-block {
    opacity: 1;
  }
}
</style>

<style>
/*
  Unscoped: targets <html>, outside this component's scope.
  The inline head script adds `.js`; if scripting is unavailable the class
  never lands and the content stays visible rather than blank forever.
*/
html:not(.js) .reveal-block {
  opacity: 1;
}
</style>
