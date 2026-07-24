---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet personnel — plateforme grand public"
hook: "Des tirages au sort en ligne dont l’équité se prouve, au lieu de se promettre."

# Faits affichés sous le titre. `period` est volontairement absent : l’historique
# du dépôt est un instantané, il ne reflète pas la durée réelle de développement.
role: "Conception & développement full-stack"
team: "Solo"
status: "Fonctionnel — 6 phases livrées"

intro: "Une plateforme grand public pour organiser et jouer des tirages au sort, où la confiance des participants reposait entièrement sur la transparence du processus."
objectives:
  - "Garantir des tirages équitables et vérifiables par les participants eux-mêmes"
  - "Simplifier l’opération des campagnes côté organisateur"
  - "Suivre la participation et les ventes de tickets"
challenge: "Un tirage en ligne n’a de valeur que si son équité est vérifiable : sans garantie d’intégrité, la confiance s’effondre — tout en devant rester simple à opérer côté organisateur."
solution: "Une plateforme où les utilisateurs créent un compte, achètent des tickets et suivent leur historique, adossée à un moteur de tirage vérifiable (schéma provably-fair commit-reveal) et pilotée depuis un back-office complet : campagnes, résultats, transactions et statistiques."

architecture: "Une seule API Node.js sert deux publics aux exigences opposées : l’espace joueur, où l’intégrité du tirage doit être hors d’atteinte, et le back-office, où l’organisateur configure règles, calendrier et gains. Le tirage vit uniquement côté serveur, adossé à MongoDB pour les campagnes, tickets et participations, et à Redis pour le cache et un rate-limiting compatible multi-instances. Les entrées passent une double barrière de validation — Zod à la frontière HTTP, Mongoose à la persistance — et les montants sont stockés en centimes entiers."
stack:
  - layer: "Interface"
    detail: "Vue 3 (script setup) · Vuetify 3 · Pinia · Vue Router · Vue I18n · Axios · TypeScript"
  - layer: "API"
    detail: "Node.js 20 · Express · TypeScript · architecture en couches (contrôleur → service → repository) · JWT access/refresh · Zod · Pino · Swagger"
  - layer: "Données"
    detail: "MongoDB / Mongoose · Redis (cache et rate-limiting distribué)"
  - layer: "Livraison"
    detail: "Docker Compose · Travis CI (lint, typecheck, test, build par package) · Husky / lint-staged · Jest + Vitest + Playwright"

decisions:
  - problem: "Un tirage en ligne doit être à la fois imprévisible avant l’heure et vérifiable après : personne ne doit pouvoir anticiper le résultat, mais chacun doit pouvoir prouver qu’il n’a pas été truqué. Un simple aléatoire côté serveur reste une boîte noire — le joueur doit croire l’organisateur sur parole."
    choice: "Un schéma provably-fair commit-reveal : une graine serveur cryptographique est engagée par son hash publié avant le tirage, la sélection est déterministe (HMAC-SHA256), puis la graine est révélée après coup."
    consequence: "Chaque participant peut rejouer et vérifier le tirage lui-même, sans faire confiance à l’organisateur — au prix d’un protocole strict : la graine doit être engagée avant, archivée, puis révélée sans faille à chaque tirage."
  - problem: "Manipuler des prix de tickets et des cagnottes en nombres à virgule flottante finit toujours par produire des écarts d’arrondi — inacceptables sur de l’argent."
    choice: "Stocker tous les montants en centimes entiers plutôt qu’en flottants."
    consequence: "Les calculs monétaires sont exacts par construction — au prix d’une conversion d’affichage à gérer explicitement à chaque frontière."

highlights:
  - "Tirage provably-fair (commit-reveal) rejouable et vérifiable par le joueur"
  - "Campagnes configurables (règles, calendrier, gains)"
  - "Achat de tickets et historique de participation"
  - "Back-office : résultats, transactions, statistiques, exports"
deliverables:
  - "Espace joueur (compte, achat de tickets, historique)"
  - "Moteur de tirage provably-fair (commit-reveal, HMAC-SHA256)"
  - "Back-office de gestion des campagnes et résultats, avec graphiques et exports"
  - "Déploiement conteneurisé et intégration continue (Travis CI)"
impact:
  - "Équité des tirages non plus promise mais vérifiable par chaque participant"
  - "Campagnes entièrement configurables et pilotées depuis un back-office"
  - "Six phases livrées, du socle au dashboard admin, sous suite de tests (unitaires, intégration, e2e)"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
