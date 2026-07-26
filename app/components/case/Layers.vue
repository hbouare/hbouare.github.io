<!-- app/components/case/Layers.vue -->
<!--
  Architecture, told in three plain layers — front-end, back-end, database.
  Each layer is described by what it DOES for this project, not by the stack it
  runs on (the tech lives in the tags; naming Docker/CI/ORMs here only adds
  noise). One quiet, hairline-grouped block: structure at a glance, nothing to
  decode. Any layer left empty is simply dropped.
-->
<template>
  <dl class="case-layers">
    <div v-for="l in layers" :key="l.key" class="case-layer">
      <dt class="case-layer-name type-micro-cap text-muted">{{ l.label }}</dt>
      <dd class="case-layer-desc type-body-md">{{ l.text }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
const props = defineProps<{
  frontend?: string
  backend?: string
  database?: string
}>()

const { t } = useI18n()

// Fixed order top→bottom: what the user touches, then the logic, then storage.
const layers = computed(() =>
  [
    { key: "frontend", label: t("case.layer_frontend"), text: props.frontend },
    { key: "backend", label: t("case.layer_backend"), text: props.backend },
    { key: "database", label: t("case.layer_database"), text: props.database },
  ].filter((l): l is { key: string; label: string; text: string } => !!l.text),
)
</script>

<style scoped lang="scss">
// One grouped block; layers are separated by a shared hairline, so the three
// read as a single stack rather than three loose cards.
.case-layers {
  margin: 0;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 8px;
  overflow: hidden;
  max-width: var(--measure-wide);
}
.case-layer {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-lg);
  padding: var(--space-xl);

  & + & {
    border-top: 1px solid rgb(var(--v-theme-border));
  }

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
}
.case-layer-name {
  padding-top: 0.15rem; // optical align with the first line of the description
}
.case-layer-desc {
  margin: 0;
  color: rgb(var(--v-theme-on-background));
}
</style>
