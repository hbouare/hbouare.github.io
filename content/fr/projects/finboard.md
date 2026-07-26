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
---
