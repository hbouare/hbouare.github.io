<!-- app/components/ui/BlogToc.vue -->
<template>
  <nav v-if="headings.length" class="blog-toc" aria-label="Table of contents">
    <p class="toc-title font-mono">{{ $t('blog.toc') }}</p>
    <ul class="toc-list">
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="[
          'toc-item',
          { 'toc-item--active': heading.id === activeId },
          `toc-item--${heading.level}`,
        ]"
      >
        <a
          :href="`#${heading.id}`"
          class="toc-link font-mono"
          @click.prevent="scrollTo(heading.id)"
        >
          {{ heading.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { TocHeading } from '~/composables/useTableOfContents'

defineProps<{
  headings: TocHeading[]
  activeId: string
}>()

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped lang="scss">
.blog-toc {
  position: sticky;
  top: 100px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-left: 1.5rem;
  border-left: 1px solid rgba(var(--v-theme-primary), 0.12);
}

.toc-title {
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 1rem;
  font-weight: 600;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-item {
  position: relative;
  transition: all 0.2s ease;

  &--3 {
    padding-left: 0.75rem;
  }
}

.toc-link {
  display: block;
  padding: 0.3rem 0;
  font-size: 0.62rem;
  line-height: 1.5;
  color: rgb(var(--v-theme-muted));
  text-decoration: none;
  transition: color 0.2s ease;
  letter-spacing: 0.01em;

  &:hover {
    color: rgb(var(--v-theme-on-background));
  }
}

.toc-item--active > .toc-link {
  color: rgb(var(--v-theme-primary));
  font-weight: 600;
}
</style>
