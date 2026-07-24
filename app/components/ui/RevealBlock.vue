<!-- app/components/ui/RevealBlock.vue -->
<!--
  Scroll reveal. Public API is unchanged (`:delay` in ms) — every existing
  call site keeps working.

  GSAP owns the tween; an IntersectionObserver owns the trigger.

  ScrollTrigger was used for both, and it lost a race that matters: it caches
  each trigger's start/end in scroll pixels when it is created, so a large
  programmatic jump landing before its first update can leave a `once`
  trigger un-fired forever. The block then sits at its CSS resting
  `opacity: 0` — present in the DOM, indexed by crawlers, invisible to the
  visitor, with an empty console. An observer has no cached geometry and
  reports the CURRENT intersection state on its first callback after
  `observe()`, so hydration and scrolling can arrive in either order.

  Nothing is lost by the swap: this component creates one trigger per element
  and never used ScrollTrigger.batch.

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
import { DURATION, EASE, DISTANCE, SCROLL_START_MARGIN } from "~/config/motion"

const props = withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })

const root = ref<HTMLElement | null>(null)
const shown = ref(false)

const { gsap } = useGsap()

// The observer is not a GSAP object, so useMotion's revert does not reach it.
// Disconnected on unmount and again at the top of every build run, since the
// callback re-runs when a media condition changes.
let observer: IntersectionObserver | null = null
const stopObserving = () => {
  observer?.disconnect()
  observer = null
}
onUnmounted(stopObserving)

useMotion(root, ({ motion }) => {
  stopObserving()

  const el = root.value
  if (!el) return

  // Reduced motion: no travel, no scroll dependency — reveal immediately.
  if (!motion) {
    shown.value = true
    gsap.set(el, { clearProps: "all" })
    return
  }

  let started = false
  const reveal = () => {
    if (started) return
    started = true
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: DISTANCE.base },
      {
        autoAlpha: 1,
        y: 0,
        duration: DURATION.base,
        ease: EASE.out,
        delay: props.delay / 1000,
        // Hand the element back to CSS once revealed so nothing keeps an
        // inline transform that could interfere with layout or hover states.
        onComplete: () => {
          shown.value = true
          gsap.set(el, { clearProps: "transform,opacity,visibility" })
        },
      },
    )
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      stopObserving()
      reveal()
    },
    { rootMargin: SCROLL_START_MARGIN },
  )
  observer.observe(el)
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
