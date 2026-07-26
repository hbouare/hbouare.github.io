<!-- app/pages/services.vue -->
<template>
  <SectionsServicesSection />
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: "Services",
  description: t("services.meta_desc"),
  ogTitle: "Services - Hamed Bouare",
  ogDescription: t("services.meta_desc"),
})
</script>
