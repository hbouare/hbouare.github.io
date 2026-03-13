---
slug: nuxt-content-v3
title: "Nuxt Content v3 : construire un blog technique from scratch"
date: "2025-03-13"
readTime: 10
tags: ["Nuxt", "Nuxt Content", "Vue.js", "Blog", "MDC"]
excerpt: "REX complet sur la mise en place de Nuxt Content v3 pour un blog de dev — MDC, queryCollection, coloration syntaxique, table des matières automatique, dark mode. Ce que la documentation officielle ne dit pas clairement."
---

# Nuxt Content v3 : construire un blog technique from scratch

La documentation officielle de Nuxt Content v3 est correcte mais elliptique. Elle montre les APIs, pas les décisions d'architecture ni les pièges concrets. Cet article est un REX de la mise en place de ce blog — de la configuration initiale aux détails qui font la différence sur un blog technique.

## Installation et configuration de base

```bash
npx nuxi module add @nuxt/content
```

La configuration dans `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  modules: ["@nuxt/content"],
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-light",
            dark: "github-dark",
          },
          langs: [
            "python",
            "typescript",
            "bash",
            "yaml",
            "dockerfile",
            "sql",
            "json",
          ],
        },
      },
    },
  },
})
```

Les langages dans `langs` doivent être listés explicitement — Shiki (le moteur de coloration) ne charge que ceux déclarés. Oublier `dockerfile` ou `yaml` sur un blog technique, c'est des blocs de code non colorés.

## Structure des fichiers de contenu

```
content/
├── blog/
│   ├── mon-article.md
│   └── autre-article.md
└── _schemas/
    └── blog.ts
```

Le schéma est optionnel mais vivement recommandé — il valide le frontmatter à la compilation :

```typescript
// content/_schemas/blog.ts
import { defineCollection, z } from "@nuxt/content"

export const collections = {
  blog: defineCollection({
    type: "page",
    source: "blog/**/*.md",
    schema: z.object({
      slug: z.string(),
      title: z.string(),
      date: z.string(),
      readTime: z.number(),
      tags: z.array(z.string()),
      excerpt: z.string(),
    }),
  }),
}
```

Un article avec un `readTime` manquant ou un `tags` mal formaté lèvera une erreur au build plutôt qu'un bug silencieux en production.

## Lister les articles avec queryCollection

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

`.select()` est important sur un blog avec beaucoup d'articles : il évite de charger le contenu complet de chaque article pour la page de liste — seul le frontmatter est récupéré.

## Afficher un article avec la table des matières

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
  throw createError({ statusCode: 404, message: 'Article introuvable' })
}

// Table des matières générée automatiquement depuis les headings
const toc = computed(() => article.value?.body?.toc?.links ?? [])
</script>

<template>
  <article>
    <header>
      <h1>{{ article.title }}</h1>
      <div class="meta">
        <time>{{ formatDate(article.date) }}</time>
        <span>{{ article.readTime }} min de lecture</span>
      </div>
      <div class="tags">
        <span v-for="tag in article.tags" :key="tag">{{ tag }}</span>
      </div>
    </header>

    <!-- Table des matières -->
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

    <!-- Contenu MDC -->
    <ContentRenderer :value="article" />
  </article>
</template>
```

La table des matières est générée automatiquement par Nuxt Content à partir des headings Markdown (`##`, `###`). Pas de plugin externe nécessaire.

## Composants MDC personnalisés

Le MDC (Markdown Components) permet d'insérer des composants Vue directement dans le Markdown :

```markdown
<!-- Dans un article .md -->

::callout{type="warning"}
Cette approche ne fonctionne pas en environnement multi-pods sans Redis.
::
```

Le composant correspondant :

```vue
<!-- components/content/Callout.vue -->
<script setup lang="ts">
const props = defineProps<{
  type: "info" | "warning" | "danger"
}>()

const icons = {
  info: "💡",
  warning: "⚠️",
  danger: "🚫",
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

Les composants placés dans `components/content/` sont automatiquement disponibles dans le MDC — sans import.

## Dark mode avec Nuxt Color Mode

```bash
npx nuxi module add @nuxtjs/color-mode
```

Configuration :

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxt/content", "@nuxtjs/color-mode"],
  colorMode: {
    classSuffix: "", // Classe CSS : 'dark' plutôt que 'dark-mode'
    preference: "system", // Respecte les préférences système par défaut
    fallback: "light",
  },
  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-light",
            dark: "github-dark", // Shiki switche automatiquement avec la classe CSS
          },
        },
      },
    },
  },
})
```

Le toggle dans le layout :

```vue
<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === "dark")

const toggle = () => {
  colorMode.preference = isDark.value ? "light" : "dark"
}
</script>

<template>
  <button
    @click="toggle"
    :aria-label="isDark ? 'Passer en mode clair' : 'Passer en mode sombre'"
  >
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>
```

Shiki gère automatiquement la coloration syntaxique selon la classe `dark` sur `<html>` — pas besoin de surcharger les styles des blocs de code.

## Déploiement sur GitHub Pages

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: "github-pages",
  },
  // Si le repo n'est pas à la racine du domaine
  app: {
    baseURL: "/mon-repo/",
  },
})
```

Le workflow GitHub Actions :

```yaml
# .github/workflows/deploy.yml
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
          node-version: "20"
      - run: npm ci
      - run: npm run generate
      - uses: actions/deploy-pages@v4
        with:
          artifact_name: github-pages
          path: .output/public
```

## Ce que la doc ne dit pas clairement

Quelques points qui m'ont coûté du temps :

**Le schéma doit être déclaré avant le premier `npm run dev`** — Nuxt Content génère les types TypeScript au démarrage. Si le schéma change, relancer le serveur de dev.

**`queryCollection` n'est disponible que côté serveur** — dans `useAsyncData` ou `useFetch`, pas directement dans `onMounted`. En SSR, c'est le comportement attendu ; en SSG, toutes les requêtes sont exécutées au build.

**La table des matières est dans `article.body.toc`**, pas dans `article.toc` directement. Cette structure est documentée mais facilement ratée dans la doc officielle.

**Les composants MDC doivent être dans `components/content/`**, pas dans `components/` — la résolution automatique est spécifique à ce répertoire.

Nuxt Content v3 est l'outil le plus propre disponible pour un blog technique Vue.js aujourd'hui. La courbe d'apprentissage est courte, et une fois les quelques pièges ci-dessus contournés, l'expérience de rédaction en Markdown avec des composants Vue est réellement agréable.
