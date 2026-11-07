<!-- app/pages/projects/index.vue -->
<!--
  Project index: one full-width row per project, the whole row is the link to
  its case study. Only the featured project carries its cover image.
-->
<template>
  <div>
    <UiPageIntro :eyebrow="$t('projects.section')" :intro="$t('projects.privacy_note')">
      <template #title>{{ $t("projects.title") }}</template>
    </UiPageIntro>

    <section v-reveal.stagger class="projects gutter" :aria-label="$t('nav.projects')">
      <NuxtLink
        v-for="(p, i) in projects"
        :key="p.slug"
        :to="localePath(`/projects/${p.slug}`)"
        class="rule-row is-interactive proj-card"
      >
        <div class="proj-key">
          <span class="proj-num">{{ String(i + 1).padStart(3, "0") }}</span>
          <span v-if="p.featured" class="tag tag--accent proj-featured">
            {{ $t("projects.featured") }}
          </span>
        </div>

        <div class="proj-body">
          <img
            v-if="p.featured && p.cover"
            :src="p.cover.src"
            :alt="p.cover.alt ?? ''"
            class="proj-img"
            width="1600"
            height="900"
            loading="lazy"
            decoding="async"
          >
          <div v-if="p.context" class="proj-ctx">{{ p.context }}</div>
          <h2 class="proj-title">{{ p.title }}</h2>
          <p v-if="p.hook" class="proj-hook">{{ p.hook }}</p>
          <div class="proj-foot">
            <ul class="proj-tags" role="list">
              <li v-for="tag in p.tags" :key="tag" class="tag">{{ tag }}</li>
            </ul>
            <span class="link-text proj-cta">{{ $t("projects.view_case") }} →</span>
          </div>
        </div>
      </NuxtLink>
    </section>

    <UiCtaBand
      :title="$t('home.cta_title')"
      :text="$t('home.cta_text')"
      :button="$t('home.cta_button')"
      :to="localePath('/contact')"
    />
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t("nav.projects"),
  description: t("projects.meta_desc"),
  ogTitle: () => `${t("nav.projects")} - Hamed Bouare`,
  ogDescription: t("projects.meta_desc"),
})

// Only the fields the rows render. Without select(), Nuxt Content serialises
// every full case study into this page's _payload.json. `order` is selected
// because select() narrows the row type before order() sees it.
const { data } = await useAsyncData(`projects-all-${locale.value}`, () =>
  queryCollection(`${locale.value}_projects`)
    .select("slug", "title", "context", "hook", "tags", "featured", "cover", "order")
    .order("order", "ASC")
    .all(),
)
const projects = computed(() => data.value ?? [])
</script>

<style scoped>
.projects {
  display: flex;
  flex-direction: column;
  padding-bottom: var(--section-y);
}

.proj-card {
  display: flex;
  flex-wrap: wrap;
  gap: 24px 48px;
  padding-block: clamp(28px, 3.4vw, 52px);
}

.proj-key {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.proj-num {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--accent);
}
.proj-featured {
  align-self: flex-start;
}

.proj-body {
  flex: 999 1 560px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.proj-img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: top;
  border: 1px solid var(--rule);
  border-radius: var(--radius-img);
  background: var(--surface);
  margin-bottom: 8px;
}
.proj-ctx {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
.proj-title {
  margin: 0;
  font-family: var(--f-display);
  font-weight: 300;
  font-size: clamp(32px, 3.8vw, 54px);
  line-height: 1.04;
  letter-spacing: -0.025em;
}
.proj-hook {
  margin: 0;
  max-width: 680px;
  font-family: var(--f-display);
  font-size: clamp(18px, 1.5vw, 21px);
  line-height: 1.5;
}
.proj-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  align-items: center;
}
.proj-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.proj-cta {
  padding: 2px 0;
}
</style>
