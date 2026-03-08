# Portfolio — Hamed

Portfolio personnel développé avec **Nuxt 4**, **Vuetify 3**, **Nuxt Content** et **@nuxtjs/i18n**.

## Stack

- **Framework** : Nuxt 4 (SSG → GitHub Pages)
- **UI** : Vuetify 3 (thème dark/light custom)
- **Contenu** : Nuxt Content v3 (Markdown)
- **i18n** : @nuxtjs/i18n (Français / English)
- **Déploiement** : GitHub Pages via GitHub Actions

## Structure du projet

```
portfolio/
├── app/
│   ├── app.vue                  # Root avec init thème
│   ├── assets/styles/main.scss  # SCSS global
│   ├── composables/
│   │   ├── useAppTheme.ts       # Toggle dark/light + persistence
│   │   └── useScrollReveal.ts   # Animations au scroll
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppNav.vue       # Nav + lang switcher + theme btn
│   │   │   └── AppFooter.vue
│   │   ├── sections/
│   │   │   ├── HeroSection.vue
│   │   │   ├── MarqueeBar.vue
│   │   │   ├── AboutSection.vue
│   │   │   ├── ExperienceSection.vue
│   │   │   ├── ProjectsSection.vue
│   │   │   ├── BlogPreviewSection.vue
│   │   │   └── ContactSection.vue
│   │   └── ui/
│   │       ├── RevealBlock.vue  # Wrapper animation scroll
│   │       └── SectionHeader.vue
│   ├── locales/
│   │   ├── fr.json
│   │   └── en.json
│   ├── pages/
│   │   ├── index.vue            # Home
│   │   ├── blog/
│   │   │   ├── index.vue
│   │   │   └── [slug].vue
│   │   └── projects/
│   │       └── index.vue
│   └── plugins/
│       └── vuetify.ts           # Thèmes dark/light
├── content/
│   ├── fr/
│   │   ├── experience/*.md
│   │   ├── projects/*.md
│   │   └── blog/*.md
│   └── en/
│       ├── experience/*.md
│       ├── projects/*.md
│       └── blog/*.md
├── .github/workflows/deploy.yml
└── nuxt.config.ts
```

## Installation

```bash
npm install
npm run dev       # Développement
npm run generate  # Build statique
```

## Personnalisation

### Changer le nom du repo GitHub Pages

Dans `nuxt.config.ts`, modifie :
```ts
app: { baseURL: '/TON-REPO/' }
```

### Ajouter une expérience

Crée un fichier `content/fr/experience/04-nom.md` :
```markdown
---
id: nouveau-poste
order: 4
role: "Ton titre"
company: "Entreprise"
period: "2025 — Présent"
location: "Paris, France"
flag: "🇫🇷"
tags: ["Tech1", "Tech2"]
---
Description du poste...
```

### Ajouter un article de blog

```markdown
---
id: mon-article
title: "Titre de l'article"
date: "2025-03-01"
readTime: 5
tags: ["Tag1", "Tag2"]
excerpt: "Résumé court affiché en preview."
---
# Titre

Contenu en Markdown...
```

### Mettre à jour les infos de contact

Dans `app/components/sections/ContactSection.vue`, modifie le tableau `contactLinks`.

## Déploiement GitHub Pages

1. Push sur la branche `main`
2. GitHub Actions génère le site et le déploie automatiquement
3. Active GitHub Pages dans les settings du repo → Source : GitHub Actions

> **Important** : remplace `/portfolio/` dans `nuxt.config.ts` par le nom exact de ton repo.
