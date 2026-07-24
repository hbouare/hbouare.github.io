<!-- app/pages/projects/index.vue -->
<template>
  <v-container class="px-6 px-md-10 section-v-pad" fluid>
    <UiSectionHeader
      :label="$t('projects.section')"
      :line1="$t('projects.title_1')"
      :line-em="$t('projects.title_em')"
    />

    <!-- Privacy policy, stated once rather than on every card. -->
    <p class="projects-privacy type-body-md text-muted mt-6">
      {{ $t("projects.privacy_note") }}
    </p>

    <!-- Skeleton loaders -->
    <v-row v-if="!projects" class="mt-14">
      <v-col v-for="n in 4" :key="n" cols="12" md="6">
        <v-skeleton-loader type="article" class="pa-4" />
      </v-col>
    </v-row>

    <!-- Teasers — each links to its full case study. One column below md, two
         at md and up — the Vuetify grid owns the responsive switch, so there
         is no media query here. `d-flex` on the col + `h-100` on the reveal
         wrapper lets the card stretch to equal heights per row. -->
    <v-row v-else class="mt-14">
      <v-col
        v-for="(proj, i) in projects"
        :key="proj.slug"
        cols="12"
        md="6"
        class="d-flex"
      >
        <UiRevealBlock :delay="i * 100" class="h-100 w-100">
          <NuxtLink
            :to="localePath(`/projects/${proj.slug}`)"
            class="proj-card hairline-interactive text-decoration-none"
          >
          <div class="proj-accent-bar" />
          <div class="proj-card-inner pa-6 py-sm-8 px-sm-10">
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
      </v-col>
    </v-row>
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

// Only the fields the teaser cards render. Without select(), Nuxt Content
// serialises every full case study — architecture, decisions, deliverables —
// into this page's prerendered _payload.json, which the index never reads and
// the visitor still downloads.
const { data: projects } = await useAsyncData(`projects-all-${locale.value}`, () =>
  queryCollection(`${locale.value}_projects`)
    .select("slug", "title", "context", "hook", "tags", "featured", "order")
    .order("order", "ASC")
    .all(),
)
</script>

<style scoped lang="scss">
// Privacy note — hairline caption, capped width for readability.
.projects-privacy {
  max-width: 640px;
}

// Teaser card — the whole card is the link. Hairline + hover come from
// .hairline-interactive. The 1→2 column responsive switch and equal-height
// stretch are handled by the Vuetify grid in the template (v-row / v-col +
// d-flex), so there is no grid CSS or media query here any more.
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

// Padding comes from Vuetify utilities in the template (pa-6 py-sm-8
// px-sm-10), so the responsive step no longer needs a media query.
.proj-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
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
</style>
