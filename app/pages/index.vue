<template>
  <div>
    <SectionsHeroSection />
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
})

useJsonLd({
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hamed Bouare",
  jobTitle: "Software Architect & Technical Consultant",
  url: "https://hamedbouare.me",
  sameAs: [],
})
</script>
