<!-- app/components/case/Access.vue -->
<!--
  Source access.

  Direct repository links are gone by design: access is granted personally,
  on request, rather than being open to anyone who lands on the page. The
  block is therefore unconditional — every project shows the same offer, so
  the page no longer contradicts the privacy note on /projects (which said
  the code was private while one case study still linked straight to GitHub).

  Wording is framed as an OFFER, not a restriction: "I provide read access,
  or a guided walkthrough" rather than "the source code is private". Same
  fact, and the second version reads as a missing feature.

  Class name `.case-encart` is retained — tests/e2e/design-system.spec.ts
  asserts the case study always offers a way forward from this block.
-->
<template>
  <aside class="case-encart section-surface pa-6 py-sm-8 px-sm-9">
    <UiEyebrow :rule="false" class="mb-4">{{ $t("case.access_title") }}</UiEyebrow>

    <p class="case-encart-text type-body-md text-muted">
      {{ $t("case.access_note") }}
    </p>

    <v-btn
      :to="localePath('/contact')"
      size="large"
      append-icon="mdi-arrow-right"
      class="mt-8"
    >
      {{ $t("case.access_cta") }}
    </v-btn>
  </aside>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped lang="scss">
.case-encart {
  border: 1px solid rgb(var(--v-theme-border));
}
.case-encart-text {
  max-width: 62ch;
}
</style>
