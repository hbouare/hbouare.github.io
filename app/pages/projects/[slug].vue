<!-- app/pages/projects/[slug].vue -->
<!--
  Project case study.

  Three reading tiers, each with a DIFFERENT visual form, because the same
  page has to satisfy four audiences that stop at different depths:

    1. The summit    — hero, facts strip, results. A recruiter can leave
                       here, in ~15 seconds, already convinced.
    2. The narrative — context/problem, then the response. A client or
                       delivery lead stops here.
    3. Under the hood — architecture prose, the layer plan, the decisions
                       and their costs. A senior developer reads to the end.

  Then a way forward: source access on request, and the next project.

  Rendering stays DATA-DRIVEN (`tierDefs` below): the tiers are one loop, not
  a dozen copied blocks, so ordering lives in one place and every project
  renders only the fields it actually has. Only the summit and the exit are
  written out, because they are singular rather than repeated.
-->
<template>
  <v-container class="case px-6 px-md-10 section-v-pad" fluid>
    <div v-if="project" class="case-inner">
      <NuxtLink :to="localePath('/projects')" class="back-link type-micro-cap text-muted">
        <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
        {{ $t("projects.back") }}
      </NuxtLink>

      <!-- ── 1. The summit ─────────────────────────────────────────────── -->
      <CaseHero
        :context="project.context"
        :title="project.title"
        :hook="project.hook"
      />

      <CaseFacts v-if="facts.length" :facts="facts" />

      <CaseOutcomes
        v-if="project.impact?.length"
        :heading="$t('case.impact')"
        :items="project.impact"
      />

      <!-- ── 2 & 3. Narrative, then the technical annex ─────────────────── -->
      <section v-for="tier in tiers" :key="tier.id" class="case-tier">
        <header class="case-tier-head">
          <UiDisplayTitle tag="h2" level="lg" reveal>
            {{ tier.heading }}
          </UiDisplayTitle>
          <UiRevealBlock v-if="tier.note">
            <p class="case-tier-note type-micro-cap text-muted mt-3">
              {{ tier.note }}
            </p>
          </UiRevealBlock>
        </header>

        <UiRevealBlock
          v-for="(sec, i) in tier.sections"
          :key="sec.label"
          :delay="i * 80"
        >
          <div class="case-section">
            <UiEyebrow :rule="false" class="case-label">{{ sec.label }}</UiEyebrow>

            <div class="case-section-body">
              <p v-if="sec.kind === 'prose'" class="case-prose type-body-lg">
                {{ sec.text }}
              </p>

              <ul v-else-if="sec.kind === 'list'" class="case-list">
                <li v-for="item in sec.items" :key="item" class="type-body-md">
                  {{ item }}
                </li>
              </ul>

              <CasePlan v-else-if="sec.kind === 'plan'" :layers="sec.layers!" />

              <CaseDecisions
                v-else
                :decisions="sec.decisions!"
                :labels="decisionLabels"
              />
            </div>
          </div>
        </UiRevealBlock>
      </section>

      <!-- Technologies: the raw stack, kept as chips at the foot of the
           technical tier rather than in the hero, where it competed with the
           hook for the first glance. -->
      <UiRevealBlock v-if="project.tags?.length">
        <div class="case-section case-tech">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.tech") }}</UiEyebrow>
          <div class="case-section-body d-flex flex-wrap ga-2">
            <v-chip v-for="tag in project.tags" :key="tag" size="small">
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </UiRevealBlock>

      <!-- ── The way forward ───────────────────────────────────────────── -->
      <UiRevealBlock>
        <CaseAccess />
      </UiRevealBlock>

      <CaseNext v-if="nextProject" :project="nextProject" />
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

const slug = route.params.slug as string

const { data: project } = await useAsyncData(
  `project-${locale.value}-${slug}`,
  () =>
    queryCollection(`${locale.value}_projects`)
      .where("slug", "=", slug)
      .first(),
)

// Sibling projects, for the "next project" band. Only the two fields that
// band needs are selected — a case study should not ship four full case
// studies in its payload just to render one link.
const { data: siblings } = await useAsyncData(
  `projects-nav-${locale.value}`,
  () =>
    queryCollection(`${locale.value}_projects`)
      // `order` has to be selected as well as sorted on: select() narrows the
      // row type, and order() can only reference a column that survived it.
      .select("slug", "title", "order")
      .order("order", "ASC")
      .all(),
)

// Wraps around, so the last project points back at the first and the
// sequence never dead-ends.
const nextProject = computed(() => {
  const all = siblings.value
  if (!all?.length) return null
  const i = all.findIndex((p) => p.slug === slug)
  if (i === -1) return null
  return all[(i + 1) % all.length] ?? null
})

// ── Facts strip ───────────────────────────────────────────────────────────
// A value still carrying its `TODO` placeholder counts as unfilled and is
// dropped, so an un-authored fact leaves the source with a visible reminder
// but never reaches the built page as a fabricated one.
const isFilled = (v: unknown): v is string =>
  typeof v === "string" &&
  v.trim() !== "" &&
  !v.trim().toUpperCase().startsWith("TODO")

const facts = computed(() => {
  const p = project.value
  if (!p) return []
  return (
    [
      ["case.role", p.role],
      ["case.period", p.period],
      ["case.team", p.team],
      ["case.status", p.status],
    ] as const
  )
    .filter(([, value]) => isFilled(value))
    .map(([key, value]) => ({ label: t(key), value: value as string }))
})

const decisionLabels = computed(() => ({
  problem: t("case.decision_problem"),
  choice: t("case.decision_choice"),
  consequence: t("case.decision_consequence"),
}))

// ── Progressive reading tiers ─────────────────────────────────────────────
// Each entry maps a frontmatter field to a label + a render kind. `tiers`
// resolves this against the current project, so the template is a plain
// loop: absent fields are dropped, and a tier with no content disappears
// entirely rather than rendering an empty heading.
type StackLayer = { layer: string; detail: string }
type Decision = { problem: string; choice: string; consequence: string }
type SectionKind = "prose" | "list" | "plan" | "decisions"

interface ResolvedSection {
  label: string
  kind: SectionKind
  text?: string
  items?: string[]
  layers?: StackLayer[]
  decisions?: Decision[]
}
interface ResolvedTier {
  id: string
  heading: string
  note?: string
  sections: ResolvedSection[]
}

const tierDefs: {
  id: string
  heading: () => string
  note?: () => string
  fields: { field: string; label: () => string; kind: SectionKind }[]
}[] = [
  {
    id: "problem",
    heading: () => t("case.section_problem"),
    fields: [
      { field: "intro", label: () => t("case.context"), kind: "prose" },
      { field: "challenge", label: () => t("case.challenge"), kind: "prose" },
      { field: "objectives", label: () => t("case.objectives"), kind: "list" },
    ],
  },
  {
    id: "response",
    heading: () => t("case.section_response"),
    fields: [
      { field: "solution", label: () => t("case.solution"), kind: "prose" },
      { field: "highlights", label: () => t("case.highlights"), kind: "list" },
    ],
  },
  {
    id: "technical",
    heading: () => t("case.section_technical"),
    note: () => t("case.for_devs"),
    // The technical tier is intentionally kept to the architecture narrative.
    // The plan diagram (`stack`), the decisions table (`decisions`) and the
    // deliverables list were removed from the page on request. Their content
    // still lives in frontmatter and their render kinds ("plan"/"decisions")
    // are still supported below, so re-adding a field here restores them.
    fields: [
      { field: "architecture", label: () => t("case.architecture"), kind: "prose" },
    ],
  },
]

/** Turns one frontmatter value into a renderable section, or nothing. */
const resolveSection = (
  value: unknown,
  label: string,
  kind: SectionKind,
): ResolvedSection[] => {
  if (kind === "prose") {
    return typeof value === "string" && value ? [{ label, kind, text: value }] : []
  }
  if (!Array.isArray(value) || !value.length) return []
  if (kind === "list") return [{ label, kind, items: value as string[] }]
  if (kind === "plan") return [{ label, kind, layers: value as StackLayer[] }]
  return [{ label, kind, decisions: value as Decision[] }]
}

const tiers = computed<ResolvedTier[]>(() => {
  const p = project.value as Record<string, unknown> | null
  if (!p) return []
  return tierDefs
    .map((tier) => ({
      id: tier.id,
      heading: tier.heading(),
      note: tier.note?.(),
      sections: tier.fields.flatMap((f) =>
        resolveSection(p[f.field], f.label(), f.kind),
      ),
    }))
    .filter((tier) => tier.sections.length > 0)
})

if (project.value) {
  const p = project.value
  const description = p.hook ?? p.intro
  const url = `https://hamedbouare.me${localePath(`/projects/${p.slug}`)}`

  useSeoMeta({
    title: p.title,
    description,
    ogTitle: `${p.title} - Hamed Bouare`,
    ogDescription: description,
    ogType: "article",
  })

  useJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": url,
        name: p.title,
        url,
        abstract: p.hook,
        description,
        // The stack doubles as keywords — it is the vocabulary people
        // actually search these projects by.
        keywords: p.tags?.join(", "),
        inLanguage: locale.value,
        creator: {
          "@type": "Person",
          name: "Hamed Bouare",
          url: "https://hamedbouare.me",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Projects",
            item: `https://hamedbouare.me${localePath("/projects")}`,
          },
          { "@type": "ListItem", position: 2, name: p.title, item: url },
        ],
      },
    ],
  })
}
</script>

<style scoped lang="scss">
// Wider than the previous 900px column: the facts strip, the results grid
// and the technical plan are multi-column blocks that were being squeezed.
// Prose inside stays capped in ch, so the measure never follows the
// container.
.case-inner {
  max-width: 1080px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  margin-bottom: var(--space-huge);
  transition: color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: rgb(var(--v-theme-on-background));
  }
}

// ── Tier ────────────────────────────────────────────────────────────────
// The hairline now marks a TIER boundary, not every section. Previously
// every one of eight sections carried an identical rule and identical
// padding, which is what made the page read as one repeated block.
.case-tier {
  padding-top: var(--section-pad);
  border-top: 1px solid rgb(var(--v-theme-border));
}
.case-tier-head {
  margin-bottom: var(--space-huge);
}
.case-tier-note {
  letter-spacing: 0.96px;
}

// ── Section: label rail | content ───────────────────────────────────────
.case-section {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-huge);
  padding-bottom: var(--space-huge);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    // The rail collapses on phones; the label needs real separation from the
    // text or the two read as one paragraph.
    gap: var(--space-sm);
  }
}
.case-label {
  padding-top: 0.35rem; // optically align the eyebrow with the first line
  color: rgb(var(--v-theme-muted));
}
.case-section-body {
  min-width: 0; // lets long unbroken strings wrap instead of widening the grid
}

// Full ink: this is the narrative, and it should not read as weaker than the
// bullet lists beside it. Secondary tone is reserved for supporting text
// (plan details, the context and cost of a decision).
.case-prose {
  margin: 0;
  max-width: var(--measure-prose);
  color: rgb(var(--v-theme-on-background));
}

// Hairline-marked list — the system's marker, not icons.
.case-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  max-width: var(--measure-prose);

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

.case-tech {
  padding-bottom: var(--space-huge);
}
</style>
