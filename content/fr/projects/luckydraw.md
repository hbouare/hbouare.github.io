---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet client — plateforme grand public"
role: "Conception & développement full-stack"
hook: "Des tirages au sort en ligne dont l’équité se prouve, au lieu de se promettre."
intro: "Une plateforme grand public pour organiser et jouer des tirages au sort, où la confiance des participants reposait entièrement sur la transparence du processus."
objectives:
  - "Garantir des tirages équitables et vérifiables"
  - "Simplifier l’opération des campagnes côté organisateur"
  - "Suivre la participation et les ventes de tickets"
challenge: "Un tirage en ligne n’a de valeur que si son équité est vérifiable : sans garantie d’intégrité, la confiance s’effondre — tout en devant rester simple à opérer côté organisateur."
solution: "Une plateforme où les utilisateurs créent un compte, achètent des tickets et suivent leur historique, adossée à un moteur de génération aléatoire sécurisé garantissant l’intégrité des tirages, piloté depuis un back-office complet."
architecture: "Une API Node.js en TypeScript pilote la logique de jeu, adossée à une base MongoDB pour les tirages, tickets et participations. Le frontend Vue.js sert à la fois l’espace joueur et le back-office. Conteneurisation Docker et intégration continue Travis CI."
highlights:
  - "Moteur de tirage aléatoire sécurisé"
  - "Campagnes configurables (règles, calendrier, gains)"
  - "Achat de tickets et historique de participation"
  - "Back-office : résultats, transactions, statistiques"
deliverables:
  - "Espace joueur (compte, achat de tickets, historique)"
  - "Moteur de tirage aléatoire sécurisé"
  - "Back-office de gestion des campagnes et résultats"
  - "Déploiement conteneurisé et intégration continue"
impact:
  - "Tirages garantis équitables via un moteur de génération aléatoire sécurisé"
  - "Campagnes entièrement configurables et pilotées depuis un back-office"
  - "Suivi de la participation et des ventes de tickets en temps réel"
tags: ["Node.js","Vue.js","Typescript","MongoDB","Docker","Travis CI"]
access: "private"
---

