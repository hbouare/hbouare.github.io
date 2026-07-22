<!-- app/pages/projects/[slug].vue -->
<!--
  Project case study. Structured frontmatter (intro / challenge / solution /
  objectives / highlights / impact / architecture / deliverables) is grouped
  into three progressive reading tiers — Overview (everyone) → Features & value
  (everyone) → Under the hood (developers) — plus a Resources block. Rendering
  is DATA-DRIVEN (`tiers` below): the sections are one loop, not eight copied
  blocks, so order/grouping live in one place and every project renders only
  the fields it actually has. Reuses the design-system primitives and tokens;
  icons stay minimal to keep the monochrome, hairline identity.
-->
<template>
  <v-container class="case px-6 px-md-10 section-v-pad" fluid>
    <div v-if="project" class="case-inner">
      <UiRevealBlock>
        <NuxtLink :to="localePath('/projects')" class="back-link type-micro-cap text-muted">
          <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
          {{ $t("projects.back") }}
        </NuxtLink>
      </UiRevealBlock>

      <!-- Hero: context · title · hook · role · technologies -->
      <header class="case-hero">
        <UiEyebrow class="mb-4">{{ project.context }}</UiEyebrow>
        <UiDisplayTitle tag="h1" level="xl">{{ project.title }}</UiDisplayTitle>
        <p v-if="project.hook" class="case-hook type-body-lg mt-6">
          {{ project.hook }}
        </p>
        <div class="case-meta mt-8">
          <p v-if="project.role" class="type-micro-cap">{{ project.role }}</p>
          <div v-if="project.tags?.length" class="case-tech mt-4">
            <UiEyebrow tone="muted" :rule="false" class="mb-2">{{ $t("case.tech") }}</UiEyebrow>
            <div class="d-flex flex-wrap ga-1">
              <v-chip v-for="tag in project.tags" :key="tag" size="x-small">
                {{ tag }}
              </v-chip>
            </div>
          </div>
        </div>
      </header>

      <!-- Progressive tiers, rendered from the `tiers` config -->
      <template v-for="tier in tiers" :key="tier.id">
        <UiRevealBlock v-if="tier.heading">
          <div class="case-tier">
            <UiDisplayTitle tag="h2" level="lg">{{ tier.heading }}</UiDisplayTitle>
            <p v-if="tier.note" class="case-tier-note type-micro-cap text-muted mt-2">
              {{ tier.note }}
            </p>
          </div>
        </UiRevealBlock>

        <UiRevealBlock v-for="sec in tier.sections" :key="sec.label">
          <section class="case-section">
            <UiEyebrow :rule="false" class="case-label">{{ sec.label }}</UiEyebrow>

            <p v-if="sec.kind === 'prose'" class="case-prose type-body-lg">
              {{ sec.text }}
            </p>

            <ul v-else-if="sec.kind === 'list'" class="case-list">
              <li v-for="item in sec.items" :key="item" class="type-body-md">{{ item }}</li>
            </ul>

            <div v-else class="case-impact section-surface">
              <ul>
                <li v-for="item in sec.items" :key="item" class="type-body-lg">{{ item }}</li>
              </ul>
            </div>
          </section>
        </UiRevealBlock>
      </template>

      <!-- Resources: repo / demo / docs when public, otherwise a way to reach out -->
      <UiRevealBlock>
        <aside class="case-encart section-surface pa-6 py-sm-8 px-sm-9">
          <template v-if="project.access === 'public'">
            <UiEyebrow :rule="false" class="mb-3">{{ $t("case.resources") }}</UiEyebrow>
            <div class="d-flex flex-wrap ga-3">
              <v-btn v-if="project.github" :href="project.github" target="_blank" rel="noopener" size="large">
                GitHub<v-icon end size="small" icon="mdi-arrow-top-right" />
              </v-btn>
              <v-btn v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" variant="text" size="large">
                Demo<v-icon end size="small" icon="mdi-arrow-top-right" />
              </v-btn>
              <v-btn v-if="project.docs" :href="project.docs" target="_blank" rel="noopener" variant="text" size="large">
                Documentation<v-icon end size="small" icon="mdi-arrow-top-right" />
              </v-btn>
            </div>
          </template>
          <template v-else>
            <UiEyebrow :rule="false" class="mb-3">{{ $t("case.private_title") }}</UiEyebrow>
            <p class="case-encart-text type-body-md text-muted">
              {{ $t("case.private_note") }}
            </p>
            <v-btn
              :to="localePath('/contact')"
              size="large"
              append-icon="mdi-arrow-right"
              class="mt-6"
            >
              {{ $t("projects.request_access") }}
            </v-btn>
          </template>
        </aside>
      </UiRevealBlock>
    </div>

    <div v-else class="text-center py-20">
      <p class="type-body-md text-muted">{{ $t("projects.not_found") }}</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const { data: project } = await useAsyncData(
  `project-${locale.value}-${route.params.slug}`,
  () =>
    queryCollection(`${locale.value}_projects`)
      .where("slug", "=", route.params.slug as string)
      .first(),
)

// ── Progressive reading tiers ─────────────────────────────────────────────
// The narrative fields are grouped into three tiers (overview → value →
// technical). Each entry maps a frontmatter field to a label + render kind.
// `tiers` resolves this against the current project so the template is a plain
// loop: absent fields are dropped, and a tier with no content disappears.
type SectionKind = "prose" | "list" | "impact"
interface ResolvedSection {
  label: string
  kind: SectionKind
  text?: string
  items?: string[]
}
interface ResolvedTier {
  id: string
  heading: string | null
  note?: string
  sections: ResolvedSection[]
}

const tierDefs: {
  id: string
  heading: () => string | null
  note?: () => string
  fields: { field: string; label: () => string; kind: SectionKind }[]
}[] = [
  {
    id: "overview",
    heading: () => null,
    fields: [
      { field: "intro", label: () => t("case.context"), kind: "prose" },
      { field: "challenge", label: () => t("case.challenge"), kind: "prose" },
      { field: "solution", label: () => t("case.solution"), kind: "prose" },
    ],
  },
  {
    id: "value",
    heading: () => t("case.section_features"),
    fields: [
      { field: "objectives", label: () => t("case.objectives"), kind: "list" },
      { field: "highlights", label: () => t("case.highlights"), kind: "list" },
      { field: "impact", label: () => t("case.impact"), kind: "impact" },
    ],
  },
  {
    id: "technical",
    heading: () => t("case.section_technical"),
    note: () => t("case.for_devs"),
    fields: [
      { field: "architecture", label: () => t("case.architecture"), kind: "prose" },
      { field: "deliverables", label: () => t("case.deliverables"), kind: "list" },
    ],
  },
]

const tiers = computed<ResolvedTier[]>(() => {
  const p = project.value as Record<string, unknown> | null
  if (!p) return []
  return tierDefs
    .map((tier) => {
      const sections = tier.fields.flatMap<ResolvedSection>((f) => {
        const value = p[f.field]
        if (f.kind === "prose") {
          return typeof value === "string" && value
            ? [{ label: f.label(), kind: f.kind, text: value }]
            : []
        }
        return Array.isArray(value) && value.length
          ? [{ label: f.label(), kind: f.kind, items: value as string[] }]
          : []
      })
      return { id: tier.id, heading: tier.heading(), note: tier.note?.(), sections }
    })
    .filter((tier) => tier.sections.length > 0)
})

if (project.value) {
  useSeoMeta({
    title: project.value.title,
    description: project.value.hook ?? project.value.intro,
    ogTitle: `${project.value.title} - Hamed Bouare`,
    ogDescription: project.value.hook ?? project.value.intro,
  })
  useJsonLd({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.value.title,
    abstract: project.value.hook,
    creator: { "@type": "Person", name: "Hamed Bouare", url: "https://hamedbouare.me" },
  })
}
</script>

<style scoped lang="scss">
.case-inner {
  max-width: 900px;
  margin: 0 auto;
}

// ── Hero ────────────────────────────────────────────────────────────────
.case-hero {
  padding-bottom: 3rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgb(var(--v-theme-border));
}
.case-hook {
  max-width: 640px;
  color: rgb(var(--v-theme-on-background)); // the lead reads in full ink
}
.case-meta .type-micro-cap {
  color: rgb(var(--v-theme-on-background));
}

// ── Tier divider — marks where each reading tier begins (the "for
// developers" cue lives on the technical tier). ──────────────────────────
.case-tier {
  padding-top: 3rem;

  @media (max-width: 767px) {
    padding-top: 2rem;
  }
}
.case-tier-note {
  letter-spacing: 0.96px;
}

// ── Section: label rail | content ───────────────────────────────────────
.case-section {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 3rem;
  padding: 2.75rem 0;
  border-bottom: 1px solid rgb(var(--v-theme-border));

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 2rem 0;
  }
}
.case-label {
  padding-top: 0.35rem; // optically align the eyebrow with the first line
  color: rgb(var(--v-theme-muted));
}
.case-prose {
  max-width: 620px;
  color: rgb(var(--v-theme-muted));
}

// Objectives / features / deliverables — hairline-marked list (the system's
// marker, not icons).
.case-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  li {
    color: rgb(var(--v-theme-on-background));
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.7em;
      width: 16px;
      height: 1px;
      background: currentColor;
    }
  }
}

// Impact — the payoff, set apart in a bordered surface panel.
.case-impact {
  border: 1px solid rgb(var(--v-theme-border));
  padding: 1.75rem 2rem;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  li {
    color: rgb(var(--v-theme-on-background));
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.75em;
      width: 16px;
      height: 1px;
      background: currentColor;
    }
  }
}

.back-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  margin-bottom: 2.5rem;
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: rgb(var(--v-theme-on-background));
  }
}

// Resources / private-project encart.
// Padding comes from Vuetify utilities in the template (pa-6 py-sm-8 px-sm-9),
// so the responsive step no longer needs a media query.
.case-encart {
  margin-top: 3rem;
  border: 1px solid rgb(var(--v-theme-border));
}
.case-encart-text {
  max-width: 560px;
}
</style>
