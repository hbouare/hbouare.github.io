---
slug: "finboard"
order: 2
title: "Pilotis — socle d’un SaaS de suivi financier"
featured: false
context: "Projet personnel — PME, secteur financier"
hook: "Les fondations d’un SaaS de suivi financier pour PME : une base technique carrée, posée avant les fonctionnalités."

# Faits affichés sous le titre. `period` est volontairement absent : l’historique
# du dépôt est un instantané, il ne reflète pas la durée réelle de développement.
role: "Conception & développement full-stack"
team: "Solo"
status: "En cours — socle livré"

intro: "Un SaaS de suivi financier destiné aux PME, dont ce premier incrément pose les fondations : l’architecture, le shell du tableau de bord et une chaîne qualité complète, avant l’ajout des domaines métier."
objectives:
  - "Poser une base technique extensible pour un SaaS financier multi-domaines"
  - "Consolider, à terme, des flux financiers éclatés en un tableau de bord unique"
  - "Garantir dès le socle une chaîne qualité stricte et bloquante"
challenge: "La cible, pour une PME, c’est un rapprochement et une catégorisation faits à la main sur des transactions éclatées entre sources — chronophage, répétitif, sans vision consolidée. Mais avant de traiter ce problème métier, un SaaS multi-domaines a besoin de fondations qui ne seront plus rejouées : sécurité, modèle de données, conventions."
solution: "Un monolithe modulaire organisé par domaines, où chaque nouveau domaine (finance, catégories, factures, imports, rapports, alertes…) s’ajoute sans toucher aux fondations. Ce premier incrément livre les fondations, le shell du tableau de bord et une chaîne qualité complète — le reste s’y branche progressivement."

architecture: "Un monolithe modulaire FastAPI organisé par domaines : les routes délèguent aux services métier, qui orchestrent des repositories SQLAlchemy sur PostgreSQL. Le frontend Vue 3 sépare pages, composants, stores, appels API et plugins. API REST versionnée sous /api/v1, identifiants UUID et horodatages UTC communs, migrations pensées pour rester cohérentes et réversibles. Les domaines suivants s’ajoutent sur ces fondations sans les modifier."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · shell du tableau de bord, séparation pages / composants / stores / API"
  - layer: "API"
    detail: "FastAPI · monolithe modulaire par domaines · API REST /api/v1 · identifiants UUID et horodatages UTC"
  - layer: "Données"
    detail: "PostgreSQL · SQLAlchemy · migrations cohérentes et réversibles"
  - layer: "Livraison"
    detail: "Docker Compose · GitLab CI (bloquante) · pre-commit · Ruff / Black / MyPy strict / pytest côté back ; ESLint / Prettier / TS strict / Stylelint / Vitest / Playwright côté front"

decisions:
  - problem: "Un SaaS financier multi-domaines peut démarrer en microservices — isolement fort, mais complexité d’infrastructure immédiate — ou en monolithe rigide, plus simple mais coûteux à faire évoluer par la suite."
    choice: "Un monolithe modulaire organisé par domaines, en couches (routes → services → repositories), pensé pour que chaque domaine s’ajoute sans rejouer les fondations."
    consequence: "L’évolution reste simple et le déploiement unique — au prix d’une discipline de découpage à tenir, et sans l’isolement de déploiement qu’offriraient de vrais services séparés."

highlights:
  - "Monolithe modulaire par domaines, extensible sans toucher aux fondations"
  - "Shell de tableau de bord et API REST versionnée (/api/v1)"
  - "Modèle de données commun : identifiants UUID, horodatages UTC, migrations réversibles"
  - "Chaîne qualité complète et bloquante (lint, typage strict, tests) en CI"
deliverables:
  - "Fondations techniques d’un SaaS financier (backend FastAPI + frontend Vue 3)"
  - "Shell du tableau de bord et API REST versionnée"
  - "Chaîne qualité complète (Ruff, Black, MyPy, pytest ; ESLint, Prettier, Vitest, Playwright) en CI"
  - "Orchestration Docker Compose, lancement en une commande"
impact:
  - "Une base technique typée, testée et outillée, prête à recevoir les domaines métier"
  - "Chaîne qualité stricte posée dès le socle plutôt qu’ajoutée après coup"
  - "Architecture modulaire qui absorbe les futurs domaines sans réécriture des fondations"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
