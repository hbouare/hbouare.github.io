<template>
  <section id="experience" class="section-pad section-surface">
    <v-container class="px-6 px-md-10" fluid>
      <UiSectionHeader
          :label="$t('experience.section')"
          :line1="$t('experience.title_1')"
          :line-em="$t('experience.title_em')"
        />

      <div class="exp-list mt-14">
        <!-- Skeleton loaders while data loads -->
        <template v-if="!experiences">
          <div v-for="n in 3" :key="n" class="exp-skeleton">
            <v-skeleton-loader type="list-item-three-line" />
          </div>
        </template>

        <UiRevealBlock
          v-for="(exp, i) in experiences"
          :key="exp.id"
          :delay="i * 100"
        >
          <div class="exp-item">
            <v-row no-gutters class="exp-row">
              <v-col cols="12" md="2" class="type-micro-cap text-muted">
                {{ exp.period }}
              </v-col>
              <v-col cols="12" md="8">
                <h3 class="exp-role type-title">{{ exp.role }}</h3>
                <p class="type-micro-cap mt-1">{{ exp.company }}</p>
                <!-- Mobile location -->
                <div class="d-md-none type-micro-cap text-muted mt-1">
                  <span class="exp-flag">{{ exp.flag }}</span> {{ exp.location }}
                </div>
                <div class="exp-body type-body-md text-muted mt-3">
                  <ContentRenderer :value="exp" />
                </div>
                <div class="d-flex flex-wrap ga-1 mt-3">
                  <v-chip v-for="tag in exp.tags" :key="tag" size="x-small">
                    {{ tag }}
                  </v-chip>
                </div>
              </v-col>
              <v-col md="2" class="d-none d-md-flex exp-location type-micro-cap text-muted">
                <span class="exp-flag">{{ exp.flag }}</span>
                <span class="mt-1">{{ exp.location }}</span>
              </v-col>
            </v-row>
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
  border-top: 1px solid rgb(var(--v-theme-border));
}
.exp-row {
  padding: 1.25rem 0;
  align-items: baseline;
}
// Role dims to muted when the row is not hovered — the system's only
// available emphasis device without a hue.
.exp-role {
  color: rgb(var(--v-theme-muted));
  transition: color 0.3s;
  .exp-item:hover & {
    color: rgb(var(--v-theme-on-background));
  }
}
.exp-body :deep(p) {
  margin: 0;
}
.exp-location {
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.exp-flag {
  font-size: 1.2rem;
}
.exp-skeleton {
  border-top: 1px solid rgb(var(--v-theme-border));
  padding: 1rem 0;
}
</style>
