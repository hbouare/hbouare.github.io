<template>
  <div>
    <SectionsHeroSection />
    <SectionsReferencesStrip />
    <SectionsKeyFigures />
    <SectionsAboutSection />
    <SectionsExperienceSection />
    <UiCtaBand
      :title="$t('home.cta_title')"
      :text="$t('home.cta_text')"
      :button="$t('home.cta_button')"
      :to="localePath('/contact')"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({ titleTemplate: "" })
useSeoMeta({
  title: "Hamed Bouare",
  description: t("hero.subtitle"),
  ogTitle: `Hamed Bouare — ${t("seo.role")}`,
  ogDescription: t("hero.subtitle"),
})

useJsonLd({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hamed Bouare",
  jobTitle: "Software Architect · AI & Data Engineering",
  url: "https://hamedbouare.me",
  sameAs: [
    "https://github.com/hbouare",
    "https://www.linkedin.com/in/hamed-bouare-phd-0a1981112/",
  ],
})
</script>
