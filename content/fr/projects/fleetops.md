---
slug: "fleetops"
order: 1
title: "Gestion de flotte automobile"
featured: true
context: "Projet personnel — transport & services"
hook: "Piloter tout un parc de véhicules depuis un seul écran, et ne plus laisser passer une échéance."

status: "Fonctionnel · données de démo"
cover: "/projects/fleetops/architecture.svg"

intro: "Une application de gestion de flotte qui remplace un suivi éclaté — tableurs, e-mails, rappels manuels — par un poste unique. Elle surveille trois sources d’échéances (permis, documents réglementaires, entretiens), par date ou par kilométrage, et transforme chaque échéance proche en alerte hiérarchisée qu’un gestionnaire acquitte puis résout."
architecture: "Une application web en trois couches — interface Vue 3, API FastAPI versionnée, base PostgreSQL — dont toute la logique métier et toutes les autorisations vivent côté serveur. Le cœur du système n’est pas le CRUD mais le moteur d’alertes : il surveille trois sources d’échéances et deux déclencheurs, par date comme par kilométrage. Sa manière de calculer est le choix structurant du projet."

highlights:
  - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
  - "Sévérité avertissement / critique, avec acquittement puis résolution par le gestionnaire"
  - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
