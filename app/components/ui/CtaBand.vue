<!-- app/components/ui/CtaBand.vue -->
<!--
  End-of-page conversion block, on every page except Contact. Inverted:
  --ink background, --bg text, --rule for secondary text. The copy varies per
  page and is passed in, so each context addresses its own intent.
-->
<template>
  <section class="cta-band gutter" :aria-labelledby="headingId">
    <div v-reveal.fade class="eyebrow cta-eyebrow">{{ $t("cta.eyebrow") }}</div>
    <h2 :id="headingId" v-reveal.lines class="t-cta cta-title">{{ title }}</h2>
    <div v-reveal class="cta-foot">
      <p v-if="text" class="t-intro cta-text">{{ text }}</p>
      <NuxtLink :to="to" class="btn btn--inverse">
        {{ button }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  text?: string
  button: string
  to: string
}>()

const headingId = useId()
</script>

<style scoped>
.cta-band {
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 3vw, 40px);
  padding-block: clamp(72px, 10vw, 152px);
  background: var(--ink);
  color: var(--bg);
  transition: var(--theme-fade);
}
.cta-eyebrow,
.cta-text {
  color: var(--rule);
}
.cta-title {
  max-width: 1100px;
}
.cta-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
  align-items: center;
  justify-content: space-between;
}
.cta-text {
  max-width: 520px;
}
</style>
