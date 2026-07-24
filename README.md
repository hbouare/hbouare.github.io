# Portfolio — Hamed Bouare

Portfolio personnel, généré en statique (SSG) et déployé sur GitHub Pages à l'adresse **[hamedbouare.me](https://hamedbouare.me)**.

## Stack

- **Framework** : Nuxt 4 (SSG → GitHub Pages)
- **UI** : Vuetify 4 — design system monochrome, thème sombre/clair
- **Contenu** : Nuxt Content v3 (Markdown, collections découpées par langue)
- **i18n** : @nuxtjs/i18n — Français (par défaut) / English (`/en`)
- **Animation** : GSAP, centralisé via le composable `useMotion`
- **Formulaire** : EmailJS (identifiants injectés au build par les secrets CI)
- **Tests** : Playwright (e2e) + `vue-tsc` (typecheck)
- **Déploiement** : GitHub Pages via GitHub Actions

Le gestionnaire de paquets est **yarn** (1.22.22).

## Commandes

```bash
yarn dev          # serveur de développement
yarn generate     # build statique → .output/public (ce que lance la CI)
yarn preview      # sert le build généré
yarn deploy       # nuxt generate + gh-pages -d .output/public (déploiement manuel)
yarn typecheck    # nuxt typecheck (vue-tsc) — doit rester sans erreur
yarn test:e2e     # Playwright, sur le build statique (desktop + mobile)
```

Après un premier clone, installer le navigateur de test une fois :
`npx playwright install chromium`.

## Structure du projet

```
├── app/
│   ├── app.vue                    # racine — restauration du thème après hydratation
│   ├── assets/styles/main.scss    # SCSS global, tokens (--space-*, --type-*)
│   ├── components/
│   │   ├── navigation/            # TopBar, Footer, ScrollToTop
│   │   ├── sections/              # Hero, Marquee, About, Experience, Contact
│   │   ├── case/                  # blocs des études de cas /projects/[slug]
│   │   └── ui/                    # primitives : Eyebrow, DisplayTitle, SectionHeader, RevealBlock…
│   ├── composables/               # useAppTheme, useMotion, useGsap, useJsonLd…
│   ├── config/                    # motion.ts (timings), publications.ts (données /research)
│   ├── pages/                     # index, contact, research, blog/[slug], projects/[slug]
│   └── plugins/vuetify.ts         # thèmes + defaults du design system
├── content/
│   ├── fr/{experience,projects,blog}/*.md
│   └── en/{experience,projects,blog}/*.md
├── i18n/locales/{fr,en}.json      # chaînes d'interface
├── tests/e2e/                     # Playwright (design-system, motion)
├── .github/workflows/deploy.yml   # build + déploiement automatique
├── CLAUDE.md                      # architecture détaillée & pièges connus
├── DESIGN.md                      # spécification du design system
├── CNAME                          # domaine custom (hamedbouare.me)
└── nuxt.config.ts
```

## Contenu

Toute la donnée éditoriale (expériences, projets, articles) vit en Markdown sous
`content/`, validée par les schémas Zod de [content.config.ts](content.config.ts).
Il y a **six collections**, une par (langue × type). Ajouter un contenu, c'est
créer le fichier sous **`content/fr/…` ET `content/en/…`** avec un frontmatter
qui satisfait le schéma.

### Ajouter une expérience

```markdown
---
id: nouveau-poste
order: 1
role: "Ton titre"
company: "Entreprise"
period: "2025 — Présent"
employment: "Freelance"   # optionnel — à préciser en cas de missions parallèles
location: "Paris, France"
flag: "🇫🇷"
tags: ["Tech1", "Tech2"]
---
Description du poste…
```

### Ajouter un article de blog

La clé est **`slug`** (Nuxt Content réserve `id` en interne) :

```markdown
---
slug: mon-article
title: "Titre de l'article"
date: "2025-03-01"
readTime: 5
tags: ["Tag1", "Tag2"]
excerpt: "Résumé court affiché en aperçu."
---
Contenu en Markdown…
```

> ⚠️ Le frontmatter est **publié** : Nuxt Content sérialise tout le document dans
> le `_payload.json` prérendu, même les champs qu'aucun composant n'affiche.
> Ne jamais y mettre d'information privée (URLs internes, noms de clients,
> identifiants).

## Coordonnées de contact

Modifier le tableau `contactLinks` dans
[app/components/sections/ContactSection.vue](app/components/sections/ContactSection.vue).

## Déploiement

Automatique : un push sur `main` ou `master` déclenche
[.github/workflows/deploy.yml](.github/workflows/deploy.yml), qui lance
`yarn generate` et publie via GitHub Pages. Le site est servi sur le domaine
custom `hamedbouare.me` (fichier `CNAME`) — il n'y a pas de sous-chemin de repo
à configurer.

## Documentation

- [CLAUDE.md](CLAUDE.md) — architecture, thème, i18n, motion et pièges déjà rencontrés.
- [DESIGN.md](DESIGN.md) — spécification du design system (couleurs, typographie, tokens).
