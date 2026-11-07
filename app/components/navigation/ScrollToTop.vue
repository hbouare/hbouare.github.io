<!-- app/components/navigation/ScrollToTop.vue -->
<!--
  "Back to top", restored from master: a round button, bottom right, shown
  once the page is scrolled past 400px. No scroll listener: an observer
  watches a 400px sentinel at the top of the page. Hidden with visibility,
  so it also leaves the tab order. Focus moves to <main> on use, since the
  button disappears under the pointer.
-->
<template>
  <div ref="sentinel" class="stt-sentinel" aria-hidden="true" />
  <button
    type="button"
    class="stt"
    :class="{ 'is-shown': shown }"
    :aria-label="$t('nav.scroll_top')"
    @click="toTop"
  >
    <span aria-hidden="true">↑</span>
  </button>
</template>

<script setup lang="ts">
const sentinel = ref<HTMLElement | null>(null)
const shown = ref(false)

let observer: IntersectionObserver | undefined
onMounted(() => {
  if (!sentinel.value || typeof IntersectionObserver === "undefined") return
  observer = new IntersectionObserver(([entry]) => {
    shown.value = !entry?.isIntersecting
  })
  observer.observe(sentinel.value)
})
onBeforeUnmount(() => observer?.disconnect())

const toTop = () => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  document.getElementById("main")?.focus({ preventScroll: true })
}
</script>

<style scoped>
.stt-sentinel {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 400px;
  pointer-events: none;
}

.stt {
  position: fixed;
  right: var(--gutter);
  bottom: 24px;
  z-index: 15;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  font-family: var(--f-mono);
  font-size: 16px;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--rule);
  border-radius: var(--radius-pill);
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(8px);
  transition:
    opacity 0.3s var(--ease-out),
    transform 0.3s var(--ease-out),
    visibility 0.3s,
    border-color 0.2s;
}
.stt.is-shown {
  opacity: 1;
  visibility: visible;
  transform: none;
}
.stt:hover {
  border-color: var(--ink);
}

@media print {
  .stt {
    display: none;
  }
}
</style>
