---
slug: "finboard"
order: 2
title: "Socle d’un SaaS de suivi financier"
featured: false
context: "Projet personnel — PME, secteur financier"
hook: "Les fondations d’un SaaS de suivi financier pour PME : une base technique carrée, posée avant les fonctionnalités."

status: "En cours · socle livré"
frontend: "Le tableau de bord, pensé pour accueillir de nouveaux domaines métier."
backend: "Une organisation par domaines : chacun s’ajoute sans toucher aux fondations."
database: "Un modèle de données commun, cohérent d’un domaine à l’autre."

intro: "Le socle d’un SaaS de suivi financier pour PME : un monolithe modulaire par domaines où chaque nouveau domaine (catégories, factures, imports, rapports…) s’ajoute sans toucher aux fondations. Ce premier incrément livre l’architecture, le shell du tableau de bord et une chaîne qualité complète et bloquante — avant les domaines métier."

highlights:
  - "Monolithe modulaire par domaines, extensible sans toucher aux fondations"
  - "Shell de tableau de bord et API REST versionnée (/api/v1)"
  - "Modèle de données commun : identifiants UUID, horodatages UTC, migrations réversibles"
  - "Chaîne qualité complète et bloquante (lint, typage strict, tests) en CI"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]

cover:
  src: "/projects/finboard/hero.webp"
  alt: "Pilotis — tableau de bord : chiffre d’affaires, dépenses, bénéfice et trésorerie"

gallery:
  - src: "/projects/finboard/transactions.webp"
    caption: "Toutes les opérations : recherche, filtres, catégories et montants signés"
    span: 4
  - src: "/projects/finboard/mobile.webp"
    caption: "Pilotage financier accessible depuis mobile"
    device: phone
    span: 2
  - src: "/projects/finboard/imports.webp"
    caption: "Import de relevés CSV/XLSX : analyse, contrôle ligne à ligne, puis confirmation"
    span: 3
  - src: "/projects/finboard/login.webp"
    caption: "Un espace fiable pour centraliser les flux financiers"
    span: 3
---
