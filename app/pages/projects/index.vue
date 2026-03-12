<!-- app/pages/projects/index.vue -->
<template>
  <v-container class="px-6 px-md-10 section-v-pad" fluid>
    <UiRevealBlock>
      <UiSectionHeader
        :label="$t('projects.section')"
        :line1="$t('projects.title_1')"
        :line-em="$t('projects.title_em')"
      />
    </UiRevealBlock>

    <!-- Skeleton loaders -->
    <div v-if="!projects" class="proj-grid mt-14">
      <div v-for="n in 4" :key="n" class="proj-skeleton">
        <v-skeleton-loader type="article" color="surface" rounded="0" />
      </div>
    </div>

    <!-- All projects — uniform 2-column grid -->
    <div v-else class="proj-grid mt-14">
      <UiRevealBlock
        v-for="(proj, i) in projects"
        :key="proj.id"
        :delay="i * 100"
      >
        <v-card class="proj-card" color="surface" variant="flat" rounded="0">
          <div class="proj-accent-bar" />
          <div class="proj-card-inner">
            <div class="d-flex align-center ga-3 mb-3">
              <span class="proj-num font-mono text-primary">
                {{ String(i + 1).padStart(3, "0") }}
              </span>
              <v-chip
                v-if="proj.featured"
                color="primary"
                variant="flat"
                rounded="0"
                size="x-small"
                class="font-mono"
              >
                {{ $t("projects.featured") }}
              </v-chip>
            </div>
            <h3 class="proj-title font-playfair">{{ proj.title }}</h3>
            <div class="proj-body font-mono text-muted mt-3">
              <ContentRenderer :value="proj" />
            </div>
            <div class="proj-card-footer">
              <div class="d-flex flex-wrap ga-1">
                <v-chip
                  v-for="tag in proj.tags"
                  :key="tag"
                  variant="outlined"
                  color="primary"
                  rounded="0"
                  size="x-small"
                  class="font-mono"
                >{{ tag }}</v-chip>
              </div>
              <div class="proj-actions mt-5">
                <v-btn
                  v-if="proj.github"
                  :href="proj.github"
                  target="_blank"
                  rel="noopener"
                  variant="outlined"
                  color="primary"
                  size="small"
                  class="font-mono"
                  rounded="0"
                >
                  GitHub
                  <v-icon end size="x-small" icon="mdi-arrow-top-right" />
                </v-btn>
                <v-btn
                  v-if="proj.demo"
                  :href="proj.demo"
                  target="_blank"
                  rel="noopener"
                  variant="flat"
                  color="primary"
                  size="small"
                  class="font-mono"
                  rounded="0"
                >
                  Demo
                  <v-icon end size="x-small" icon="mdi-arrow-top-right" />
                </v-btn>
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
useSeoMeta({
  title: "Projects",
  description: t("projects.meta_desc"),
  ogTitle: "Projects - Hamed Bouare",
  ogDescription: t("projects.meta_desc"),
})

const { data: projects } = await useAsyncData(
  `projects-all-${locale.value}`,
  () => queryCollection(`${locale.value}_projects`).order("order", "ASC").all(),
)

</script>

<style scoped lang="scss">
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

// Cards — equal height via stretch
.proj-card {
  position: relative;
  overflow: hidden;
  height: 100%;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition: border-color 0.3s, box-shadow 0.3s;
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.25);
    .proj-accent-bar {
      width: 4px;
    }
    .proj-title {
      color: rgb(var(--v-theme-primary));
    }
  }
}

// Left accent bar
.proj-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: rgb(var(--v-theme-primary));
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

// Push tags + actions to bottom so cards align
.proj-card-footer {
  margin-top: auto;
  padding-top: 1.25rem;
}

.proj-num {
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  display: block;
}
.proj-title {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.3s;
}
.proj-body {
  font-size: 0.72rem;
  line-height: 1.8;
  :deep(p) {
    margin: 0;
  }
}
.proj-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.proj-skeleton {
  padding: 1rem;
}
</style>
