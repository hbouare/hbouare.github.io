<!-- app/components/ui/WaveField.vue -->
<!--
  The research page's ambient field: faint interfering wavefronts (see
  app/config/fields/waves.ts). A thin semantic wrapper over <UiAmbientField>,
  parallel to <UiPlumBlossom> — the phenomenon differs, the treatment (fixed,
  faint, monochrome, reduced-motion-aware) is shared by the field engine.
-->
<template>
  <UiAmbientField :field="waveField" />
</template>

<script setup lang="ts">
import { waveField } from "~/config/fields/waves"
</script>
