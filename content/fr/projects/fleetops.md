---
slug: "fleetops"
order: 1
title: "FleetOps — Gestion de flotte automobile"
featured: true
context: "Projet personnel — transport & services"
hook: "Piloter tout un parc de véhicules depuis un seul écran, et ne plus laisser passer une échéance."

status: "Fonctionnel · données de démo"

intro: "Une application de gestion de flotte qui remplace un suivi éclaté — tableurs, e-mails, rappels manuels — par un poste unique. Elle surveille trois sources d’échéances (permis, documents réglementaires, entretiens), par date ou par kilométrage, et transforme chaque échéance proche en alerte hiérarchisée qu’un gestionnaire acquitte puis résout."
architecture: "Une application web en trois couches — interface Vue 3, API FastAPI versionnée, base PostgreSQL — dont toute la logique métier et toutes les autorisations vivent côté serveur. Le cœur du système n’est pas le CRUD mais le moteur d’alertes : il surveille trois sources d’échéances et deux déclencheurs, par date comme par kilométrage. Sa manière de calculer est le choix structurant du projet."

decisions:
  - problem: "Les échéances dépendent de trois sources (permis, documents, entretiens) et de deux déclencheurs (date, kilométrage). Les recalculer à chaque affichage rendait les listes lentes et impossibles à filtrer, trier ou paginer côté base."
    choice: "Matérialiser les alertes dans une table dédiée, reconstruite par un recalcul explicite plutôt que dérivée à la lecture."
    consequence: "Les listes restent rapides, filtrables et paginables — mais l’état n’est plus calculé en temps réel : le recalcul doit être déclenché pour que les alertes restent justes."

highlights:
  - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
  - "Sévérité avertissement / critique, avec acquittement puis résolution par le gestionnaire"
  - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
