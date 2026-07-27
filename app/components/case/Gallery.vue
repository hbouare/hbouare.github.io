<!-- app/components/case/Gallery.vue -->
<!--
  Asymmetric screenshot grid. A six-column grid where each tile spans `span`
  columns (from content), so a project composes its own rhythm — one full-width
  feature, then paired shots — instead of a uniform carousel. `align-items:
  center` lets a short desktop shot sit centred beside a taller phone frame.
  Clicking any tile opens the shared lightbox (index offset by the cover).
-->
<template>
  <section class="case-gallery">
    <UiEyebrow :rule="false" class="case-gallery-label">{{ $t("case.gallery") }}</UiEyebrow>
    <div class="gallery-grid">
      <CaseShot
        v-for="(fig, i) in items"
        :key="fig.src"
        class="gallery-item"
        :style="{ '--span': fig.span || 3 }"
        :src="fig.src"
        :alt="fig.alt || fig.caption || ''"
        :device="fig.device || 'browser'"
        :caption="fig.caption"
        @open="$emit('open', offset + i)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Fig {
  src: string
  caption?: string
  alt?: string
  device?: "browser" | "phone"
  span?: number
}
defineProps<{ items: Fig[]; offset: number }>()
defineEmits<{ open: [index: number] }>()
</script>

<style scoped lang="scss">
.case-gallery {
  padding-top: var(--section-pad);
  border-top: 1px solid rgb(var(--v-theme-border));
}
.case-gallery-label {
  margin-bottom: var(--space-xl);
}
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-lg);
  align-items: start;
}
.gallery-item {
  grid-column: span var(--span, 3);
}
@media (max-width: 767px) {
  .gallery-item {
    grid-column: 1 / -1;
  }
}
</style>
