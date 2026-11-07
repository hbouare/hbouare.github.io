<!-- app/components/ui/PageIntro.vue -->
<!--
  Standard page opener: mono eyebrow, display H1 (slot, so a page can italicise
  one word), then optional content below — usually the intro paragraph.
  Every inner page has exactly one, which also makes it the page's only <h1>.
-->
<template>
  <section class="page-intro gutter">
    <div class="eyebrow">{{ eyebrow }}</div>
    <h1 class="t-h1 page-intro-title"><slot name="title" /></h1>
    <p v-if="intro" class="t-intro muted page-intro-text">{{ intro }}</p>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  intro?: string
}>()
</script>

<style scoped>
.page-intro {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 2.4vw, 32px);
  padding-top: clamp(56px, 8vw, 120px);
  padding-bottom: clamp(40px, 5vw, 72px);
}
.page-intro-title {
  max-width: 1100px;
}
.page-intro-text {
  max-width: 640px;
}
</style>
