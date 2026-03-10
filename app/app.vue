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
</script>
