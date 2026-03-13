---
slug: nuxt4-introduction
title: "Nuxt 4: What’s New and What Actually Changes"
date: "2025-03-13"
readTime: 7
tags: ["Nuxt", "Vue.js", "Frontend", "SSR"]
excerpt: "Nuxt 4 is more than a version bump. A restructured project layout, a dedicated app/ directory, and a more mature Nitro runtime — here is what it looks like in practice."
---

# Nuxt 4: What Actually Changes

If you work with Vue.js and have not yet looked at Nuxt 4, now is a good time to do so. The release is not a ground-up rewrite, but its structural changes are substantial enough to warrant a thorough overview before embarking on a new project.

## What Nuxt Is, in Brief

Nuxt is a meta-framework built on top of Vue.js. It handles routing, server-side rendering (SSR), static site generation (SSG), data fetching, and a great deal more — all out of the box. The premise is straightforward: you write Vue components, Nuxt takes care of the infrastructure around them.

Version 3 introduced Vue 3's Composition API, the Nitro server engine, and an architecture centred on automatic imports. Nuxt 4 refines each of these pillars and introduces a handful of structural decisions that have a meaningful impact on how projects are organised and maintained.

## The Central Change: the `app/` Directory

In Nuxt 3, a typical project is laid out as follows:

```
├── components/
├── composables/
├── layouts/
├── middleware/
├── pages/
├── plugins/
├── server/
├── nuxt.config.ts
```

In Nuxt 4, all application code is consolidated under a dedicated `app/` directory:

```
├── app/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   ├── plugins/
│   └── app.vue
├── server/
├── public/
└── nuxt.config.ts
```

This is not a cosmetic change. The explicit separation between application code (`app/`) and server-side logic (`server/`) enforces a cleaner boundary between concerns — one that becomes increasingly valuable as a codebase scales or as more contributors join a project.

> This behaviour was already available in Nuxt 3.x via the `future.compatibilityVersion: 4` flag in `nuxt.config.ts`. In Nuxt 4, it is the default.

## Data Fetching: `useAsyncData` and `useFetch`

The data-fetching primitives themselves remain familiar, but Nuxt 4 tightens their behaviour around reactivity and cache key management.

In Nuxt 3, `useAsyncData` would occasionally fail to re-trigger when a reactive dependency changed — a subtle source of stale data that was difficult to diagnose. In Nuxt 4, internal `watch` handling is more consistent and predictable:

```ts
// Automatically reactive to changes in `route.params.id`
const { data } = await useAsyncData(`product-${route.params.id}`, () =>
  $fetch(`/api/products/${route.params.id}`),
)
```

The governing principle is straightforward: cache keys must be unique and must reflect every dynamic parameter they depend on. A static key paired with dynamic data will produce cache collisions — this was equally true in Nuxt 3, but Nuxt 4 surfaces the problem more clearly, which encourages better habits from the outset.

## Nitro and Server Routes

Nuxt 4 continues to ship Nitro as its server runtime. API routes are defined declaratively in `server/api/`, with file naming encoding both the path and the HTTP method:

```ts
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const product = await db.products.findById(id)
  if (!product) throw createError({ statusCode: 404 })
  return product
})
```

Nitro compiles these handlers into a self-contained, portable bundle that can be deployed across a range of targets: Node.js, edge runtimes such as Cloudflare Workers or Vercel Edge Functions, or as a fully static build. In Nuxt 4, Nitro's increased maturity is tangible — type inference is sharper, and utility helpers such as `getRouterParam`, `readBody`, and `getCookie` behave more reliably across deployment targets.

## Auto-Imported Composables

Any composable placed in `app/composables/` is automatically available throughout the application without an explicit import statement:

```ts
// app/composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  return $fetch.create({ baseURL: config.public.apiBase })
}

// Available directly in any component or page:
const api = useApi()
const data = await api("/products")
```

This is a genuine productivity gain, though it comes with a caveat: on larger projects, liberal use of auto-imports can obscure where functionality originates, making code harder to navigate for developers unfamiliar with the codebase. A practical convention — one composable per file, named with precision — goes a long way toward mitigating this.

## Nuxt Content v3

For projects that use Nuxt as a content platform — blogs, documentation sites, knowledge bases — Nuxt Content v3 is fully compatible with Nuxt 4 and represents a significant step forward. MDC parsing (Markdown enriched with inline Vue components) is noticeably faster, and the content query API is now fully typed:

```ts
const { data } = await useAsyncData("articles", () =>
  queryCollection("blog")
    .where("published", "=", true)
    .order("date", "DESC")
    .all(),
)
```

Configuration is handled in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ["@nuxt/content"],
  content: {
    build: {
      markdown: {
        highlight: { theme: "github-dark" },
      },
    },
  },
})
```

## Key Takeaways

Nuxt 4 is best understood as a consolidation release: it sharpens what Nuxt 3 introduced rather than replacing it. The `app/` directory enforces better project organisation, reactivity in data fetching is more dependable, and Nitro has matured into a genuinely robust server runtime. For any new Vue.js project requiring SSR, it is the most defensible starting point available today.

Migration from Nuxt 3 is designed to be incremental. The `compatibilityVersion: 4` flag allows teams to adopt new behaviours selectively, without a disruptive big-bang migration. In practice — on my own portfolio project — the transition amounted to an afternoon of work, the bulk of which involved reorganising files into the `app/` directory and updating a handful of imports.
