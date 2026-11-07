<!-- app/components/ui/WaveField.vue -->
<!--
  Full-bleed canvas for the hero's wave field. Mount it as
  <ClientOnly><LazyUiWaveField /></ClientOnly> so the simulation ships in its
  own chunk and never runs on the server. Pointer events are read from the
  parent element, so the parent is the interactive area.
-->
<template>
  <canvas ref="canvas" class="wave-field" aria-hidden="true" />
</template>

<script setup lang="ts">
const props = defineProps<{
  /** Element that receives the "t = … s · n sources" readout. */
  readout?: HTMLElement | null
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
useWaveField(canvas, () => props.readout)
</script>

<style scoped>
.wave-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* Keeps the title legible: the field fades in from the left. */
  -webkit-mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 35%, #000 62%);
  mask-image: linear-gradient(90deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.3) 35%, #000 62%);
}
@media (max-width: 759.98px) {
  .wave-field {
    -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 28%, rgba(0, 0, 0, 0.12) 58%);
    mask-image: linear-gradient(180deg, #000 0%, #000 28%, rgba(0, 0, 0, 0.12) 58%);
  }
}
</style>
