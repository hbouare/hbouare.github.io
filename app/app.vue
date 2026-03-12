<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useAppTheme()

// Fix #4: attendre que Vuetify ait peint les bonnes CSS variables avant de révéler.
onMounted(() => {
  nextTick(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('hydrated')
    })
  })
})
</script>
