---
slug: "fleetops"
order: 1
title: "FleetOps — Gestion de flotte automobile"
featured: true
context: "Projet client — transport & services"
hook: "Piloter tout un parc de véhicules depuis un seul écran, et ne plus laisser passer une échéance."

# Faits affichés sous le titre. Toute valeur commençant par TODO est
# ignorée au rendu : à remplacer, mais rien de faux ne sera publié entre-temps.
role: "Conception & développement full-stack"
period: "TODO — ex. 2024 · 6 mois"
team: "TODO — ex. Solo / 3 développeurs"
status: "TODO — ex. En production / Livré / Prototype"

intro: "Une application de gestion de flotte pensée pour remplacer un suivi éclaté — tableurs, e-mails, rappels manuels — par une gestion opérationnelle centralisée, où chaque échéance est détectée automatiquement."
objectives:
  - "Centraliser véhicules, conducteurs, documents et entretiens dans un seul outil"
  - "Détecter automatiquement les échéances de maintenance et de conformité"
  - "Donner aux gestionnaires une visibilité sur l’état et les coûts du parc"
challenge: "Kilométrage, entretiens, assurances et documents réglementaires vivent d’ordinaire dans des fichiers séparés. Aucune vue d’ensemble, aucune anticipation : une échéance oubliée, et c’est une non-conformité, parfois un véhicule immobilisé."
solution: "Une plateforme qui rassemble toutes les données du parc et surveille trois sources d’échéances : permis des conducteurs, documents (assurance, contrôle réglementaire) et entretiens — déclenchés par date ou par kilométrage. Chaque échéance proche devient une alerte hiérarchisée (avertissement ou critique) qu’un gestionnaire peut acquitter puis résoudre."

# Cadre le plan technique sans le répéter : la liste des technologies vit
# dans `stack`, ce paragraphe explique la forme du système.
architecture: "Une application web en trois couches — interface Vue 3, API FastAPI versionnée, base PostgreSQL — dont toute la logique métier et toutes les autorisations vivent côté serveur. Le cœur du système n’est pas le CRUD mais le moteur d’alertes : il surveille trois sources d’échéances et deux déclencheurs, par date comme par kilométrage. Sa manière de calculer est le choix structurant du projet."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · Vite · Pinia"
  - layer: "API"
    detail: "FastAPI (Python 3.12) · API versionnée sous /api/v1 · JWT en cookie httpOnly · hachage Argon2 · RBAC admin / gestionnaire vérifié côté serveur"
  - layer: "Données"
    detail: "PostgreSQL · SQLAlchemy 2.0 · migrations Alembic · table d’alertes matérialisée"
  - layer: "Livraison"
    detail: "Docker Compose (lancement en une commande) · CI GitLab : lint, tests, e2e, audit de dépendances · sondes liveness / readiness et garde-fous de démarrage en production"

decisions:
  - problem: "Les échéances dépendent de trois sources (permis, documents, entretiens) et de deux déclencheurs (date, kilométrage). Les recalculer à chaque affichage rendait les listes lentes et impossibles à filtrer, trier ou paginer côté base."
    choice: "Matérialiser les alertes dans une table dédiée, reconstruite par un recalcul explicite plutôt que dérivée à la lecture."
    consequence: "Les listes restent rapides, filtrables et paginables — mais l’état n’est plus calculé en temps réel : le recalcul doit être déclenché pour que les alertes restent justes."

highlights:
  - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
  - "Sévérité avertissement / critique, avec acquittement puis résolution par le gestionnaire"
  - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
deliverables:
  - "Application web complète (API FastAPI + interface Vue 3/Vuetify)"
  - "Modèle de données versionné (migrations Alembic) et jeu de données de démonstration"
  - "Moteur d’alertes multi-sources avec recalcul et cycle de vie"
  - "Déploiement Docker Compose et pipeline CI (lint, tests, e2e, audit de dépendances)"
impact:
  - "Suivi du parc unifié : véhicules, conducteurs, documents et entretiens au même endroit"
  - "Échéances détectées automatiquement sur trois sources, par date comme par kilométrage"
  - "Qualité outillée : tests backend (pytest et couverture), unitaires et e2e côté front, contrôle des migrations — le tout en CI"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
