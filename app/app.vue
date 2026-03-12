<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()

useHead(() => ({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: isDark.value ? '/favicon-dark.svg' : '/favicon-light.svg', key: 'favicon' },
  ],
}))

// Fix #4: attendre que Vuetify ait peint les bonnes CSS variables avant de révéler.
onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('hydrated')
    })
  })
})
</script>
