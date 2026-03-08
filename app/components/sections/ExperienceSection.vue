<template>
  <section id="experience" class="section-pad section-surface">
    <v-container class="px-6 px-md-10" fluid>
      <UiRevealBlock>
        <UiSectionHeader
          :label="$t('experience.section')"
          :line1="$t('experience.title_1')"
          :line-em="$t('experience.title_em')"
        />
      </UiRevealBlock>

      <div class="exp-list mt-14">
        <!-- Skeleton loaders while data loads -->
        <template v-if="!experiences">
          <div v-for="n in 3" :key="n" class="exp-skeleton">
            <v-skeleton-loader
              type="list-item-three-line"
              color="surface"
              rounded="0"
            />
          </div>
        </template>

        <UiRevealBlock
          v-for="(exp, i) in experiences"
          :key="exp.id"
          :delay="i * 100"
        >
          <div class="exp-item">
            <div class="exp-item-grid">
              <div class="exp-year font-mono text-muted">{{ exp.period }}</div>
              <div class="exp-content">
                <h3 class="exp-role font-playfair">{{ exp.role }}</h3>
                <p class="exp-company font-mono text-primary mt-1">
                  {{ exp.company }}
                </p>
                <div class="exp-body font-mono text-muted mt-3">
                  <ContentRenderer :value="exp" />
                </div>
                <div class="d-flex flex-wrap ga-1 mt-3">
                  <v-chip
                    v-for="tag in exp.tags"
                    :key="tag"
                    variant="outlined"
                    color="primary"
                    rounded="0"
                    size="x-small"
                    class="font-mono"
                  >
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
              <div
                class="exp-location font-mono text-muted text-right d-none d-md-flex"
              >
                <span class="exp-flag">{{ exp.flag }}</span>
                <span class="mt-1">{{ exp.location }}</span>
              </div>
            </div>
          </div>
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
</script>

<style scoped lang="scss">
.exp-item {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.12);
  transition:
    padding-left 0.3s ease,
    background 0.3s ease;
  &:hover {
    padding-left: 14px;
    background: rgba(var(--v-theme-primary), 0.02);
  }
}
.exp-item-grid {
  display: grid;
  grid-template-columns: 110px 1fr 140px;
  gap: 2rem;
  align-items: start;
  padding: 2rem 0;
  @media (max-width: 768px) {
    grid-template-columns: 90px 1fr;
  }
}
.exp-year {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  padding-top: 4px;
  line-height: 1.4;
}
.exp-role {
  font-size: 1.4rem;
  font-weight: 700;
  transition: color 0.3s;
  .exp-item:hover & {
    color: rgb(var(--v-theme-primary));
  }
}
.exp-company {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}
.exp-body {
  font-size: 0.72rem;
  line-height: 1.8;
  :deep(p) {
    margin: 0;
  }
}
.exp-location {
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  padding-top: 4px;
}
.exp-flag {
  font-size: 1.2rem;
}
.exp-skeleton {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.12);
  padding: 1rem 0;
}
</style>
