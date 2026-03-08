<template>
  <SectionsContactSection />
</template>

<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: "Contact",
  description: t("contact.desc"),
  ogTitle: "Contact - Hamed Bouare",
  ogDescription: t("contact.desc"),
})
</script>
