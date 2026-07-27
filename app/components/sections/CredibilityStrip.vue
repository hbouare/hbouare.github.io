<!-- app/components/sections/CredibilityStrip.vue -->
<!--
  Trust bar. Surfaces the strongest single credibility signal — real
  organisations in critical sectors — in the SECOND screen, right after the
  hero's promise, instead of leaving it buried in the Parcours section two
  scrolls down.

  Text wordmarks, not logos: the design system is monochrome and imageless,
  and plain names sidestep any trademark-logo question. Deliberately the four
  most internationally recognisable engagements; the full six live in the
  Parcours section below.

  The label is neutral by design. These were employment and freelance
  engagements, not "clients", so it says "delivered FOR" — never "clients" or
  "trusted by", which would overclaim a relationship that didn't exist.
-->
<template>
  <section class="cred-strip" :aria-label="$t('credibility.aria')">
    <div class="cred-inner px-6 px-md-10">
      <UiRevealBlock>
        <p class="cred-label type-micro-cap text-muted">
          {{ $t("credibility.label") }}
        </p>
        <ul class="cred-names">
          <li v-for="name in names" :key="name" class="cred-name">{{ name }}</li>
        </ul>
      </UiRevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
// The four most recognisable engagements; the full list is in the Parcours
// section. Proper nouns — not translated.
const names = ["EDF", "GE HealthCare", "SNCF", "BHP"]
</script>

<style scoped lang="scss">
.cred-strip {
  border-top: 1px solid rgb(var(--v-theme-border));
  border-bottom: 1px solid rgb(var(--v-theme-border));
  padding-block: var(--space-xl);
}
.cred-label {
  margin-bottom: var(--space-md);
}
.cred-names {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm) 0;
}
// Wordmarks — display face, uppercase, full ink. Larger than the sector strip
// so the recognisable names carry the visual weight; the mid-dot separators
// stay muted so they recede.
.cred-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.125rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-on-background));
  &:not(:last-child)::after {
    content: "·";
    margin: 0 var(--space-md);
    color: rgb(var(--v-theme-muted));
    font-weight: 400;
  }
}
</style>
