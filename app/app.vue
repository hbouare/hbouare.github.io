<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Page transitions are plain CSS (`.page-*` in base.css, configured in
// nuxt.config): a 250ms fade + 8px translate. CSS cannot hang the router the
// way a JS hook that forgets done() can, and the global reduced-motion rule
// neutralises it.

const { syncTheme } = useAppTheme()
useThemeDomSync()

// SEO: hreflang, canonical, og:locale, html lang.
const head = useLocaleHead()
useHead(() => ({
  htmlAttrs: {
    lang: head.value.htmlAttrs?.lang,
    // i18n types dir as a plain string; useHead wants the narrower union.
    dir: head.value.htmlAttrs?.dir as "auto" | "ltr" | "rtl" | undefined,
  },
  link: [...(head.value.link || [])],
  meta: [...(head.value.meta || [])],
}))

// Share preview, one per language (public/og-image*.png, 1200×630).
const { locale } = useI18n()
const ogImage = computed(() =>
  `https://hamedbouare.me/og-image${locale.value === "en" ? "-en" : ""}.png`,
)
useSeoMeta({ ogImage, twitterImage: ogImage })

onMounted(() => {
  syncTheme()
  // Readiness marker: e2e tests wait on it before measuring.
  document.documentElement.classList.add("hydrated")

  // bfcache restore, another tab's choice, or an OS change (when no choice
  // is saved) all re-run the same sync.
  window.addEventListener("pageshow", (e) => e.persisted && syncTheme())
  window.addEventListener("storage", (e) => e.key === "portfolio-theme" && syncTheme())
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncTheme)
})
</script>
