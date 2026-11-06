<!-- app/pages/services.vue -->
<!--
  The offer: six services, each stated as the client's problem ("Constat")
  and what I bring ("Réponse") — no technology soup, no marketing. The offer
  lives here only; it is deliberately not repeated on the home page.
-->
<template>
  <div>
    <UiPageIntro :eyebrow="$t('services.section')" :intro="$t('services.intro')">
      <template #title>{{ $t("services.title") }}</template>
    </UiPageIntro>

    <section class="services gutter" :aria-label="$t('nav.services')">
      <article v-for="s in services" :key="s.n" class="rule-row is-interactive svc-row">
        <div class="svc-head">
          <span class="svc-num">{{ s.n }}</span>
          <h2 class="svc-title">{{ s.title }}</h2>
        </div>
        <div class="svc-body">
          <div class="svc-col">
            <div class="label">{{ $t("services.problem_label") }}</div>
            <p class="svc-problem">{{ s.problem }}</p>
          </div>
          <div class="svc-col">
            <div class="label">{{ $t("services.answer_label") }}</div>
            <p class="svc-answer">{{ s.answer }}</p>
          </div>
        </div>
      </article>
    </section>

    <UiCtaBand
      :title="$t('services.cta_title')"
      :text="$t('services.cta_text')"
      :button="$t('services.cta_button')"
      :to="localePath('/contact')"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const services = computed(() =>
  [1, 2, 3, 4, 5, 6].map((n) => ({
    n: String(n).padStart(2, "0"),
    title: t(`services.svc_${n}_t`),
    problem: t(`services.svc_${n}_p`),
    answer: t(`services.svc_${n}_d`),
  })),
)

useSeoMeta({
  title: "Services",
  description: t("services.meta_desc"),
  ogTitle: "Services - Hamed Bouare",
  ogDescription: t("services.meta_desc"),
})
</script>

<style scoped>
.services {
  display: flex;
  flex-direction: column;
  padding-bottom: var(--section-y);
}

.svc-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 48px;
  padding-block: clamp(28px, 3.2vw, 48px);
}

.svc-head {
  flex: 1 1 200px;
  display: flex;
  gap: 16px;
  align-items: baseline;
}
.svc-num {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--accent);
}
.svc-title {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 400;
  font-size: clamp(26px, 2.6vw, 36px);
  line-height: 1.12;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.svc-body {
  flex: 2 1 460px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 20px 40px;
}
.svc-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.svc-problem {
  margin: 0;
  font-family: var(--f-display);
  font-style: italic;
  font-size: 19px;
  line-height: 1.45;
}
.svc-answer {
  margin: 0;
  font-size: 16px;
  line-height: 1.65;
}
</style>
