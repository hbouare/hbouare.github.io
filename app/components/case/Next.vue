<!-- app/components/case/Next.vue -->
<!--
  Next project.

  The old case study dead-ended: one CTA to /contact at the bottom and a
  back link at the top, so reading one project never led to reading another.
  This band is the cheapest possible fix for "make people want to browse
  every project" — it wraps around, so the last project points at the first
  and the sequence never terminates.

  Hover follows the system rule: no shadow tier, so the hairline strengthens
  to full ink (.hairline-interactive) and the arrow advances.
-->
<template>
  <NuxtLink
    :to="localePath(`/projects/${project.slug}`)"
    class="case-next hairline-interactive text-decoration-none"
  >
    <UiEyebrow tone="muted" :rule="false" class="mb-3">
      {{ $t("case.next_project") }}
    </UiEyebrow>

    <div class="case-next-row">
      <UiDisplayTitle tag="p" level="lg" class="case-next-title">
        {{ project.title }}
      </UiDisplayTitle>
      <v-icon size="28" icon="mdi-arrow-right" class="case-next-arrow" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  project: { slug: string; title: string }
}>()

const localePath = useLocalePath()
</script>

<style scoped lang="scss">
.case-next {
  display: block;
  padding: var(--space-huge) 0;
  border-top: 1px solid rgb(var(--v-theme-border));
  border-bottom: 1px solid rgb(var(--v-theme-border));

  &:hover .case-next-arrow,
  &:focus-visible .case-next-arrow {
    transform: translateX(8px);
  }
}

.case-next-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xl);
}

.case-next-title {
  margin: 0;
  color: rgb(var(--v-theme-on-background));
}

.case-next-arrow {
  flex-shrink: 0;
  color: rgb(var(--v-theme-on-background));
  transition: transform 0.3s ease;
}
</style>
