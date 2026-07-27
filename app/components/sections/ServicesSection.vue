<!-- app/components/sections/ServicesSection.vue -->
<!--
  The offer. Answers the one question the rest of the site never did: "what can
  I hire him FOR?" Six named services, each stated as a client problem + what I
  deliver — no technology soup, no marketing.

  Lives on its own page (/services): the intro, the six services, and a
  conversion block to /contact. Deliberately NOT duplicated on the home — the
  offer has one place, so the same six cards never appear twice.
-->
<template>
  <section class="section-services section-v-pad px-6 px-md-10">
    <div class="services-inner">
      <UiSectionHeader
        :label="$t('services.section')"
        :line1="$t('services.title_1')"
        :line-em="$t('services.title_em')"
      />

      <UiRevealBlock :delay="80">
        <p class="services-intro type-body-lg mt-8">{{ $t("services.intro") }}</p>
      </UiRevealBlock>

      <div class="services-grid mt-14">
        <UiRevealBlock v-for="n in 6" :key="n" :delay="(n - 1) * 70" class="h-100">
          <article class="service-card hairline-interactive">
            <h3 class="service-title type-title">{{ $t(`services.svc_${n}_t`) }}</h3>
            <p class="service-problem type-body-md">{{ $t(`services.svc_${n}_p`) }}</p>
            <p class="service-desc type-body-md text-muted">
              {{ $t(`services.svc_${n}_d`) }}
            </p>
          </article>
        </UiRevealBlock>
      </div>

      <UiRevealBlock :delay="120">
        <div class="services-cta section-surface mt-16">
          <h2 class="services-cta-title type-title">{{ $t("services.cta_title") }}</h2>
          <p class="services-cta-text type-body-md text-muted mt-2">
            {{ $t("services.cta_text") }}
          </p>
          <v-btn
            :to="localePath('/contact')"
            size="large"
            append-icon="mdi-arrow-right"
            class="mt-8"
          >
            {{ $t("services.cta_button") }}
          </v-btn>
        </div>
      </UiRevealBlock>
    </div>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
</script>

<style scoped lang="scss">
.services-inner {
  max-width: 1080px;
  margin: 0 auto;
}
.services-intro {
  max-width: var(--measure-prose);
  color: rgb(var(--v-theme-on-background));
}

// Hairline cards, monochrome — the same card idiom as projects/publications.
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}
.service-card {
  height: 100%;
  padding: var(--space-xl);
  border: 1px solid rgb(var(--v-theme-border));
  display: flex;
  flex-direction: column;
}
.service-title {
  color: rgb(var(--v-theme-on-background));
}
// The problem statement leads — full ink, so scanning the six cards reads as
// "here are six problems I solve". The response sits under it, muted.
.service-problem {
  margin-top: var(--space-md);
  color: rgb(var(--v-theme-on-background));
  max-width: var(--measure-prose);
}
.service-desc {
  margin-top: var(--space-sm);
  max-width: var(--measure-prose);
}

// The conversion block — a hairline surface, not a loud banner.
.services-cta {
  border: 1px solid rgb(var(--v-theme-border));
  padding: var(--space-huge);
}
.services-cta-title {
  color: rgb(var(--v-theme-on-background));
}
</style>
