<!-- app/pages/projects/index.vue -->
<template>
  <v-container class="px-6 px-md-10 section-v-pad" fluid>
    <UiSectionHeader
      :label="$t('projects.section')"
      :line1="$t('projects.title_1')"
      :line-em="$t('projects.title_em')"
    />

    <!-- Privacy policy, stated once rather than on every card. -->
    <p class="projects-privacy type-caption text-muted mt-6">
      {{ $t("projects.privacy_note") }}
    </p>

    <!-- Skeleton loaders -->
    <div v-if="!projects" class="proj-grid ga-4 ga-md-6 mt-14">
      <div v-for="n in 4" :key="n" class="proj-skeleton">
        <v-skeleton-loader type="article" />
      </div>
    </div>

    <!-- Teasers — each links to its full case study. -->
    <div v-else class="proj-grid ga-4 ga-md-6 mt-14">
      <UiRevealBlock
        v-for="(proj, i) in projects"
        :key="proj.slug"
        :delay="i * 100"
      >
        <NuxtLink
          :to="localePath(`/projects/${proj.slug}`)"
          class="proj-card hairline-interactive text-decoration-none"
        >
          <div class="proj-accent-bar" />
          <div class="proj-card-inner">
            <div class="d-flex align-center ga-3 mb-3">
              <span class="proj-num type-micro-cap">
                {{ String(i + 1).padStart(3, "0") }}
              </span>
              <v-chip v-if="proj.featured" variant="flat" size="x-small">
                {{ $t("projects.featured") }}
              </v-chip>
            </div>

            <h3 class="proj-title type-title">{{ proj.title }}</h3>

            <p v-if="proj.context" class="proj-context type-micro-cap text-muted mt-2">
              {{ proj.context }}
            </p>

            <p v-if="proj.hook" class="proj-hook type-body-md mt-4">
              {{ proj.hook }}
            </p>

            <div class="proj-card-footer">
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="tag in proj.tags" :key="tag" size="x-small">
                  {{ tag }}
                </v-chip>
              </div>
              <p class="proj-cta type-micro-cap mt-5">
                {{ $t("projects.view_case") }}
                <v-icon size="small" icon="mdi-arrow-right" class="proj-arrow" />
              </p>
            </div>
          </div>
        </NuxtLink>
      </UiRevealBlock>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: "Projects",
  description: t("projects.meta_desc"),
  ogTitle: "Projects - Hamed Bouare",
  ogDescription: t("projects.meta_desc"),
})

const { data: projects } = await useAsyncData(`projects-all-${locale.value}`, () =>
  queryCollection(`${locale.value}_projects`).order("order", "ASC").all(),
)
</script>

<style scoped lang="scss">
// Privacy note — hairline caption, capped width for readability.
.projects-privacy {
  max-width: 640px;
}

// 2-column grid. Gap set with Vuetify's responsive `ga-*` utilities on the
// element. One column below md, two at md and up.
.proj-grid {
  display: grid;
  grid-template-columns: 1fr;
  @media (min-width: 960px) {
    grid-template-columns: 1fr 1fr;
  }
  :deep(.reveal-block) {
    height: 100%;
  }
}

// Teaser card — the whole card is the link. Hairline + hover come from
// .hairline-interactive.
.proj-card {
  display: block;
  position: relative;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgb(var(--v-theme-border));

  &:hover .proj-accent-bar {
    width: 4px;
  }
  &:hover .proj-arrow {
    transform: translateX(4px);
  }
  &:hover .proj-title {
    color: rgb(var(--v-theme-on-background));
  }
}

// Left rule — monochrome.
.proj-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: rgb(var(--v-theme-on-background));
  transition: width 0.3s ease;
}

.proj-card-inner {
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  @media (max-width: 599px) {
    padding: 1.5rem;
  }
}

.proj-num {
  display: block;
}
.proj-title {
  color: rgb(var(--v-theme-on-background));
  transition: color 0.3s ease;
}
.proj-hook {
  color: rgb(var(--v-theme-muted));
  max-width: 42ch;
}

// Push tags + CTA to the bottom so cards align.
.proj-card-footer {
  margin-top: auto;
  padding-top: 1.5rem;
}
.proj-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: rgb(var(--v-theme-on-background));
}
.proj-arrow {
  transition: transform 0.3s ease;
}
.proj-skeleton {
  padding: 1rem;
}
</style>
