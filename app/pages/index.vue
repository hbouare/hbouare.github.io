<template>
  <div>
    <SectionsHeroSection />
    <SectionsMarqueeBar />
    <SectionsAboutSection />
    <SectionsExperienceSection />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead({ titleTemplate: '' })
useSeoMeta({
  title: "Hamed Bouare",
  description: t("hero.subtitle"),
})
</script>
