<!-- app/components/sections/ReferencesStrip.vue -->
<template>
  <div class="refs gutter">
    <span class="label">{{ $t("home.refs_label") }}</span>
    <!-- role="list": display:contents drops list semantics in Safari. -->
    <ul class="refs-list" role="list">
      <li v-for="name in refs" :key="name">{{ name }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { tm, rt } = useI18n()
const refs = computed(() => (tm("home.refs") as unknown[]).map((m) => rt(m as string)))
</script>

<style scoped>
.refs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  align-items: baseline;
  padding-block: 22px;
  border-bottom: 1px solid var(--rule);
}
.refs-list {
  display: contents;
  list-style: none;
}
.refs-list li {
  font-family: var(--f-display);
  font-size: clamp(18px, 1.6vw, 22px);
  letter-spacing: -0.01em;
}
</style>
