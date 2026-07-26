---
slug: "finboard"
order: 2
title: "Socle d’un SaaS de suivi financier"
featured: false
context: "Projet personnel — PME, secteur financier"
hook: "Les fondations d’un SaaS de suivi financier pour PME : une base technique carrée, posée avant les fonctionnalités."

status: "En cours · socle livré"
cover: "/projects/finboard/architecture.svg"

intro: "Le socle d’un SaaS de suivi financier pour PME : un monolithe modulaire par domaines où chaque nouveau domaine (catégories, factures, imports, rapports…) s’ajoute sans toucher aux fondations. Ce premier incrément livre l’architecture, le shell du tableau de bord et une chaîne qualité complète et bloquante — avant les domaines métier."
architecture: "Un monolithe modulaire FastAPI organisé par domaines : les routes délèguent aux services métier, qui orchestrent des repositories SQLAlchemy sur PostgreSQL. Le frontend Vue 3 sépare pages, composants, stores, appels API et plugins. API REST versionnée sous /api/v1, identifiants UUID et horodatages UTC communs, migrations pensées pour rester cohérentes et réversibles. Les domaines suivants s’ajoutent sur ces fondations sans les modifier."

highlights:
  - "Monolithe modulaire par domaines, extensible sans toucher aux fondations"
  - "Shell de tableau de bord et API REST versionnée (/api/v1)"
  - "Modèle de données commun : identifiants UUID, horodatages UTC, migrations réversibles"
  - "Chaîne qualité complète et bloquante (lint, typage strict, tests) en CI"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
