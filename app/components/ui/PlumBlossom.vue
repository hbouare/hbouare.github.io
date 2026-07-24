<!-- app/components/ui/PlumBlossom.vue -->
<!--
  The blog's ambient field: generative "plum" branches growing from the screen
  edges (see app/config/fields/plum.ts for the algorithm and its rationale).
  A thin semantic wrapper over <UiAmbientField> so the blog page keeps reading
  <UiPlumBlossom /> — all shared canvas/lifecycle logic lives in the field engine.
-->
<template>
  <UiAmbientField :field="plumField" />
</template>

<script setup lang="ts">
import { plumField } from "~/config/fields/plum"
</script>
