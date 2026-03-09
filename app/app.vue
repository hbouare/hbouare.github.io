<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()

const { baseURL } = useRuntimeConfig().app
const faviconHref = computed(() => `${baseURL}${isDark.value ? 'favicon.svg' : 'favicon-light.svg'}`)

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: faviconHref },
  ],
})
</script>
