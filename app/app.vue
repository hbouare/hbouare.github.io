<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { syncTheme } = useAppTheme()

// SEO: hreflang, canonical, og:locale, html lang
const head = useLocaleHead({
  addDirAttribute: true,
  addSeoAttributes: true,
})
useHead({
  htmlAttrs: () => ({
    lang: head.value.htmlAttrs?.lang,
    dir: head.value.htmlAttrs?.dir,
  }),
  link: () => [...(head.value.link || [])],
  meta: () => [...(head.value.meta || [])],
})

// Fix #4: attendre que Vuetify ait peint les bonnes CSS variables avant de révéler.
onMounted(() => {
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
