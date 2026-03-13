---
slug: nuxt-content-v3-technical-blog-en
title: "Nuxt Content v3: Building a Technical Blog From Scratch"
date: "2025-03-13"
readTime: 10
tags: ["Nuxt", "Nuxt Content", "Vue.js", "Blog", "MDC"]
excerpt: "A complete field report on setting up Nuxt Content v3 for a developer blog — MDC, queryCollection, syntax highlighting, automatic table of contents, dark mode. What the official documentation does not make sufficiently clear."
---

# Nuxt Content v3: Building a Technical Blog From Scratch

The official Nuxt Content v3 documentation is accurate but terse. It covers the APIs without addressing the architectural decisions or the concrete pitfalls encountered along the way. This article is a field report from setting up this blog — from initial configuration to the details that meaningfully distinguish a polished technical blog from a bare-bones one.

## Installation and Base Configuration

```bash
npx nuxi module add @nuxt/content
```

Configuration in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: ['python', 'typescript', 'bash', 'yaml', 'dockerfile', 'sql', 'json']
        }
      }
    }
  }
})
```

The languages listed under `langs` must be declared explicitly — Shiki, the underlying syntax highlighter, only loads those it is told about. Omitting `dockerfile` or `yaml` on a technical blog means uncoloured code blocks, which is immediately noticeable.

## Content File Structure

```
content/
├── blog/
│   ├── my-article.md
│   └── another-article.md
└── _schemas/
    └── blog.ts
```

The schema is optional but strongly recommended — it validates frontmatter at build time:

```typescript
// content/_schemas/blog.ts
import { defineCollection, z } from '@nuxt/content'

export const collections = {
  blog: defineCollection({
    type: 'page',
    source: 'blog/**/*.md',
    schema: z.object({
      slug: z.string(),
      title: z.string(),
      date: z.string(),
      readTime: z.number(),
      tags: z.array(z.string()),
      excerpt: z.string(),
    })
  })
}
```

An article with a missing `readTime` or a malformed `tags` field will surface as a build error rather than a silent runtime bug in production.

## Listing Articles with queryCollection

```typescript
// pages/blog/index.vue
<script setup lang="ts">
const { data: articles } = await useAsyncData('blog-list', () =>
  queryCollection('blog')
    .order('date', 'DESC')
    .select('slug', 'title', 'date', 'readTime', 'tags', 'excerpt')
    .all()
)
</script>
```

`.select()` is important on a blog with a large number of articles: it prevents loading the full body content of every article for the listing page — only frontmatter is retrieved.

## Displaying an Article with Table of Contents

```typescript
// pages/blog/[slug].vue
<script setup lang="ts">
const route = useRoute()

const { data: article } = await useAsyncData(
  `blog-${route.params.slug}`,
  () => queryCollection('blog')
    .where('slug', '=', route.params.slug as string)
    .first()
)

if (!article.value) {
  throw createError({ statusCode: 404, message: 'Article not found' })
}

// Table of contents generated automatically from headings
const toc = computed(() => article.value?.body?.toc?.links ?? [])
</script>

<template>
  <article>
    <header>
      <h1>{{ article.title }}</h1>
      <div class="meta">
        <time>{{ formatDate(article.date) }}</time>
        <span>{{ article.readTime }} min read</span>
      </div>
      <div class="tags">
        <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
      </div>
    </header>

    <nav v-if="toc.length" class="toc">
      <ul>
        <li v-for="link in toc" :key="link.id">
          <a :href="`#${link.id}`">{{ link.text }}</a>
          <ul v-if="link.children?.length">
            <li v-for="child in link.children" :key="child.id">
              <a :href="`#${child.id}`">{{ child.text }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <ContentRenderer :value="article" />
  </article>
</template>
```

The table of contents is generated automatically by Nuxt Content from the Markdown headings (`##`, `###`). No external plugin is required.

## Custom MDC Components

MDC (Markdown Components) allows Vue components to be embedded directly in Markdown:

```markdown
<!-- In an article .md file -->
::callout{type="warning"}
This approach does not work in a multi-pod environment without Redis.
::
```

The corresponding component:

```vue
<!-- components/content/Callout.vue -->
<script setup lang="ts">
const props = defineProps<{
  type: 'info' | 'warning' | 'danger'
}>()

const icons = {
  info: '💡',
  warning: '⚠️',
  danger: '🚫'
}
</script>

<template>
  <div :class="`callout callout--${type}`">
    <span class="callout__icon">{{ icons[type] }}</span>
    <div class="callout__content">
      <slot />
    </div>
  </div>
</template>
```

Components placed in `components/content/` are automatically available in MDC — no import required.

## Dark Mode with Nuxt Color Mode

```bash
npx nuxi module add @nuxtjs/color-mode
```

Configuration:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',        // CSS class: 'dark' rather than 'dark-mode'
    preference: 'system',  // Respects system preferences by default
    fallback: 'light'
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'  // Shiki switches automatically with the CSS class
          }
        }
      }
    }
  }
})
```

The toggle in the layout:

```vue
<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const toggle = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button @click="toggle" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>
```

Shiki switches syntax highlighting themes automatically based on the `dark` class on `<html>` — no manual override of code block styles is needed.

## Deployment to GitHub Pages

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'github-pages'
  },
  app: {
    baseURL: '/my-repo/'  // If the repository is not at the root of the domain
  }
})
```

The GitHub Actions workflow:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run generate
      - uses: actions/deploy-pages@v4
        with:
          artifact_name: github-pages
          path: .output/public
```

## What the Documentation Does Not Say Clearly

Several points that cost time in practice:

**The schema must be declared before the first `npm run dev`** — Nuxt Content generates TypeScript types at startup. If the schema changes, the dev server must be restarted.

**`queryCollection` is only available server-side** — inside `useAsyncData` or `useFetch`, not directly in `onMounted`. In SSR this is the expected behaviour; in SSG, all queries are executed at build time.

**The table of contents lives at `article.body.toc`**, not `article.toc` directly. This structure is documented but easy to miss on a first read.

**MDC components must be placed in `components/content/`**, not `components/` — automatic resolution is specific to that directory.

Nuxt Content v3 is the cleanest tool available today for a Vue.js technical blog. The learning curve is short, and once the handful of pitfalls above are understood, the experience of writing Markdown enriched with Vue components is genuinely pleasant.
