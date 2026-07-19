<!-- app/components/ui/SectionHeader.vue -->
<!--
  Standard section opener: eyebrow + display title.

  Self-animating: on scroll-in the eyebrow fades up and the title does the
  masked line reveal (the hero's signature move). Callers therefore must NOT
  wrap this in a UiRevealBlock — that would double the entrance.

  Props are otherwise unchanged from before, so existing call sites keep
  working once their redundant reveal wrapper is removed.

  Note on `lineEm`: the old design carried emphasis with a gold italic. The
  system is black-and-white by rule, so emphasis is now tone (muted vs
  on-background) — the only hierarchy device available without a hue.
-->
<template>
  <div ref="root">
    <UiEyebrow class="section-eyebrow mb-4">{{ label }}</UiEyebrow>
    <UiDisplayTitle tag="h2" level="xl" reveal>
      {{ line1 }}<br >
      <span class="text-muted">{{ lineEm }}</span>
      <template v-if="line3"><br >{{ line3 }}</template>
    </UiDisplayTitle>
  </div>
</template>

<script setup lang="ts">
import { DURATION, EASE, DISTANCE, SCROLL_START } from "~/config/motion"

defineProps<{
  label: string
  line1: string
  lineEm: string
  line3?: string
}>()

const root = ref<HTMLElement | null>(null)
const { gsap } = useGsap()

useMotion(root, ({ motion }) => {
  const eyebrow = root.value?.querySelector(".section-eyebrow")
  if (!eyebrow || !motion) return

  gsap.fromTo(
    eyebrow,
    { autoAlpha: 0, y: DISTANCE.sm },
    {
      autoAlpha: 1,
      y: 0,
      duration: DURATION.base,
      ease: EASE.out,
      scrollTrigger: { trigger: root.value, start: SCROLL_START, once: true },
    },
  )
})
</script>
