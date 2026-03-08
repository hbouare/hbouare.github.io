<!-- app/components/sections/ProjectsSection.vue -->
<template>
  <section id="projects" class="section-pad">
    <v-container class="px-6 px-md-10" fluid>
      <UiRevealBlock>
        <div
          class="d-flex align-end justify-space-between flex-wrap ga-4 mb-14"
        >
          <UiSectionHeader
            :label="$t('projects.section')"
            :line1="$t('projects.title_1')"
            :line-em="$t('projects.title_em')"
          />
          <v-btn
            :to="localePath('/projects')"
            variant="text"
            color="primary"
            class="font-mono text-uppercase"
            append-icon="mdi-arrow-right"
            rounded="0"
          >
            {{ $t("projects.view_all") }}
          </v-btn>
        </div>
      </UiRevealBlock>

      <div class="projects-grid">
        <!-- Skeleton loaders while data loads -->
        <template v-if="!projects">
          <v-skeleton-loader type="card" color="surface" rounded="0" class="mb-1" />
          <v-row no-gutters class="proj-others-grid">
            <v-col v-for="n in 3" :key="n" cols="12" sm="6" md="4">
              <v-skeleton-loader type="card" color="surface" rounded="0" />
            </v-col>
          </v-row>
        </template>

        <!-- Featured card -->
        <UiRevealBlock v-if="featured">
          <v-card
            class="proj-featured"
            color="surface"
            variant="outlined"
            rounded="0"
          >
            <div class="proj-featured-inner">
              <div class="proj-featured-content">
                <v-chip
                  color="primary"
                  variant="flat"
                  rounded="0"
                  size="x-small"
                  class="font-mono mb-4"
                >
                  {{ $t("projects.featured") }}
                </v-chip>
                <p class="proj-num font-mono text-primary mb-4">001</p>
                <h3 class="proj-title font-playfair">{{ featured.title }}</h3>
                <div class="proj-body font-mono text-muted mt-3">
                  <ContentRenderer :value="featured" />
                </div>
                <div class="d-flex flex-wrap ga-1 mt-4">
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
              </div>
              <div class="proj-code-box">
                <div class="code-line">
                  <span class="code-secondary">@router</span>.get(<span class="code-primary"
                    >"/transactions"</span
                  >)
                </div>
                <div class="code-line">
                  <span class="code-accent">async def</span> get_go(
                </div>
                <div class="code-line code-indent">
                  token = Depends(<span class="code-secondary">auth_flow</span>),
                </div>
                <div class="code-line code-indent">
                  session = Depends(<span class="code-secondary">redis_store</span>)
                </div>
                <div class="code-line">):</div>
                <div class="code-line code-indent">
                  data = <span class="code-accent">await</span> grexel.fetch(token)
                </div>
                <div class="code-line code-indent">
                  <span class="code-accent">return</span>
                  <span class="code-secondary">PDFResponse</span>(data)
                </div>
              </div>
            </div>
          </v-card>
        </UiRevealBlock>

        <!-- Other cards -->
        <v-row no-gutters class="proj-others-grid">
          <v-col
            v-for="(proj, i) in others"
            :key="proj.id"
            cols="12"
            sm="6"
            md="4"
          >
            <UiRevealBlock :delay="i * 100">
              <v-card
                class="proj-small"
                color="surface"
                variant="outlined"
                rounded="0"
              >
                <v-card-text class="pa-8">
                  <p class="proj-num font-mono text-primary mb-3">
                    {{ String(i + 2).padStart(3, "0") }}
                  </p>
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
                  <v-icon
                    class="proj-arrow text-primary"
                    icon="mdi-arrow-top-right"
                    size="small"
                  />
                </v-card-text>
              </v-card>
            </UiRevealBlock>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()

const { data: projects } = await useAsyncData(`projects-${locale.value}`, () =>
  queryCollection(`${locale.value}_projects`).order("order", "ASC").all(),
)

const featured = computed(() => projects.value?.find((p) => p.featured))
const others = computed(() => projects.value?.filter((p) => !p.featured) ?? [])
</script>

<style scoped lang="scss">
.projects-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

// Featured card — border-color default set by global override
.proj-featured {
  transition: border-color 0.4s;
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.45);
  }
}
.proj-featured-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 3rem 2.75rem;
  align-items: center;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
.proj-others-grid {
  gap: 2px;
}
.proj-small {
  height: 100%;
  transition: border-color 0.4s, transform 0.3s;
  position: relative;
  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.45);
    transform: translateY(-3px);
  }
  &:hover .proj-arrow {
    opacity: 1;
    transform: translate(0, 0);
  }
}
.proj-num {
  font-size: 0.62rem;
  letter-spacing: 0.15em;
}
.proj-title {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}
.proj-body {
  font-size: 0.7rem;
  line-height: 1.8;
  :deep(p) {
    margin: 0;
  }
}
.proj-arrow {
  position: absolute;
  bottom: 24px;
  right: 24px;
  opacity: 0;
  transform: translate(-6px, 6px);
  transition: all 0.3s;
}

// Code box
.proj-code-box {
  background: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  padding: 1.5rem;
  font-family: "DM Mono", monospace;
  font-size: 0.62rem;
  line-height: 2;
}
.code-line {
  white-space: pre;
  color: rgb(var(--v-theme-muted));
}
.code-indent {
  padding-left: 1rem;
}
.code-secondary { color: rgb(var(--v-theme-secondary)); }
.code-accent { color: rgb(var(--v-theme-accent)); }
.code-primary { color: rgb(var(--v-theme-primary)); }
</style>
