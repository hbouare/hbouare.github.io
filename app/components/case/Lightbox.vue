<!-- app/components/case/Lightbox.vue -->
<!--
  Shared lightbox for all case-study shots (cover + gallery). Page-owned state:
  the page passes the ordered shot list and v-model:index; -1 means closed.
  Keyboard: Esc closes, ←/→ navigate, Tab is trapped inside the dialog. Body
  scroll locks while open; focus moves to the overlay on open.
-->
<template>
  <Teleport to="body">
    <Transition name="lb">
      <div
        v-if="open"
        ref="overlay"
        class="lb"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('case.gallery')"
        tabindex="-1"
        @click.self="close"
        @keydown="onKey"
      >
        <button class="lb-btn lb-close" :aria-label="$t('case.lb_close')" @click="close">
          <v-icon icon="mdi-close" size="24" />
        </button>

        <button
          v-if="shots.length > 1"
          class="lb-btn lb-prev"
          :aria-label="$t('case.lb_prev')"
          @click="go(-1)"
        >
          <v-icon icon="mdi-chevron-left" size="32" />
        </button>

        <figure class="lb-figure">
          <img class="lb-img" :src="cur.src" :alt="cur.caption || ''" />
          <figcaption v-if="cur.caption" class="lb-cap mt-4 Atype-caption">
            {{ cur.caption }}
          </figcaption>
        </figure>

        <button
          v-if="shots.length > 1"
          class="lb-btn lb-next"
          :aria-label="$t('case.lb_next')"
          @click="go(1)"
        >
          <v-icon icon="mdi-chevron-right" size="32" />
        </button>

        <span v-if="shots.length > 1" class="lb-count type-micro-cap">
          {{ index + 1 }} / {{ shots.length }}
        </span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Shot {
  src: string
  caption?: string
}
const props = defineProps<{ shots: Shot[]; index: number }>()
const emit = defineEmits<{ "update:index": [n: number] }>()

const open = computed(() => props.index >= 0 && props.index < props.shots.length)
const cur = computed(() => props.shots[props.index] ?? { src: "" })
const overlay = ref<HTMLElement | null>(null)

const close = () => emit("update:index", -1)
const go = (d: number) => {
  if (!props.shots.length) return
  emit("update:index", (props.index + d + props.shots.length) % props.shots.length)
}
const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") close()
  else if (e.key === "ArrowLeft") go(-1)
  else if (e.key === "ArrowRight") go(1)
  else if (e.key === "Tab" && overlay.value) {
    const btns = [...overlay.value.querySelectorAll<HTMLElement>("button")]
    if (!btns.length) return
    e.preventDefault()
    const i = btns.indexOf(document.activeElement as HTMLElement)
    const n = (i + (e.shiftKey ? -1 : 1) + btns.length) % btns.length
    btns[n]?.focus()
  }
}

watch(open, async (v) => {
  if (import.meta.client) document.body.style.overflow = v ? "hidden" : ""
  if (v) {
    await nextTick()
    overlay.value?.focus()
  }
})
onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ""
})
</script>

<style scoped lang="scss">
.lb {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vw;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(4px);
}
.lb-figure {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  max-width: 92vw;
}
.lb-img {
  display: block;
  max-width: 92vw;
  max-height: 82vh;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}
.lb-cap {
  text-align: center;
  color: rgba(255, 255, 255, 0.78);
}
.lb-btn {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}
.lb-btn:hover,
.lb-btn:focus-visible {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.6);
}
.lb-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.lb-close {
  top: 4vw;
  right: 4vw;
}
.lb-prev {
  left: 2vw;
  top: 50%;
  transform: translateY(-50%);
}
.lb-next {
  right: 2vw;
  top: 50%;
  transform: translateY(-50%);
}
.lb-count {
  position: absolute;
  bottom: 4vw;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 1.5px;
}

.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.25s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .lb-enter-active,
  .lb-leave-active {
    transition: none;
  }
  .lb {
    backdrop-filter: none;
  }
}
</style>
