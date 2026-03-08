<!-- app/pages/blog/[slug].vue -->
<template>
  <v-container class="px-6 px-md-10" fluid style="max-width: 800px">
    <div class="section-v-pad">
      <UiRevealBlock>
        <v-btn
          :to="localePath('/blog')"
          variant="text"
          color="muted"
          class="font-mono text-caption pa-0 mb-8"
          rounded="0"
          prepend-icon="mdi-arrow-left"
        >
          {{ $t("blog.view_all") }}
        </v-btn>

        <!-- Skeleton while loading -->
        <div v-if="!post && !postError" class="py-8">
          <v-skeleton-loader type="heading" color="surface" rounded="0" class="mb-6" />
          <v-skeleton-loader type="paragraph" color="surface" rounded="0" class="mb-4" />
          <v-skeleton-loader type="paragraph" color="surface" rounded="0" class="mb-4" />
          <v-skeleton-loader type="paragraph" color="surface" rounded="0" />
        </div>

        <div v-if="post">
          <div class="d-flex align-center ga-3 mb-6 flex-wrap">
            <span class="font-mono text-muted blog-meta">{{
              formatDate(post.date)
            }}</span>
            <span class="font-mono text-muted">·</span>
            <span class="font-mono text-muted blog-meta"
              >{{ post.readTime }} {{ $t("blog.min_read") }}</span
            >
          </div>

          <h1 class="post-title font-playfair">{{ post.title }}</h1>

          <div class="d-flex flex-wrap ga-1 mt-5">
            <v-chip
              v-for="tag in post.tags"
              :key="tag"
              variant="outlined"
              color="primary"
              rounded="0"
              size="x-small"
              class="font-mono"
            >{{ tag }}</v-chip>
          </div>

          <v-divider class="my-10" :color="'primary'" opacity="0.15" />

          <div class="post-content font-mono">
            <ContentRenderer :value="post" />
          </div>
        </div>

        <div v-else class="text-center py-20">
          <p class="font-mono text-muted">Article introuvable.</p>
        </div>
      </UiRevealBlock>
    </div>
  </v-container>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const { data: post, error: postError } = await useAsyncData(
  `post-${locale.value}-${route.params.slug}`,
  () =>
    queryCollection(`${locale.value}_blog`)
      .where("slug", "==", route.params.slug)
      .first(),
)

if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.excerpt,
    ogTitle: `${post.value.title} - Hamed Bouare`,
    ogDescription: post.value.excerpt,
  })
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(locale.value === "fr" ? "fr-FR" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
</script>

<style scoped lang="scss">
.blog-meta {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
}
.post-title {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.post-content {
  font-size: 0.82rem;
  line-height: 2;
  color: rgb(var(--v-theme-on-background));
  :deep(h1),
  :deep(h2),
  :deep(h3) {
    font-family: "Playfair Display", serif;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-top: 2em;
    margin-bottom: 0.5em;
    color: rgb(var(--v-theme-on-background));
  }
  :deep(h2) {
    font-size: 1.6rem;
  }
  :deep(h3) {
    font-size: 1.2rem;
  }
  :deep(p) {
    margin-bottom: 1.2em;
    color: rgb(var(--v-theme-muted));
  }
  :deep(pre) {
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgba(var(--v-theme-primary), 0.12);
    padding: 1.25rem;
    margin: 1.5em 0;
    overflow-x: auto;
    font-size: 0.72rem;
  }
  :deep(code) {
    font-family: "DM Mono", monospace;
  }
  :deep(ul),
  :deep(ol) {
    padding-left: 1.5em;
    margin-bottom: 1.2em;
  }
  :deep(li) {
    margin-bottom: 0.4em;
    color: rgb(var(--v-theme-muted));
  }
  :deep(strong) {
    color: rgb(var(--v-theme-primary));
  }
}
</style>