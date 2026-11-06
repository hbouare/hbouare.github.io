<!-- app/pages/blog/index.vue -->
<!--
  Post index: topic chips, then one hairline row per post. Filtering is
  client-side over the prerendered list, so every post link is in the HTML
  and Nitro's crawler still reaches each article.
-->
<template>
  <div>
    <ClientOnly>
      <LazyUiPlumField />
    </ClientOnly>

    <UiPageIntro :eyebrow="$t('blog.section')" class="blog-intro">
      <template #title>
        <i18n-t scope="global" keypath="blog.title" tag="span">
          <template #em>
            <em>{{ $t("blog.title_em") }}</em>
          </template>
        </i18n-t>
      </template>
      <div role="group" :aria-label="$t('blog.filter_label')" class="blog-chips">
        <button
          v-for="c in chips"
          :key="c.value"
          type="button"
          class="chip"
          :aria-pressed="filter === c.value ? 'true' : 'false'"
          @click="filter = c.value"
        >
          {{ c.label }}
        </button>
      </div>
    </UiPageIntro>

    <section v-reveal.stagger class="posts gutter" :aria-label="$t('nav.blog')">
      <NuxtLink
        v-for="post in visible"
        :key="post.slug"
        :to="localePath(`/blog/${post.slug}`)"
        class="rule-row is-interactive blog-card"
      >
        <div class="post-meta">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ post.readTime }} {{ $t("blog.min_read") }}</span>
        </div>
        <div class="post-main">
          <h2 class="t-list post-title">{{ post.title }}</h2>
          <ul class="post-tags" role="list">
            <li v-for="tag in post.tags" :key="tag">#{{ tag }}</li>
          </ul>
        </div>
      </NuxtLink>
      <p v-if="!visible.length" class="t-intro muted posts-empty">{{ $t("blog.no_posts") }}</p>
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
const { formatDate } = useFormatDate()

useSeoMeta({
  title: "Blog",
  description: t("blog.meta_desc"),
  ogTitle: "Blog - Hamed Bouare",
  ogDescription: t("blog.meta_desc"),
})

// Only the fields the rows render: without select(), every full article
// would ship in this page's _payload.json. `date` is selected because
// select() narrows the row type before order() sees it.
const { data } = await useAsyncData(`blog-all-${locale.value}`, () =>
  queryCollection(`${locale.value}_blog`)
    .select("slug", "title", "date", "readTime", "tags")
    .order("date", "DESC")
    .all(),
)
const posts = computed(() => data.value ?? [])

const TOPICS = ["FastAPI", "Python", "Vue.js", "Architecture", "Frontend", "TypeScript"]
const ALL = ""
const chips = computed(() => [
  { value: ALL, label: t("blog.filter_all") },
  ...TOPICS.map((tp) => ({ value: tp, label: tp })),
])

const filter = ref(ALL)
const visible = computed(() =>
  filter.value === ALL ? posts.value : posts.value.filter((p) => p.tags.includes(filter.value)),
)
</script>

<style scoped>
.blog-intro {
  padding-bottom: clamp(32px, 4vw, 56px);
}
.blog-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.posts {
  display: flex;
  flex-direction: column;
  padding-bottom: var(--section-y);
}
.blog-card {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 48px;
  align-items: baseline;
  padding-block: clamp(22px, 2.4vw, 32px);
}
.post-meta {
  flex: 1 1 200px;
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--muted);
}
/* Break between date and reading time, never inside either. */
.post-meta > * {
  white-space: nowrap;
}
.post-main {
  flex: 999 1 620px;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  justify-content: space-between;
  align-items: baseline;
}
.post-title {
  flex: 1 1 420px;
  text-wrap: pretty;
}
.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--f-mono);
  font-size: 11px;
  color: var(--muted);
}
.posts-empty {
  padding-block: var(--sp-12);
}
</style>
