<!-- app/pages/research.vue -->
<!--
  Research / scientific publications.

  Three acts: an introduction that frames the doctoral work, a set of premium
  publication cards (the real, peer-reviewed papers), and an "impact" section
  tying the academic rigour back to software engineering.

  Data comes from app/config/publications.ts (locale-invariant meta + per-locale
  prose) so the page owns only presentation. Reuses the design-system
  primitives — UiSectionHeader (self-animating openers), UiRevealBlock (scroll
  reveals), UiEyebrow — and stays inside the monochrome/hairline identity: the
  type badge is the only differentiator, never a hue.
-->
<template>
  <div class="research-page">
    <UiWaveField />
    <v-container class="research px-6 px-md-10 section-v-pad position-relative" fluid>
      <div class="research-inner">
      <!-- ── Act I — Introduction ─────────────────────────────────────── -->
      <UiSectionHeader
        :label="$t('research.section')"
        :line1="$t('research.title_1')"
        :line-em="$t('research.title_em')"
        :line3="$t('research.title_3')"
      />

      <UiRevealBlock :delay="80">
        <div class="research-intro">
          <p class="research-lead type-body-lg">{{ $t("research.lead") }}</p>
          <p class="research-p type-body-lg">{{ $t("research.intro_1") }}</p>
          <p class="research-p type-body-md text-muted">{{ $t("research.intro_2") }}</p>

          <dl class="research-stats">
            <div class="research-stat">
              <dt class="type-micro-cap text-muted">01</dt>
              <dd class="type-body-md">{{ $t("research.stat_degree") }}</dd>
            </div>
            <div class="research-stat">
              <dt class="type-micro-cap text-muted">02</dt>
              <dd class="type-body-md">{{ $t("research.stat_pubs") }}</dd>
            </div>
            <div class="research-stat">
              <dt class="type-micro-cap text-muted">03</dt>
              <dd class="type-body-md">{{ $t("research.stat_venues") }}</dd>
            </div>
          </dl>
        </div>
      </UiRevealBlock>

      <!-- ── Act II — Publications ────────────────────────────────────── -->
      <div class="research-band">
        <UiSectionHeader
          :label="$t('research.pubs_label')"
          :line1="$t('research.pubs_title_1')"
          :line-em="$t('research.pubs_title_em')"
        />
      </div>

      <div class="pub-list">
        <UiRevealBlock
          v-for="(pub, i) in publications"
          :key="pub.key"
          :delay="i * 80"
        >
          <article class="pub-card hairline-interactive">
            <!-- Rail: year anchor + type badge -->
            <div class="pub-rail">
              <span class="pub-year">{{ pub.year }}</span>
              <span class="pub-badge type-micro-cap">{{ typeLabel(pub.type) }}</span>
            </div>

            <!-- Content -->
            <div class="pub-body">
              <p class="pub-meta type-micro-cap text-muted">
                {{ pub.venue }} · <time :datetime="pub.date">{{ formatDate(pub.date) }}</time>
              </p>

              <h3 class="pub-title type-title">{{ pub.title }}</h3>

              <p class="pub-summary type-body-md">{{ copy(pub).summary }}</p>

              <div class="pub-facets">
                <div class="pub-facet">
                  <p class="pub-facet-label type-micro-cap text-muted">
                    {{ $t("research.themes_label") }}
                  </p>
                  <div class="d-flex flex-wrap ga-1">
                    <v-chip v-for="theme in copy(pub).themes" :key="theme" size="x-small">
                      {{ theme }}
                    </v-chip>
                  </div>
                </div>

                <div class="pub-facet">
                  <p class="pub-facet-label type-micro-cap text-muted">
                    {{ $t("research.skills_label") }}
                  </p>
                  <ul class="pub-skills">
                    <li v-for="skill in copy(pub).skills" :key="skill" class="type-body-md">
                      {{ skill }}
                    </li>
                  </ul>
                </div>
              </div>

              <a
                :href="pub.url"
                target="_blank"
                rel="noopener"
                class="pub-link type-micro-cap"
              >
                {{ $t("research.view_publication") }}
                <v-icon size="14" icon="mdi-arrow-top-right" class="pub-link-icon" />
              </a>
            </div>
          </article>
        </UiRevealBlock>
      </div>

      <!-- ── Act III — Impact ─────────────────────────────────────────── -->
      <div class="research-band">
        <UiSectionHeader
          :label="$t('research.impact_label')"
          :line1="$t('research.impact_title_1')"
          :line-em="$t('research.impact_title_em')"
        />
      </div>

      <UiRevealBlock :delay="80">
        <p class="impact-lead type-body-lg">{{ $t("research.impact_lead") }}</p>
      </UiRevealBlock>

      <UiRevealBlock :delay="120">
        <dl class="impact-grid section-surface">
          <div v-for="n in 8" :key="n" class="impact-item">
            <dt class="impact-item-title type-title">{{ $t(`research.impact_${n}_t`) }}</dt>
            <dd class="impact-item-desc type-body-md text-muted">
              {{ $t(`research.impact_${n}_d`) }}
            </dd>
          </div>
        </dl>
      </UiRevealBlock>
    </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { publications, type Publication, type PublicationType } from "~/config/publications"

const { locale, t } = useI18n()

const copy = (pub: Publication) => pub[locale.value as "fr" | "en"]

const typeLabel = (type: PublicationType) => t(`research.type_${type}`)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, { month: "long", year: "numeric" }).format(new Date(iso))

useSeoMeta({
  title: () => `${t("research.title_1")} ${t("research.title_em")}`,
  description: () => t("research.meta_desc"),
  ogTitle: "Research & publications - Hamed Bouare",
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

<style scoped lang="scss">
// Positioned wrapper so the fixed ambient wave field (z-index 0) sits behind
// the page content, which stacks above it via the container's position-relative.
.research-page {
  position: relative;
  min-height: 100vh;
}

.research-inner {
  max-width: 920px;
  margin: 0 auto;
}

// ── Act I — Introduction ──────────────────────────────────────────────
.research-intro {
  margin-top: 2.5rem;
  max-width: 680px;
}
.research-lead {
  color: rgb(var(--v-theme-on-background));
  font-weight: 500;
}
.research-p {
  margin-top: 1.25rem;
}
.research-p.type-body-lg {
  color: rgb(var(--v-theme-on-background));
}

.research-stats {
  margin: 2.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 0;
  border-top: 1px solid rgb(var(--v-theme-border));
}
.research-stat {
  display: grid;
  grid-template-columns: 3rem 1fr;
  gap: 1rem;
  align-items: baseline;
  padding: 1rem 0;
  border-bottom: 1px solid rgb(var(--v-theme-border));

  dd {
    color: rgb(var(--v-theme-on-background));
    margin: 0;
  }
}

// Band spacing between the three acts.
.research-band {
  margin-top: 6rem;
  @media (max-width: 767px) {
    margin-top: 4rem;
  }
}

// ── Act II — Publications ─────────────────────────────────────────────
.pub-list {
  list-style: none;
  padding: 0;
  margin: 3rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.pub-card {
  display: grid;
  grid-template-columns: 128px 1fr;
  gap: 2.5rem;
  padding: 2.5rem;
  border: 1px solid rgb(var(--v-theme-border));

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.75rem 1.5rem;
  }
}

// Rail — the year is the visual anchor; the badge names the venue type.
.pub-rail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 767px) {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
}
.pub-year {
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: rgb(var(--v-theme-on-background));
  font-variant-numeric: tabular-nums;
}
.pub-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 0.25rem 0.6rem;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 999px;
  color: rgb(var(--v-theme-muted));
  white-space: nowrap;
}

.pub-body {
  min-width: 0; // let long titles wrap instead of forcing overflow
}
.pub-title {
  color: rgb(var(--v-theme-on-background));
  margin-top: 0.5rem;
  transition: color 0.3s ease;
}
.pub-summary {
  color: rgb(var(--v-theme-muted));
  margin-top: 1rem;
  max-width: 62ch;
}

// Themes + skills side by side, stacking on narrow cards.
.pub-facets {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem 2rem;
  margin-top: 1.75rem;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
.pub-facet-label {
  margin-bottom: 0.75rem;
}
.pub-skills {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    color: rgb(var(--v-theme-on-background));
    padding-left: 1.25rem;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.7em;
      width: 12px;
      height: 1px;
      background: currentColor;
    }
  }
}

// External link to the paper — text + arrow that glides on hover.
.pub-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 1.75rem;
  color: rgb(var(--v-theme-on-background));
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover,
  &:focus-visible {
    opacity: 0.7;
  }
  &:hover .pub-link-icon,
  &:focus-visible .pub-link-icon {
    transform: translate(2px, -2px);
  }
}
.pub-link-icon {
  transition: transform 0.3s ease;
}

// Hover: the hairline strengthens (system has no shadow) and the title inks.
.pub-card.hairline-interactive:hover .pub-title {
  color: rgb(var(--v-theme-on-background));
}

// ── Act III — Impact ──────────────────────────────────────────────────
.impact-lead {
  margin-top: 2.5rem;
  max-width: 640px;
  color: rgb(var(--v-theme-on-background));
  font-weight: 500;
}

.impact-grid {
  margin-top: 2rem;
  padding: 0.5rem 2.25rem;
  border: 1px solid rgb(var(--v-theme-border));
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 3rem;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    padding: 0.5rem 1.5rem;
  }
}
.impact-item {
  padding: 1.75rem 0;
  border-bottom: 1px solid rgb(var(--v-theme-border));

  // Drop the last row's bottom rule (2 columns → last two, 1 column → last).
  &:last-child,
  &:nth-last-child(2):nth-child(odd) {
    border-bottom: none;
  }
  @media (max-width: 767px) {
    &:nth-last-child(2):nth-child(odd) {
      border-bottom: 1px solid rgb(var(--v-theme-border));
    }
  }
}
.impact-item-title {
  color: rgb(var(--v-theme-on-background));
}
.impact-item-desc {
  margin-top: 0.5rem;
  max-width: 42ch;
}
</style>
