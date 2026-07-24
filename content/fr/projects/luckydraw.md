---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet personnel — plateforme grand public"
hook: "Des tirages au sort en ligne dont l’équité se prouve, au lieu de se promettre."

status: "Fonctionnel · 6 phases livrées"

intro: "Une plateforme grand public de tirages au sort où la confiance repose sur la preuve, pas la promesse. Les joueurs créent un compte, achètent des tickets et suivent leur historique ; chaque tirage s’appuie sur un moteur vérifiable (provably-fair commit-reveal), piloté depuis un back-office complet : campagnes, résultats, statistiques."
architecture: "Une seule API Node.js sert deux publics aux exigences opposées : l’espace joueur, où l’intégrité du tirage doit être hors d’atteinte, et le back-office, où l’organisateur configure règles, calendrier et gains. Le tirage vit uniquement côté serveur, adossé à MongoDB pour les campagnes, tickets et participations, et à Redis pour le cache et un rate-limiting compatible multi-instances. Les entrées passent une double barrière de validation — Zod à la frontière HTTP, Mongoose à la persistance — et les montants sont stockés en centimes entiers."

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
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
