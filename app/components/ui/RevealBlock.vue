<!-- app/components/ui/RevealBlock.vue -->
<template>
  <div
    ref="el"
    class="reveal-block"
    :class="{ visible: revealed }"
    :style="{ transitionDelay: `${delay}ms` }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ delay?: number }>()
const { el, revealed } = useScrollReveal()
</script>

<style scoped>
.reveal-block {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.reveal-block.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
