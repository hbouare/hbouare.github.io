<!-- app/components/sections/MarqueeBar.vue -->
<template>
  <v-sheet
    class="marquee-wrap"
    color="surface"
    :style="{
      borderTop: '1px solid rgba(var(--v-theme-primary), 0.12)',
      borderBottom: '1px solid rgba(var(--v-theme-primary), 0.12)',
    }"
  >
    <div
      class="marquee-track"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      :class="{ paused }"
    >
      <span
        v-for="(item, i) in items.concat(items)"
        :key="i"
        class="marquee-item-wrap"
      >
        <span v-if="i % 2 === 0" class="marquee-text font-playfair">{{
          item
        }}</span>
        <span v-else class="marquee-dot text-primary">◆</span>
      </span>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
const paused = ref(false)

const items = [
  "Python · FastAPI · Django · Flask",
  "◆",
  "Nuxt.js · Vue.js · Vuetify",
  "◆",
  "OpenShift · Kubernetes · Docker",
  "◆",
  "PostgreSQL · Redis · Mongodb",
  "◆",
  "Javascript · TypeScript · Node.js",
  "◆",
  "Playwright · Selenium · Cypress",
  "◆",
  " Vitest · Jest · Pytest",
  "◆",
  "Travis · Gitlab ci · Github actions",
  "◆",
  "Aws · Terraform",
  "◆",
]
</script>

<style scoped lang="scss">
.marquee-wrap {
  padding: 1rem 0;
  overflow: hidden;
}
.marquee-track {
  display: flex;
  gap: 3rem;
  animation: marquee 30s linear infinite;
  &.paused {
    animation-play-state: paused;
  }
  white-space: nowrap;
  width: max-content;
}
.marquee-text {
  font-size: 0.85rem;
  font-style: italic;
  color: rgb(var(--v-theme-muted));
}
.marquee-dot {
  font-size: 0.85rem;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
</style>
