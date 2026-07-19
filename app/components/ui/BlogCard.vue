<template>
  <NuxtLink
    :to="localePath(`/blog/${post.slug}`)"
    class="blog-card text-decoration-none"
  >
    <v-card class="blog-card-inner hairline-interactive" variant="outlined">
      <div v-if="accentBar" class="blog-accent-bar" />
      <v-card-text class="pa-7">
        <div class="d-flex align-center justify-space-between mb-4">
          <span class="type-micro-cap text-muted">
            {{ formatDate(post.date) }}
          </span>
          <span class="type-micro-cap text-muted">
            {{ post.readTime }} {{ $t("blog.min_read") }}
          </span>
        </div>
        <component :is="titleTag" class="blog-title type-title">
          {{ post.title }}
        </component>
        <p class="blog-excerpt type-body-md text-muted mt-3">
          {{ post.excerpt }}
        </p>
        <div class="d-flex flex-wrap ga-1 mt-4">
          <v-chip v-for="tag in post.tags" :key="tag" size="x-small">
            {{ tag }}
          </v-chip>
        </div>
        <div class="blog-cta type-micro-cap mt-5">
          {{ $t("blog.read_more") }}
          <v-icon size="small" icon="mdi-arrow-right" class="blog-arrow" />
        </div>
      </v-card-text>
    </v-card>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    post: {
      slug: string
      date: string
      readTime: number
      title: string
      excerpt: string
      tags: string[]
    }
    accentBar?: boolean
    titleTag?: string
  }>(),
  {
    accentBar: false,
    titleTag: "h3",
  },
)

const localePath = useLocalePath()
const { formatDate } = useFormatDate()
</script>

<style scoped lang="scss">
.blog-card {
  display: block;
  height: 100%;

  &:hover .blog-arrow {
    transform: translateX(6px);
  }
  &:hover .blog-accent-bar {
    width: 4px;
  }
}

// Hairline + hover come from .hairline-interactive.
.blog-card-inner {
  height: 100%;
  position: relative;
  overflow: hidden;
}

// Monochrome rule, not an accent bar — the system has no accent colour.
.blog-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: rgb(var(--v-theme-on-background));
  transition: width 0.3s ease;
}

.blog-title {
  color: rgb(var(--v-theme-on-background));
}
.blog-arrow {
  transition: transform 0.3s;
}
</style>
