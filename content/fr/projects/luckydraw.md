---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet client — plateforme grand public"
hook: "Des tirages au sort en ligne dont l’équité se prouve, au lieu de se promettre."

# Faits affichés sous le titre. Toute valeur commençant par TODO est
# ignorée au rendu : à remplacer, mais rien de faux ne sera publié entre-temps.
role: "Conception & développement full-stack"
period: "TODO — ex. 2022 · 5 mois"
team: "TODO — ex. Solo / 2 développeurs"
status: "TODO — ex. En production / Livré / Prototype"

intro: "Une plateforme grand public pour organiser et jouer des tirages au sort, où la confiance des participants reposait entièrement sur la transparence du processus."
objectives:
  - "Garantir des tirages équitables et vérifiables"
  - "Simplifier l’opération des campagnes côté organisateur"
  - "Suivre la participation et les ventes de tickets"
challenge: "Un tirage en ligne n’a de valeur que si son équité est vérifiable : sans garantie d’intégrité, la confiance s’effondre — tout en devant rester simple à opérer côté organisateur."
solution: "Une plateforme où les utilisateurs créent un compte, achètent des tickets et suivent leur historique, adossée à un moteur de génération aléatoire sécurisé garantissant l’intégrité des tirages, piloté depuis un back-office complet."

architecture: "Une seule API Node.js sert deux publics aux exigences opposées : l’espace joueur, où l’intégrité du tirage doit être hors d’atteinte, et le back-office, où l’organisateur configure règles, calendrier et gains. Le tirage lui-même ne vit que côté serveur, adossé à MongoDB pour les campagnes, tickets et participations."
stack:
  - layer: "Interface"
    detail: "Vue.js · espace joueur (compte, achat de tickets, historique) et back-office"
  - layer: "API"
    detail: "Node.js · TypeScript · logique de jeu et moteur de tirage aléatoire sécurisé, côté serveur uniquement"
  - layer: "Données"
    detail: "MongoDB · campagnes, tirages, tickets et participations"
  - layer: "Livraison"
    detail: "Conteneurisation Docker · intégration continue Travis CI"

# TODO — Ajouter ici l’arbitrage technique réel du projet (le problème posé,
# le choix fait, ce qu’il coûte). Aucun n’est documenté dans le contenu
# existant, et la section disparaît tant que ce champ est absent.
# Pistes : le choix de MongoDB face à un modèle transactionnel pour la
# billetterie ; la source d’aléa retenue et sa vérifiabilité côté joueur.

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
tags: ["Node.js","Vue.js","TypeScript","MongoDB","Docker","Travis CI"]
---
