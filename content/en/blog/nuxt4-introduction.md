---
slug: nuxt4-introduction
title: "Nuxt 4: What’s New and What Actually Changes for Developers"
date: "2024-12-10"
readTime: 7
tags: ["Nuxt", "Vue.js", "Frontend", "SSR"]
excerpt: "Nuxt 4 is more than a version bump. A restructured project layout, a dedicated app/ directory, and a more mature Nitro runtime — here is what it looks like in practice."
---

If you work with Vue.js and have not yet looked at Nuxt 4, now is a good time to do so. It is not a revolution, but the structural changes are significant enough to be worth a look before you start a new project.

## What Nuxt Is, in Brief

Nuxt is a meta-framework built on top of Vue.js. It handles routing, server-side rendering (SSR), static site generation (SSG), data fetching, and much more. In short: you write Vue components, Nuxt takes care of the rest.

Version 3 introduced Vue 3's Composition API, the Nitro server engine, and an architecture centred on automatic imports. Nuxt 4 refines all of that, and introduces a few structural changes worth knowing about.

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

This is not a cosmetic change. The clear split between application code (`app/`) and server code (`server/`) clarifies responsibilities, which matters as a project grows or gains contributors.

> This behaviour was already available in Nuxt 3.x via the `future.compatibilityVersion: 4` flag in `nuxt.config.ts`. In Nuxt 4, it is the default.

## Data Fetching: `useAsyncData` and `useFetch`

Nothing revolutionary here, but Nuxt 4 tightens the expected behaviour around reactivity and cache keys.

In Nuxt 3, `useAsyncData` would sometimes fail to re-trigger when a reactive dependency changed. In Nuxt 4, internal `watch` handling is more predictable:

```ts
// Automatically reactive to changes in `route.params.id`
const { data } = await useAsyncData(`product-${route.params.id}`, () =>
  $fetch(`/api/products/${route.params.id}`),
)
```

The rule: a key must be unique and reflect the dynamic parameters it depends on. A static key with varying data gives you cache collisions — equally true in Nuxt 3, but Nuxt 4 makes it more visible.

## Nitro and Server Routes

Nuxt ships Nitro as its server runtime. API routes are defined in `server/api/`:

```ts
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const product = await db.products.findById(id)
  if (!product) throw createError({ statusCode: 404 })
  return product
})
```

Nitro compiles this into a portable bundle you can deploy on Node.js, edge workers (Cloudflare, Vercel), or as a static build. In Nuxt 4, Nitro’s maturity shows: type inference is sharper, and helpers like `getRouterParam`, `readBody` and `getCookie` are more reliable.

## Auto-Imported Composables

Nuxt auto-imports composables placed in `app/composables/`. No import to write — they are available everywhere in the app:

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

Convenient, but worth watching: on large projects it can make code harder to follow if conventions slip. A simple rule: one composable per file, explicitly named.

## Nuxt Content v3

If you use Nuxt for a blog or documentation, Nuxt Content v3 (compatible with Nuxt 4) changes things. MDC parsing (Markdown with inline Vue components) is faster, and the content query API is now typed:

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

Nuxt 4 consolidates what Nuxt 3 introduced. The changes are incremental but coherent: a cleaner app/server split, more reliable reactivity, a more mature Nitro. For a new Vue.js project with SSR, it is the sensible starting point today.

Migration from Nuxt 3 is incremental: the `compatibilityVersion: 4` flag lets you test the new behaviour without breaking everything at once. On my own portfolio (Nuxt 3 → Nuxt 4), it took an afternoon, mostly reorganising files into `app/` and adjusting a few imports.
