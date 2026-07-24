<template>
  <div class="contact-page">
    <UiPlumBlossom />
    <SectionsContactSection />
  </div>
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

<style scoped lang="scss">
// Positioned wrapper so the fixed ambient tree field (z-index 0) sits behind
// the contact content, which stacks above it (same pattern as the blog page).
.contact-page {
  position: relative;
  min-height: 100vh;
}
</style>
