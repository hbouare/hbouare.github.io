<!-- app/components/ui/SectionHeader.vue -->
<template>
  <div>
    <p class="font-mono text-primary section-label mb-4">{{ label }}</p>
    <component :is="tag" class="section-title font-playfair">
      {{ line1 }}<br>
      <em class="text-primary">{{ lineEm }}</em>
      <template v-if="line3"><br>{{ line3 }}</template>
    </component>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    line1: string
    lineEm: string
    line3?: string
    /** Heading level — defaults to h2; use h1 for the main heading of a page. */
    tag?: string
  }>(),
  { tag: "h2" },
)
</script>

<style scoped lang="scss">
.section-title {
  font-size: clamp(32px, 4vw, 56px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -0.02em;
  em { font-style: italic; }
}
</style>