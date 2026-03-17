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

useHead({ titleTemplate: "" })
useSeoMeta({
  title: "Hamed Bouare",
  description: t("hero.subtitle"),
})

useJsonLd({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hamed Bouare",
  jobTitle: "Data Engineer & Full-Stack Developer",
  url: "https://hamedbouare.me",
  sameAs: [],
})
</script>
