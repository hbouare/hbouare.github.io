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
# Chiffres relevés dans le dépôt (2026-11-06) : 42 routes d'API, 5
# migrations Alembic (chacune avec un downgrade), 56 tests pytest + 24 Vitest
# + 7 Playwright, seuils de couverture CI : API 90 %, front 80 % (branches 70 %).
story:
  problem:
    title: "Des fondations avant les fonctionnalités"
  constraints:
    title: "Ajouter des domaines sans toucher au socle"
    text: "Un SaaS financier pour PME s’enrichit domaine après domaine — finance, imports, factures, alertes, rapports. Chaque ajout doit se brancher sur l’existant sans le réécrire, et sans laisser la qualité se dégrader au fil des livraisons."
  approach:
    title: "Un monolithe modulaire, une chaîne qualité bloquante"
  result:
    title: "Les domaines métier, branchés sur le socle"
    text: "Sur ce socle, les domaines métier sont venus s’ajouter un à un, chacun avec ses routes, son service et son repository."
    points:
      - "42 routes d’API réparties en sept domaines métier : authentification, finance, imports CSV/XLSX, factures, alertes, rapports, recherche"
      - "5 migrations de schéma, chacune réversible"
      - "87 tests automatisés : 56 côté API, 24 tests unitaires front, 7 parcours de bout en bout"
      - "Couverture minimale bloquante en CI : 90 % sur l’API, 80 % sur le front"
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
