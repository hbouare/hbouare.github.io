<!-- app/components/ui/SectionHeader.vue -->
<!--
  Standard section opener: eyebrow + display title.

  Props are unchanged from the previous implementation so the five existing
  call sites keep working; only the rendering was rebuilt on the shared
  primitives.

  Note on `lineEm`: the old design carried this emphasis with a gold italic.
  The system is black-and-white by rule, so emphasis is now carried by tone
  (muted vs on-background) — the only hierarchy device available without
  introducing a hue.
-->
<template>
  <div>
    <UiEyebrow class="mb-4">{{ label }}</UiEyebrow>
    <UiDisplayTitle tag="h2" level="xl">
      {{ line1 }}<br >
      <span class="text-muted">{{ lineEm }}</span>
      <template v-if="line3"><br >{{ line3 }}</template>
    </UiDisplayTitle>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  line1: string
  lineEm: string
  line3?: string
}>()
</script>
