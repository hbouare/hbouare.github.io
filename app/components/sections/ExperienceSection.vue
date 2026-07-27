<!-- app/components/sections/ExperienceSection.vue -->
<!--
  Not a CV. Proof. The value of this section is the SECTORS and the names —
  energy, healthcare, rail, industry, research; EDF, GE HealthCare, SNCF… — so
  each entry leads with its sector and company, not a job title, and the tech
  stack (tags) is dropped: it is noise here, and lives in the hero and the
  services. A sector strip up top lets a decision-maker scan the reach at once.
-->
<template>
  <section id="experience" class="section-pad section-surface">
    <v-container class="px-6 px-md-10" fluid>
      <UiSectionHeader
        :label="$t('experience.section')"
        :line1="$t('experience.title_1')"
        :line-em="$t('experience.title_em')"
      />

      <UiRevealBlock>
        <p class="exp-lead type-body-lg mt-8">{{ $t("experience.lead") }}</p>
        <ul v-if="sectors.length" class="exp-sectors mt-6" aria-label="Secteurs">
          <li v-for="s in sectors" :key="s" class="exp-sector type-micro-cap">{{ s }}</li>
        </ul>
      </UiRevealBlock>

      <div class="exp-list mt-14">
        <template v-if="!experiences">
          <div v-for="n in 3" :key="n" class="exp-skeleton">
            <v-skeleton-loader type="list-item-three-line" />
          </div>
        </template>

        <UiRevealBlock
          v-for="(exp, i) in experiences"
          :key="exp.id"
          :delay="i * 100"
        >
          <article class="exp-item">
            <div class="exp-top">
              <span v-if="exp.sector" class="exp-sector-tag type-micro-cap">{{ exp.sector }}</span>
              <span class="exp-period type-micro-cap text-muted">{{ exp.period }}</span>
            </div>
            <h3 class="exp-company type-title">{{ exp.company }}</h3>
            <p class="exp-meta type-micro-cap text-muted">
              {{ exp.role }} · <span class="exp-flag">{{ exp.flag }}</span> {{ exp.location }}
            </p>
            <div class="exp-body type-body-md text-muted">
              <ContentRenderer :value="exp" />
            </div>
          </article>
        </UiRevealBlock>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()

const { data: experiences } = await useAsyncData(
  `experiences-${locale.value}`,
  () =>
    queryCollection(`${locale.value}_experience`).order("order", "ASC").all(),
)

// The credibility strip: each sector once, in the order it first appears.
const sectors = computed(() => {
  const seen = new Set<string>()
  const out: string[] = []
  for (const e of experiences.value ?? []) {
    if (e.sector && !seen.has(e.sector)) {
      seen.add(e.sector)
      out.push(e.sector)
    }
  }
  return out
})
</script>

<style scoped lang="scss">
.exp-lead {
  max-width: var(--measure-prose);
  color: rgb(var(--v-theme-on-background));
}

// Sector strip — the reach, scannable in one glance. Editorial (mid-dot
// separated), not chips: these are proof, not the tech tags we dropped.
.exp-sectors {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0;
}
.exp-sector {
  color: rgb(var(--v-theme-on-background));
  &:not(:last-child)::after {
    content: "·";
    margin: 0 0.85rem;
    color: rgb(var(--v-theme-muted));
  }
}

// ── Entry ─────────────────────────────────────────────────────────────────
.exp-item {
  border-top: 1px solid rgb(var(--v-theme-border));
  padding: var(--space-xl) 0;
}
.exp-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}
// The sector leads — full ink, it is the point of the row.
.exp-sector-tag {
  color: rgb(var(--v-theme-on-background));
}
.exp-company {
  color: rgb(var(--v-theme-on-background));
}
.exp-meta {
  margin-top: 0.15rem;
}
.exp-flag {
  font-size: 1.1rem;
}
.exp-body {
  margin-top: var(--space-md);
  max-width: var(--measure-prose);
}
.exp-body :deep(p) {
  margin: 0;
}

.exp-skeleton {
  border-top: 1px solid rgb(var(--v-theme-border));
  padding: 1rem 0;
}
</style>
