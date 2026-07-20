---
slug: "fleetops"
order: 1
title: "Gestion de flotte de véhicules"
featured: true
context: "Projet client — transport & services"
role: "Conception & développement full-stack"
hook: "Un parc de véhicules piloté d’un seul écran — fini les tableurs éparpillés."
intro: "Destiné aux entreprises de transport et de services, l’outil devait remplacer un suivi de flotte éclaté par une gestion opérationnelle réellement centralisée."
objectives:
  - "Centraliser la gestion opérationnelle du parc en un seul outil"
  - "Anticiper les échéances de maintenance et de conformité"
  - "Donner aux gestionnaires une visibilité sur les coûts d’exploitation"
challenge: "Kilométrage, entretiens, assurances et documents réglementaires vivaient dans des fichiers séparés : aucune vue d’ensemble, aucune anticipation des échéances, et un risque de non-conformité à chaque oubli."
solution: "Une plateforme centralisant toutes les données véhicules et conducteurs, adossée à un module de planification qui déclenche automatiquement des alertes à l’approche des révisions, renouvellements d’assurance et contrôles réglementaires."
architecture: "Une API Python expose les données de flotte à un frontend Vue.js dédié à la consultation et à la saisie. La persistance repose sur PostgreSQL (véhicules, conducteurs, échéances, coûts) et le calcul des alertes s’effectue côté serveur. L’ensemble est conteneurisé avec Docker et livré via une pipeline d’intégration continue GitLab."
highlights:
  - "Alertes de maintenance et de conformité automatiques"
  - "Suivi du kilométrage, des entretiens et de la consommation"
  - "Tableau de bord des coûts et de l’état du parc"
deliverables:
  - "Application web complète (frontend et backend)"
  - "Gestion du parc, des conducteurs et des documents"
  - "Module de planification et d’alertes d’échéances"
  - "Déploiement conteneurisé et pipeline CI/CD"
impact:
  - "Parc auparavant suivi sur tableurs dispersés, désormais centralisé"
  - "Échéances (révisions, assurances, contrôles) suivies automatiquement plutôt qu’à la main"
  - "Visibilité sur les coûts d’exploitation du parc"
tags: ["Python","Vue.js","PostgreSQL","Docker","GitLab CI"]
access: "private"
---

