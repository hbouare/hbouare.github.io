<!-- app/pages/projects/[slug].vue -->
<!--
  Project case study. The narrative lives in structured frontmatter fields
  (hook / intro / challenge / solution / highlights / impact) so this page
  controls the hierarchy precisely — an editorial "label rail + content"
  layout rather than a wall of prose. Reuses the design-system primitives
  and tokens; icons are deliberately avoided to stay coherent with the
  monochrome, hairline identity (the eyebrow + rule IS the system's marker).
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

      <!-- Hero -->
      <header class="case-hero">
        <UiEyebrow class="mb-4">{{ project.context }}</UiEyebrow>
        <UiDisplayTitle tag="h1" level="xl">{{ project.title }}</UiDisplayTitle>
        <p v-if="project.hook" class="case-hook type-body-lg mt-6">
          {{ project.hook }}
        </p>
        <div class="case-meta mt-8">
          <p v-if="project.role" class="type-micro-cap">{{ project.role }}</p>
          <div class="d-flex flex-wrap ga-1 mt-3">
            <v-chip v-for="tag in project.tags" :key="tag" size="x-small">
              {{ tag }}
            </v-chip>
          </div>
        </div>
      </header>

      <!-- Narrative sections: label rail | content -->
      <UiRevealBlock v-if="project.intro">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.context") }}</UiEyebrow>
          <p class="case-prose type-body-lg">{{ project.intro }}</p>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.objectives?.length">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.objectives") }}</UiEyebrow>
          <ul class="case-list">
            <li v-for="o in project.objectives" :key="o" class="type-body-md">{{ o }}</li>
          </ul>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.challenge">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.challenge") }}</UiEyebrow>
          <p class="case-prose type-body-lg">{{ project.challenge }}</p>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.solution">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.solution") }}</UiEyebrow>
          <p class="case-prose type-body-lg">{{ project.solution }}</p>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.architecture">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.architecture") }}</UiEyebrow>
          <p class="case-prose type-body-lg">{{ project.architecture }}</p>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.highlights?.length">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.highlights") }}</UiEyebrow>
          <ul class="case-list">
            <li v-for="h in project.highlights" :key="h" class="type-body-md">{{ h }}</li>
          </ul>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.deliverables?.length">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.deliverables") }}</UiEyebrow>
          <ul class="case-list">
            <li v-for="d in project.deliverables" :key="d" class="type-body-md">{{ d }}</li>
          </ul>
        </section>
      </UiRevealBlock>

      <UiRevealBlock v-if="project.impact?.length">
        <section class="case-section">
          <UiEyebrow :rule="false" class="case-label">{{ $t("case.impact") }}</UiEyebrow>
          <div class="case-impact section-surface">
            <ul>
              <li v-for="line in project.impact" :key="line" class="type-body-lg">
                {{ line }}
              </li>
            </ul>
          </div>
        </section>
      </UiRevealBlock>

      <!-- Private-project note — a professional invitation to reach out. -->
      <UiRevealBlock>
        <aside class="case-encart section-surface pa-6 py-sm-8 px-sm-9">
          <template v-if="project.access === 'public'">
            <UiEyebrow :rule="false" class="mb-3">{{ $t("case.open_title") }}</UiEyebrow>
            <div class="d-flex flex-wrap ga-3">
              <v-btn v-if="project.github" :href="project.github" target="_blank" rel="noopener" size="large">
                GitHub<v-icon end size="small" icon="mdi-arrow-top-right" />
              </v-btn>
              <v-btn v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" variant="text" size="large">
                Demo<v-icon end size="small" icon="mdi-arrow-top-right" />
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

// Private-project encart — a distinct, professional invitation to reach out.
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
