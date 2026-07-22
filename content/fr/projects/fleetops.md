---
slug: "fleetops"
order: 1
title: "FleetOps — Gestion de flotte automobile"
featured: true
context: "Projet client — transport & services"
role: "Conception & développement full-stack"
hook: "Piloter tout un parc de véhicules depuis un seul écran, et ne plus laisser passer une échéance."
intro: "Une application de gestion de flotte pensée pour remplacer un suivi éclaté — tableurs, e-mails, rappels manuels — par une gestion opérationnelle centralisée, où chaque échéance est détectée automatiquement."
objectives:
  - "Centraliser véhicules, conducteurs, documents et entretiens dans un seul outil"
  - "Détecter automatiquement les échéances de maintenance et de conformité"
  - "Donner aux gestionnaires une visibilité sur l’état et les coûts du parc"
challenge: "Kilométrage, entretiens, assurances et documents réglementaires vivent d’ordinaire dans des fichiers séparés. Aucune vue d’ensemble, aucune anticipation : une échéance oubliée, et c’est une non-conformité, parfois un véhicule immobilisé."
solution: "Une plateforme qui rassemble toutes les données du parc et surveille trois sources d’échéances : permis des conducteurs, documents (assurance, contrôle réglementaire) et entretiens — déclenchés par date ou par kilométrage. Chaque échéance proche devient une alerte hiérarchisée (avertissement ou critique) qu’un gestionnaire peut acquitter puis résoudre."
architecture: "Backend FastAPI (Python 3.12) avec SQLAlchemy 2.0 sur PostgreSQL et migrations Alembic, API versionnée sous /api/v1. Frontend Vue 3 + Vuetify en TypeScript (Vite, Pinia). Sécurité : JWT en cookie httpOnly, hachage Argon2, et autorisations RBAC (admin / gestionnaire) toujours vérifiées côté serveur. Choix structurant : plutôt que de recalculer les échéances à chaque affichage, les alertes sont matérialisées dans une table dédiée et reconstruites par un recalcul explicite — les listes restent ainsi rapides, filtrables et paginables, au prix d’un recalcul à déclencher pour rester à jour. Sondes liveness/readiness, garde-fous de démarrage en production, lancement en une commande via Docker Compose, sous CI GitLab."
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
access: "public"
github: "https://github.com/hamedbouare9/gestion-de-flottes"
---
