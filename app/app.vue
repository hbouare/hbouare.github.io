<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { isDark } = useAppTheme()

useHead({
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: computed(() => isDark.value ? '/favicon.svg' : '/favicon-light.svg') },
  ],
})
</script>
