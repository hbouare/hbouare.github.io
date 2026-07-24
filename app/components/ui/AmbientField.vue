<!-- app/components/ui/AmbientField.vue -->
<!--
  The one presentational shell for every ambient background field. It renders a
  single fixed, full-viewport, behind-content canvas and hands all logic to
  useAmbientField; the `field` prop chooses the phenomenon (a generator factory
  from app/config/fields). Decorative only — aria-hidden, pointer-events none.

  The CSS here IS the shared visual contract: fixed to the viewport (content
  scrolls over it), clipped so a stray stroke never makes a scrollbar, z-index 0
  so the page's positioned content paints on top.
-->
<template>
  <div ref="root" class="ambient-field" aria-hidden="true">
    <canvas ref="canvas" class="ambient-canvas" />
  </div>
</template>

<script setup lang="ts">
import type { FieldFactory } from "~/composables/useAmbientField"

const props = defineProps<{ field: FieldFactory }>()

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)

useAmbientField(root, canvas, props.field)
</script>

<style scoped lang="scss">
.ambient-field {
  position: fixed; // anchored to the viewport — the page scrolls over the field
  inset: 0;
  overflow: hidden; // clips anything past the edge → never a scrollbar
  pointer-events: none;
  z-index: 0; // behind the page content (which sits in a later, positioned box)
}

.ambient-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
