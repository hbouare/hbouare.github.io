<!-- app/components/sections/MarqueeBar.vue -->
<template>
  <!-- Borders are hairline tokens in CSS, not inline styles. -->
  <v-sheet class="marquee-wrap" color="surface">
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
        <span v-if="i % 2 === 0" class="marquee-text type-micro-cap">{{
          item
        }}</span>
        <span v-else class="marquee-dot" aria-hidden="true">◆</span>
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
  border-top: 1px solid rgb(var(--v-theme-border));
  border-bottom: 1px solid rgb(var(--v-theme-border));
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
  color: rgb(var(--v-theme-muted));
}
.marquee-dot {
  color: rgb(var(--v-theme-muted));
  font-size: 0.7rem;
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
