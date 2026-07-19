<!-- app/components/ui/DisplayTitle.vue -->
<!--
  Display-tier heading. Always uppercase, always 700, always positively
  tracked — the system's most recognizable typographic moment.

  Sizing comes from the `--type-display-*` custom properties, which
  stair-step 80 → 60 → 48 → 40 in ONE place (main.scss `:root`). Components
  must never re-declare display sizes or their breakpoints.
-->
<template>
  <component :is="tag" :class="`type-display-${level}`">
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Semantic level — pick for document outline, not for size. */
    tag?: string
    /** Visual tier: xxl = hero, xl = section opener, lg = sub-section. */
    level?: "xxl" | "xl" | "lg"
  }>(),
  { tag: "h2", level: "xl" },
)
</script>
