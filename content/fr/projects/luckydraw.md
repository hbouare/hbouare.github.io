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

highlights:
  - "Tirage provably-fair (commit-reveal) rejouable et vérifiable par le joueur"
  - "Campagnes configurables (règles, calendrier, gains)"
  - "Achat de tickets et historique de participation"
  - "Back-office : résultats, transactions, statistiques, exports"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
