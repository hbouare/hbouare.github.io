<template>
  <NuxtLink
    :to="localePath(`/blog/${post.slug}`)"
    class="blog-card text-decoration-none"
  >
    <v-card
      class="blog-card-inner"
      :color="cardColor"
      variant="flat"
      rounded="0"
    >
      <div v-if="accentBar" class="blog-accent-bar" />
      <v-card-text class="pa-7">
        <div class="d-flex align-center justify-space-between mb-4">
          <span class="font-mono text-muted blog-meta">
            {{ formatDate(post.date) }}
          </span>
          <span class="font-mono text-muted blog-meta">
            {{ post.readTime }} {{ $t("blog.min_read") }}
          </span>
        </div>
        <component :is="titleTag" class="blog-title font-playfair">
          {{ post.title }}
        </component>
        <p class="blog-excerpt font-mono text-muted mt-3">
          {{ post.excerpt }}
        </p>
        <div class="d-flex flex-wrap ga-1 mt-4">
          <v-chip
            v-for="tag in post.tags"
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
        <div class="blog-cta font-mono text-primary mt-5">
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
    cardColor?: string
    accentBar?: boolean
    titleTag?: string
  }>(),
  {
    cardColor: "surface",
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
  &:hover .blog-title {
    color: rgb(var(--v-theme-primary));
  }
  &:hover .blog-arrow {
    transform: translateX(6px);
  }
  &:hover .blog-card-inner {
    border-color: rgba(var(--v-theme-primary), 0.3);
    .blog-accent-bar {
      width: 4px;
    }
  }
}
.blog-card-inner {
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  transition: border-color 0.3s;
}
.blog-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 2px;
  height: 100%;
  background: rgb(var(--v-theme-primary));
  transition: width 0.3s ease;
}
.blog-meta {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
}
.blog-title {
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.2;
  color: rgb(var(--v-theme-on-background));
  transition: color 0.3s;
}
.blog-excerpt {
  font-size: 0.72rem;
  line-height: 1.8;
}
.blog-cta {
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}
.blog-arrow {
  transition: transform 0.3s;
}
</style>
