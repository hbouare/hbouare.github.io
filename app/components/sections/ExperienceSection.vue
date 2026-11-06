<!-- app/components/sections/ExperienceSection.vue -->
<!--
  "Where I've built" — proof, not a CV. Each row leads with the sector and
  a 2018→2026 timeline bar, then the organisation, then what was built.
-->
<template>
  <section id="experience" class="exp gutter" aria-labelledby="exp-title">
    <div class="editorial exp-head">
      <div class="editorial__key eyebrow">{{ $t("experience.section") }}</div>
      <h2 id="exp-title" class="editorial__body t-h2">{{ $t("experience.title") }}</h2>
    </div>

    <div>
      <article v-for="job in jobs" :key="job.id" class="rule-row exp-row">
        <div class="exp-key">
          <div class="exp-tags">
            <span v-if="job.sector" class="tag tag--caps">{{ job.sector }}</span>
            <!-- `== null`: Nuxt Content stores an absent optional as null. -->
            <span v-if="job.end == null" class="status exp-current">
              {{ $t("experience.current") }}
            </span>
          </div>
          <div class="exp-dates">{{ job.period }}</div>
          <div class="exp-span" aria-hidden="true">
            <div class="exp-track">
              <span class="exp-bar" :style="bar(job.start, job.end)" />
            </div>
            <div class="exp-axis">
              <span>{{ AXIS_FROM }}</span><span>{{ AXIS_LABEL_TO }}</span>
            </div>
          </div>
        </div>

        <div class="exp-org">
          <h3 class="t-h3">{{ job.company }}</h3>
          <div class="exp-role">
            {{ job.role }} · {{ job.location }}<template v-if="job.employment"> · {{ job.employment }}</template>
          </div>
        </div>

        <div class="exp-desc">
          <ContentRenderer :value="job" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const { locale } = useI18n()

const { data: experiences } = await useAsyncData(`experiences-${locale.value}`, () =>
  queryCollection(`${locale.value}_experience`).order("order", "ASC").all(),
)
const jobs = computed(() => experiences.value ?? [])

// The axis spans nine years from 2018 (as in the design); the bar of an
// ongoing engagement runs to the build date.
const AXIS_FROM = 2018
const AXIS_YEARS = 9
const AXIS_LABEL_TO = 2026
const now = new Date()
const NOW = now.getFullYear() + now.getMonth() / 12

const pct = (v: number) => `${((v / AXIS_YEARS) * 100).toFixed(1)}%`
const bar = (start: number, end?: number | null) => ({
  left: pct(start - AXIS_FROM),
  width: pct(Math.max(0.12, (end ?? NOW) - start)),
})
</script>

<style scoped>
.exp {
  padding-bottom: var(--section-y);
}
.exp-head {
  gap: 16px 48px;
  align-items: baseline;
  padding-bottom: var(--block-gap);
}

.exp-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 48px;
  padding-block: clamp(24px, 2.8vw, 40px);
}

.exp-key {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.exp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.exp-current {
  gap: 6px;
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--accent);
}
.exp-current::before {
  width: 6px;
  height: 6px;
}
.exp-dates {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.exp-span {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 240px;
}
.exp-track {
  position: relative;
  height: 5px;
  border-top: 1px solid var(--rule);
}
.exp-bar {
  position: absolute;
  top: -2px;
  height: 3px;
  background: var(--accent);
}
.exp-axis {
  display: flex;
  justify-content: space-between;
  font-family: var(--f-mono);
  font-size: 10px;
  color: var(--muted);
}

.exp-org {
  flex: 2 1 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.exp-role {
  font-size: 14px;
  line-height: 1.5;
  color: var(--muted);
}

.exp-desc {
  flex: 3 1 380px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 16px;
  line-height: 1.65;
}
.exp-desc :deep(p) {
  margin: 0;
  line-height: inherit;
}
.exp-desc :deep(p + p) {
  margin-top: 14px;
}
</style>
