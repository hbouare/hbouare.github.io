<!-- app/pages/projects/index.vue -->
<template>
  <v-container class="px-6 px-md-10 py-20" fluid>
    <UiRevealBlock>
      <UiSectionHeader
        :label="$t('projects.section')"
        :line1="$t('projects.title_1')"
        :line-em="$t('projects.title_em')"
      />
    </UiRevealBlock>

    <!-- Skeleton loaders -->
    <v-row v-if="!projects" class="mt-14" no-gutters>
      <v-col v-for="n in 4" :key="n" cols="12" :md="n === 1 ? 12 : 6">
        <div class="proj-skeleton">
          <v-skeleton-loader type="article" color="surface" rounded="0" />
        </div>
      </v-col>
    </v-row>

    <div v-else class="proj-grid mt-14">
      <!-- Featured project — full width -->
      <UiRevealBlock v-if="featured" class="proj-featured-wrap">
        <v-card class="proj-card proj-card--featured" color="surface" variant="flat" rounded="0">
          <div class="proj-accent-bar" />
          <div class="proj-card-inner">
            <div class="d-flex align-center ga-3 mb-4">
              <span class="proj-num font-mono text-primary">001</span>
              <v-chip color="primary" variant="flat" rounded="0" size="x-small" class="font-mono">
                {{ $t("projects.featured") }}
              </v-chip>
            </div>
            <h2 class="proj-title font-playfair">{{ featured.title }}</h2>
            <div class="proj-body font-mono text-muted mt-4">
              <ContentRenderer :value="featured" />
            </div>
            <div class="d-flex flex-wrap ga-1 mt-5">
              <v-chip
                v-for="tag in featured.tags"
                :key="tag"
                variant="outlined"
                color="primary"
                rounded="0"
                size="x-small"
                class="font-mono"
              >{{ tag }}</v-chip>
            </div>
            <div class="proj-actions mt-6">
              <v-btn
                v-if="featured.github"
                :href="featured.github"
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
                v-if="featured.demo"
                :href="featured.demo"
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
        </v-card>
      </UiRevealBlock>

      <!-- Other projects — 2 column grid -->
      <div class="proj-others">
        <UiRevealBlock
          v-for="(proj, i) in others"
          :key="proj.id"
          :delay="(i + 1) * 100"
        >
          <v-card class="proj-card" color="surface" variant="flat" rounded="0">
            <div class="proj-accent-bar" />
            <div class="proj-card-inner">
              <span class="proj-num font-mono text-primary mb-3">
                {{ String(i + 2).padStart(3, "0") }}
              </span>
              <h3 class="proj-title font-playfair">{{ proj.title }}</h3>
              <div class="proj-body font-mono text-muted mt-3">
                <ContentRenderer :value="proj" />
              </div>
              <div class="d-flex flex-wrap ga-1 mt-4">
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
                <a
                  v-if="proj.github"
                  :href="proj.github"
                  target="_blank"
                  rel="noopener"
                  class="proj-link font-mono text-muted"
                >
                  GitHub <v-icon size="x-small" icon="mdi-arrow-top-right" />
                </a>
                <a
                  v-if="proj.demo"
                  :href="proj.demo"
                  target="_blank"
                  rel="noopener"
                  class="proj-link font-mono text-primary"
                >
                  Demo <v-icon size="x-small" icon="mdi-arrow-top-right" />
                </a>
              </div>
            </div>
          </v-card>
        </UiRevealBlock>
      </div>
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

const featured = computed(() => projects.value?.find((p) => p.featured))
const others = computed(() => projects.value?.filter((p) => !p.featured) ?? [])
</script>

<style scoped lang="scss">
.proj-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// Cards — shared style using flat variant + manual border
.proj-card {
  position: relative;
  overflow: hidden;
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
  @media (max-width: 600px) {
    padding: 1.5rem;
  }
}

// Featured — full width, larger
.proj-card--featured {
  .proj-card-inner {
    padding: 2.5rem 3rem;
    @media (max-width: 600px) {
      padding: 1.5rem;
    }
  }
  .proj-title {
    font-size: 1.8rem;
  }
  .proj-body {
    max-width: 640px;
  }
}

// Others — 2 columns
.proj-others {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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
.proj-link {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-decoration: none;
  transition: color 0.2s;
  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
.proj-skeleton {
  padding: 1rem;
}
</style>
