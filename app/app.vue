<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { syncTheme } = useAppTheme()

// SEO: hreflang, canonical, og:locale, html lang.
// `lang`, `dir` and `seo` all default to true — the old
// addDirAttribute/addSeoAttributes options were renamed and no longer exist.
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

// Fix #4: attendre que Vuetify ait peint les bonnes CSS variables avant de révéler.
onMounted(() => {
  // Restore the saved theme AFTER hydration. Doing it in the Vuetify plugin
  // instead races hydration, which re-patches .v-application back to the
  // SSR theme — the DOM ends up light while Vuetify stays dark.
  syncTheme()

  nextTick(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('hydrated')
    })
  })

  // Fix bfcache: Firefox (et d'autres navigateurs) restaurent la page depuis le cache
  // mémoire lors d'un retour arrière. L'état DOM est intact mais Vue/Vuetify peut être
  // désynchronisé. On re-synchronise le thème à chaque restauration bfcache.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      syncTheme()
    }
  })

  // Sync multi-onglets : si le thème change dans un autre onglet, on met à jour ici.
  window.addEventListener('storage', (event) => {
    if (event.key === 'portfolio-theme' && event.newValue) {
      syncTheme()
    }
  })
})
</script>
