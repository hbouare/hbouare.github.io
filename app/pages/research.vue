<!-- app/pages/research.vue -->
<!--
  Research, told in three acts: who (the PhD and the method it taught),
  proof (five real publications, each linking out to its source), and why it
  matters to a client (impact on engineering work). Publications are data in
  app/config/publications.ts — real, verifiable, nothing invented.
-->
<template>
  <div>
    <section class="r-intro gutter">
      <div class="eyebrow">{{ $t("research.section") }}</div>
      <i18n-t scope="global" keypath="research.title" tag="h1" class="t-h1 r-title">
        <template #em>
          <em>{{ $t("research.title_em") }}</em>
        </template>
      </i18n-t>
      <div class="r-lead-row">
        <p class="r-lead">{{ $t("research.lead") }}</p>
        <div class="r-text">
          <p>{{ $t("research.intro_1") }}</p>
          <p class="muted">{{ $t("research.intro_2") }}</p>
        </div>
      </div>
    </section>

    <div class="cells r-facts">
      <div v-for="(f, i) in facts" :key="f" class="r-fact">
        <span class="r-num">{{ String(i + 1).padStart(2, "0") }}</span>
        <span class="r-fact-text">{{ f }}</span>
      </div>
    </div>

    <section class="section gutter" aria-labelledby="pubs-title">
      <div class="editorial r-head">
        <div class="editorial__key eyebrow">{{ $t("research.pubs_label") }}</div>
        <h2 id="pubs-title" class="editorial__body t-h2">{{ $t("research.pubs_title") }}</h2>
      </div>

      <article v-for="pub in publications" :key="pub.key" class="rule-row pub-card">
        <div class="pub-key">
          <span class="pub-year tabular">{{ pub.year }}</span>
          <span class="tag tag--caps">{{ $t(`research.type_${pub.type}`) }}</span>
        </div>
        <div class="pub-body">
          <div class="pub-venue">
            {{ pub.venue }} · <time :datetime="pub.date">{{ formatDate(pub.date) }}</time>
          </div>
          <h3 class="t-list pub-title">{{ pub.title }}</h3>
          <p class="pub-sum">{{ copy(pub).summary }}</p>
          <div class="pub-meta">
            <div class="pub-meta-col">
              <div class="label">{{ $t("research.themes_label") }}</div>
              <ul class="pub-themes" role="list">
                <li v-for="th in copy(pub).themes" :key="th" class="tag">{{ th }}</li>
              </ul>
            </div>
            <div class="pub-meta-col">
              <div class="label">{{ $t("research.skills_label") }}</div>
              <ul class="pub-skills" role="list">
                <li v-for="sk in copy(pub).skills" :key="sk">— {{ sk }}</li>
              </ul>
            </div>
          </div>
          <a :href="pub.url" target="_blank" rel="noopener" class="pub-link">
            {{ $t("research.view_publication") }} ↗
          </a>
        </div>
      </article>
    </section>

    <section class="r-impact gutter" aria-labelledby="impact-title">
      <div class="editorial r-head">
        <div class="editorial__key eyebrow r-impact-key">{{ $t("research.impact_label") }}</div>
        <div class="editorial__body r-impact-intro">
          <h2 id="impact-title" class="t-h2">{{ $t("research.impact_title") }}</h2>
          <p class="r-impact-lead muted">{{ $t("research.impact_lead") }}</p>
        </div>
      </div>
      <div class="cells r-impact-grid">
        <div v-for="n in 8" :key="n" class="impact-item">
          <span class="r-num">{{ String(n).padStart(2, "0") }}</span>
          <span class="impact-title">{{ $t(`research.impact_${n}_t`) }}</span>
          <span class="impact-desc">{{ $t(`research.impact_${n}_d`) }}</span>
        </div>
      </div>
    </section>

    <UiCtaBand
      :title="$t('research.cta_title')"
      :text="$t('research.cta_text')"
      :button="$t('research.cta_button')"
      :to="localePath('/contact')"
    />
  </div>
</template>

<script setup lang="ts">
import { publications, type Publication } from "~/config/publications"

const { locale, t } = useI18n()
const localePath = useLocalePath()

const copy = (pub: Publication) => pub[locale.value as "fr" | "en"]

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, { month: "long", year: "numeric" }).format(new Date(iso))

const facts = computed(() => [
  t("research.stat_degree"),
  t("research.stat_pubs"),
  t("research.stat_venues"),
])

useSeoMeta({
  title: () => t("nav.research"),
  description: () => t("research.meta_desc"),
  ogTitle: () => `${t("nav.research")} - Hamed Bouare`,
  ogDescription: () => t("research.meta_desc"),
})

// Real, verifiable publications — worth exposing as structured data.
useJsonLd({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: publications.map((pub, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": pub.type === "thesis" ? "Thesis" : "ScholarlyArticle",
      name: pub.title,
      datePublished: pub.date,
      url: pub.url,
      publisher: pub.venue,
      author: { "@type": "Person", name: "Hamed Bouare", url: "https://hamedbouare.me" },
    },
  })),
})
</script>

<style scoped>
.r-intro {
  display: flex;
  flex-direction: column;
  gap: clamp(20px, 2.4vw, 32px);
  padding-top: clamp(56px, 8vw, 120px);
  padding-bottom: clamp(48px, 6vw, 88px);
}
.r-title {
  max-width: 1200px;
  font-size: clamp(40px, 6.4vw, 96px);
  line-height: 1.02;
}
.r-lead-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
  margin-top: clamp(8px, 2vw, 32px);
}
.r-lead {
  flex: 1 1 300px;
  margin: 0;
  font-family: var(--f-display);
  font-style: italic;
  font-size: clamp(22px, 2.2vw, 30px);
  line-height: 1.3;
  text-wrap: balance;
}
.r-text {
  flex: 2 1 480px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  font-size: 17px;
  line-height: 1.65;
}
.r-text p {
  margin: 0;
  line-height: inherit;
}

.r-facts {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  border-block: 1px solid var(--rule);
}
.r-fact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: clamp(22px, 2.8vw, 36px) clamp(20px, 3vw, 40px);
}
.r-fact:first-child {
  padding-left: var(--gutter);
}
.r-num {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--accent);
}
.r-fact-text {
  font-family: var(--f-display);
  font-size: clamp(22px, 2.2vw, 30px);
  line-height: 1.2;
}

.r-head {
  gap: 16px 48px;
  align-items: baseline;
  padding-bottom: var(--block-gap);
}

.pub-card {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 48px;
  padding-block: clamp(28px, 3.4vw, 52px);
}
.pub-key {
  flex: 1 1 200px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: baseline;
  align-content: flex-start;
}
.pub-year {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(44px, 4.4vw, 64px);
  line-height: 1;
  letter-spacing: -0.03em;
}
.pub-body {
  flex: 999 1 620px;
  min-width: 0;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pub-venue {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.pub-title {
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-wrap: pretty;
}
.pub-sum {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
}
.pub-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 20px 40px;
  padding-top: 6px;
}
.pub-meta-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pub-themes,
.pub-skills {
  margin: 0;
  padding: 0;
  list-style: none;
}
.pub-themes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pub-skills {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}
.pub-link {
  align-self: flex-start;
  padding: 4px 0;
  font-size: 15px;
  font-weight: 500;
  border-bottom: 1px solid var(--accent);
  transition: color 0.2s;
}
.pub-link:hover {
  color: var(--accent);
}

.r-impact {
  padding-bottom: var(--section-y);
}
.r-impact-key {
  padding-top: 12px;
}
.r-impact-intro {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.r-impact-lead {
  margin: 0;
  max-width: 620px;
  font-size: 17px;
  line-height: 1.6;
}
.r-impact-grid {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  border: 1px solid var(--rule);
}
.impact-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
}
.impact-item .r-num {
  font-size: 11px;
}
.impact-title {
  font-family: var(--f-display);
  font-size: 21px;
  line-height: 1.25;
}
.impact-desc {
  font-size: 15px;
  line-height: 1.55;
  color: var(--muted);
  text-wrap: pretty;
}
</style>
