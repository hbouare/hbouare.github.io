---
slug: nuxt4-introduction
title: "Nuxt 4 : ce que ça change concrètement"
date: "2025-03-13"
readTime: 7
tags: ["Nuxt", "Vue.js", "Frontend", "SSR"]
excerpt: "Nuxt 4 n'est pas juste un bump de version. Nouvelle structure de projet, app/ directory, compatibilité Nitro affinée — voici ce que ça donne sur le terrain."
---

# Nuxt 4 : ce que ça change concrètement

Si tu travailles avec Vue.js et que tu n'as pas encore regardé Nuxt 4, c'est le bon moment. Ce n'est pas une révolution, mais les changements structurels sont suffisamment significatifs pour mériter un tour d'horizon avant de démarrer un nouveau projet.

## C'est quoi Nuxt, rapidement

Nuxt est un meta-framework construit sur Vue.js. Il gère pour toi le routing, le rendu côté serveur (SSR), la génération statique (SSG), le fetching de données, et bien d'autres choses. En gros : tu codes des composants Vue, Nuxt s'occupe du reste.

La version 3 a introduit la Composition API de Vue 3, Nitro comme moteur serveur, et une architecture basée sur les auto-imports. Nuxt 4 affine tout ça — et introduit quelques changements de fond.

## Le changement principal : le répertoire `app/`

En Nuxt 3, la structure d'un projet ressemble à ça :

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

En Nuxt 4, tout le code applicatif est regroupé sous un répertoire `app/` :

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

Ce n'est pas qu'esthétique. La séparation nette entre le code applicatif (`app/`) et le code serveur (`server/`) clarifie les responsabilités, surtout sur des projets qui grossissent ou qui impliquent plusieurs devs.

> Pour activer ce comportement dès Nuxt 3.x, tu pouvais déjà le tester via `future.compatibilityVersion: 4` dans `nuxt.config.ts`. En Nuxt 4, c'est le comportement par défaut.

## Les data fetchers : `useAsyncData` et `useFetch`

Rien de révolutionnaire ici, mais Nuxt 4 renforce les comportements attendus autour de la réactivité et des clés de cache.

En Nuxt 3, il arrivait qu'`useAsyncData` ne se re-déclenche pas correctement quand une dépendance réactive changeait. En Nuxt 4, la gestion des `watch` internes est plus prévisible :

```ts
// Réactif à `route.params.id` sans configuration supplémentaire
const { data } = await useAsyncData(`product-${route.params.id}`, () =>
  $fetch(`/api/products/${route.params.id}`),
)
```

La règle : la clé doit être unique et refléter les paramètres dynamiques. Si la clé est statique alors que les données varient, tu auras des problèmes de cache — c'est valable en Nuxt 3 aussi, mais Nuxt 4 rend ce point plus visible.

## Nitro et les routes serveur

Nuxt embarque Nitro comme runtime serveur. Les routes API se définissent dans `server/api/` :

```ts
// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id")
  const product = await db.products.findById(id)
  if (!product) throw createError({ statusCode: 404 })
  return product
})
```

Nitro compile ça en un bundle portable, déployable sur Node.js, edge workers (Cloudflare, Vercel), ou en statique. En Nuxt 4, la maturité de Nitro se ressent : les erreurs de typage sont mieux résolues et les helpers comme `getRouterParam`, `readBody`, `getCookie` sont plus robustes.

## Les composables auto-importés

Nuxt auto-importe les composables placés dans `app/composables/`. Pas de `import` à écrire, ils sont disponibles partout dans l'app :

```ts
// app/composables/useApi.ts
export const useApi = () => {
  const config = useRuntimeConfig()
  return $fetch.create({ baseURL: config.public.apiBase })
}

// Dans un composant, directement :
const api = useApi()
const data = await api("/products")
```

C'est pratique, mais attention : sur les gros projets, ça peut rendre le code moins lisible si les conventions ne sont pas respectées. Une règle simple : un fichier par composable, nommé explicitement.

## Nuxt Content v3

Si tu utilises Nuxt pour un blog ou de la documentation, Nuxt Content v3 (compatible Nuxt 4) change la donne. Le parsing MDC (Markdown avec composants Vue) est plus rapide, et l'API de requête des contenus est typée :

```ts
const { data } = await useAsyncData("articles", () =>
  queryCollection("blog")
    .where("published", "=", true)
    .order("date", "DESC")
    .all(),
)
```

La configuration se fait dans `nuxt.config.ts` :

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

## Ce qu'il faut retenir

Nuxt 4 consolide ce que Nuxt 3 a introduit. Les changements sont incrémentaux mais cohérents : meilleure séparation app/serveur, réactivité plus fiable, Nitro plus mature. Si tu pars sur un nouveau projet Vue.js avec du SSR, c'est le point de départ raisonnable aujourd'hui.

La migration depuis Nuxt 3 est progressive — le flag `compatibilityVersion: 4` permet de tester les nouveaux comportements sans tout casser d'un coup. Sur mon portfolio personnel (Nuxt 3 → Nuxt 4), la migration a pris une après-midi, principalement pour réorganiser les fichiers dans `app/` et ajuster quelques imports.
