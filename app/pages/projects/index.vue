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
    <div v-if="!projects" class="proj-grid mt-14">
      <div v-for="n in 4" :key="n" class="proj-skeleton">
        <v-skeleton-loader type="article" />
      </div>
    </div>

    <!-- All projects — uniform 2-column grid -->
    <div v-else class="proj-grid mt-14">
      <UiRevealBlock
        v-for="(proj, i) in projects"
        :key="proj.id"
        :delay="i * 100"
      >
        <v-card class="proj-card hairline-interactive" variant="outlined">
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

            <!-- Context line: anonymised client · period -->
            <p
              v-if="proj.context || proj.period"
              class="proj-meta type-micro-cap text-muted mt-2"
            >
              <span v-if="proj.context">{{ proj.context }}</span>
              <span v-if="proj.context && proj.period"> · </span>
              <span v-if="proj.period">{{ proj.period }}</span>
            </p>
            <p v-if="proj.role" class="proj-role type-micro-cap mt-1">
              {{ proj.role }}
            </p>

            <div class="proj-body type-body-md text-muted mt-3">
              <ContentRenderer :value="proj" />
            </div>

            <!-- Impact — the one full-ink moment, carries the credibility. -->
            <ul v-if="proj.impact?.length" class="proj-impact mt-4">
              <li v-for="line in proj.impact" :key="line" class="type-body-md">
                {{ line }}
              </li>
            </ul>

            <div class="proj-card-footer">
              <div class="d-flex flex-wrap ga-1">
                <v-chip v-for="tag in proj.tags" :key="tag" size="x-small">
                  {{ tag }}
                </v-chip>
              </div>

              <div class="proj-actions mt-5">
                <!-- Public source: real links. -->
                <template v-if="proj.access === 'public'">
                  <v-btn
                    v-if="proj.github"
                    :href="proj.github"
                    target="_blank"
                    rel="noopener"
                    size="small"
                  >
                    GitHub
                    <v-icon end size="x-small" icon="mdi-arrow-top-right" />
                  </v-btn>
                  <v-btn
                    v-if="proj.demo"
                    :href="proj.demo"
                    target="_blank"
                    rel="noopener"
                    size="small"
                  >
                    Demo
                    <v-icon end size="x-small" icon="mdi-arrow-top-right" />
                  </v-btn>
                </template>

                <!-- Private source: state it, and turn the dead-end into a
                     qualified contact rather than empty buttons. -->
                <template v-else>
                  <v-chip size="x-small" class="proj-private">
                    {{ $t("projects.status_private") }}
                  </v-chip>
                  <v-btn
                    :to="localePath('/contact')"
                    variant="text"
                    size="small"
                    append-icon="mdi-arrow-right"
                  >
                    {{ $t("projects.request_access") }}
                  </v-btn>
                </template>
              </div>
            </div>
          </div>
        </v-card>
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

// 2-column uniform grid
.proj-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  // Stretch reveal wrappers so cards fill equal height
  :deep(.reveal-block) {
    height: 100%;
  }
}

// Cards — equal height via stretch. Hairline + hover come from
// .hairline-interactive.
.proj-card {
  position: relative;
  overflow: hidden;
  height: 100%;

  &:hover .proj-accent-bar {
    width: 4px;
  }
}

// Left rule — monochrome, the system has no accent colour.
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

// Sizes come from the type tiers.
.proj-num {
  display: block;
}
.proj-meta {
  line-height: 1.5;
}
.proj-role {
  color: rgb(var(--v-theme-on-background));
}
.proj-body :deep(p) {
  margin: 0;
}

// Impact list — full ink, hairline-marked, the card's one emphatic moment.
.proj-impact {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  li {
    color: rgb(var(--v-theme-on-background));
    padding-left: 1.1rem;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0.75em;
      width: 12px;
      height: 1px;
      background: currentColor;
    }
  }
}

// Push tags + actions to bottom so cards align
.proj-card-footer {
  margin-top: auto;
  padding-top: 1.25rem;
}
.proj-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.proj-skeleton {
  padding: 1rem;
}
</style>
