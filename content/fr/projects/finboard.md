---
slug: "finboard"
order: 2
title: "Application de suivi financier pour PME"
featured: false
context: "Projet personnel — PME, secteur financier"
hook: "Réunir transactions, factures, imports et rapports dans une application organisée par domaines métier."

status: "En cours · socle livré"
frontend: "Un tableau de bord pour consulter les données financières et accéder aux différents domaines."
backend: "Un monolithe modulaire qui sépare les routes, les services et l’accès aux données de chaque domaine."
database: "Un modèle de données commun, cohérent d’un domaine à l’autre."

intro: "Ce projet de SaaS pour PME regroupe le suivi financier, les imports de relevés, les factures, les alertes et les rapports. Son développement a commencé par un socle commun : architecture modulaire, structure du tableau de bord et contrôles automatisés. Les domaines métier ont ensuite été ajoutés progressivement."

highlights:
  - "Monolithe modulaire organisé par domaines métier"
  - "Shell de tableau de bord et API REST versionnée (/api/v1)"
  - "Modèle de données commun : identifiants UUID, horodatages UTC, migrations réversibles"
  - "Contrôles obligatoires en intégration continue : lint, typage strict et tests"
# Chiffres relevés dans le dépôt (2026-11-06) : 42 routes d'API, 5
# migrations Alembic (chacune avec un downgrade), 56 tests pytest + 24 Vitest
# + 7 Playwright, seuils de couverture CI : API 90 %, front 80 % (branches 70 %).
story:
  problem:
    title: "Construire une application financière évolutive"
  constraints:
    title: "Ajouter des fonctionnalités sur une base commune"
    text: "Les domaines finance, imports, factures, alertes et rapports doivent partager les mêmes conventions de données. L’architecture doit permettre leur développement progressif, avec des contrôles de qualité à chaque livraison."
  approach:
    title: "Séparer les domaines et automatiser les contrôles"
  result:
    title: "Sept domaines intégrés à l’application"
    text: "Le projet reste en cours. Le socle et les domaines décrits ci-dessous sont implémentés, chacun avec ses routes, son service et son accès aux données."
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
    caption: "Écran de connexion à l’espace de suivi financier"
    span: 3
---
