---
slug: "finboard"
order: 2
title: "Tableau de bord de suivi financier"
featured: false
context: "Projet client — PME, secteur financier"
hook: "Toute la finance d’une PME dans un seul tableau de bord, à jour en continu."

# Faits affichés sous le titre. Toute valeur commençant par TODO est
# ignorée au rendu : à remplacer, mais rien de faux ne sera publié entre-temps.
role: "Conception & développement full-stack"
period: "TODO — ex. 2023 · 4 mois"
team: "TODO — ex. Solo / 2 développeurs"
status: "TODO — ex. En production / Livré / Prototype"

intro: "Pensé pour des PME, l’outil devait offrir une visibilité claire et consolidée sur des flux financiers jusque-là éclatés entre plusieurs sources."
objectives:
  - "Consolider des flux financiers éclatés en un tableau de bord unique"
  - "Automatiser la catégorisation et le rapprochement des transactions"
  - "Fiabiliser le reporting et détecter les anomalies au plus tôt"
challenge: "Les équipes rapprochaient et catégorisaient à la main des transactions issues de sources multiples — un travail chronophage, répétitif et sujet aux erreurs, sans vision consolidée des indicateurs."
solution: "Un tableau de bord unique qui importe automatiquement les transactions, suit revenus et dépenses, gère les factures et visualise les indicateurs clés — avec, au cœur, un moteur de catégorisation à règles éditables par le métier plutôt qu’une boîte noire."

architecture: "Trois blocs, et une règle : le tableau de bord ne calcule rien. Le backend Python ingère les transactions et leur applique le moteur de règles ; PostgreSQL conserve à la fois les données financières et des agrégats pré-calculés ; le frontend Vue.js se contente de lire ces agrégats. C’est ce partage qui rend les tableaux de bord réactifs même quand l’historique grossit."
stack:
  - layer: "Interface"
    detail: "Vue.js · tableaux de bord, visualisation des indicateurs, exports"
  - layer: "Traitement"
    detail: "Python · import automatique des transactions bancaires · moteur de règles de catégorisation · génération de rapports (CSV / PDF)"
  - layer: "Données"
    detail: "PostgreSQL · données financières et agrégats pré-calculés"
  - layer: "Livraison"
    detail: "Conteneurisation Docker · déploiement continu via GitLab CI"

decisions:
  - problem: "La catégorisation automatique pouvait s’appuyer sur un modèle statistique : plus autonome, mais opaque. Une transaction mal classée devient alors inexplicable — et incorrigeable par l’équipe finance elle-même."
    choice: "Un moteur à règles explicites, éditables par le métier, plutôt qu’une boîte noire."
    consequence: "Chaque classement est traçable et corrigeable sans développeur — au prix d’un jeu de règles à maintenir, qui ne s’étend pas tout seul aux cas nouveaux."

highlights:
  - "Moteur de catégorisation à règles configurables"
  - "Import automatique des transactions bancaires"
  - "Rapports mensuels et exports comptables (CSV / PDF)"
  - "Alertes sur impayés et anomalies de flux"
deliverables:
  - "Application web de tableaux de bord financiers"
  - "Moteur de catégorisation à règles configurables"
  - "Génération de rapports et exports (CSV / PDF)"
  - "Déploiement conteneurisé et pipeline CI/CD"
impact:
  - "Rapprochement et catégorisation des transactions automatisés, auparavant manuels"
  - "Reporting mensuel et exports comptables (CSV / PDF) générés à la demande"
  - "Alertes sur impayés et anomalies de flux en temps réel"
tags: ["Python","Vue.js","PostgreSQL","Docker","GitLab CI"]
---
