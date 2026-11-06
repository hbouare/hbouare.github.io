<!-- app/components/ui/PlumField.vue -->
<!--
  The blog's ambient tree (/blog and articles). A fixed, full-viewport canvas behind the page:
  z-index -1 within .app-shell (isolated, see layouts/default.vue) puts it
  above the page background but under every block that paints its own
  (header, code blocks, CTA band). Mount it as
  <ClientOnly><LazyUiPlumField /></ClientOnly>. Decorative: aria-hidden,
  pointer-events none.
-->
<template>
  <canvas ref="canvas" class="plum-field" aria-hidden="true" />
</template>

<script setup lang="ts">
const canvas = ref<HTMLCanvasElement | null>(null)
usePlumField(canvas)
</script>

<style scoped>
.plum-field {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}
</style>
