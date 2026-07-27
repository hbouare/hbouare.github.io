<!-- app/components/ui/CtaBand.vue -->
<!--
  Reusable conversion block. A page that ends without one is a dead-end — and
  the most-engaged reader (the one who scrolled to the bottom) is exactly who
  should be invited to reach out. Same sober hairline-surface idiom as the
  Services conversion block; the copy and CTA verb are passed in so each
  context can address its own intent (demanding R&D, a home-closing invite…).
-->
<template>
  <section class="cta-band section-v-pad px-6 px-md-10" :aria-label="title">
    <div class="cta-inner">
      <UiRevealBlock>
        <div class="cta-box section-surface">
          <h2 class="cta-title type-title">{{ title }}</h2>
          <p v-if="text" class="cta-text type-body-md text-muted mt-2">{{ text }}</p>
          <v-btn :to="to" size="large" append-icon="mdi-arrow-right" class="mt-8">
            {{ button }}
          </v-btn>
        </div>
      </UiRevealBlock>
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
</script>

<style scoped lang="scss">
.cta-inner {
  max-width: 1080px;
  margin: 0 auto;
}
.cta-box {
  border: 1px solid rgb(var(--v-theme-border));
  padding: var(--space-huge);
}
.cta-title {
  color: rgb(var(--v-theme-on-background));
}
</style>
