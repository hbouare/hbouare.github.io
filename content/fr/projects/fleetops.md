---
slug: "fleetops"
order: 1
title: "Gestion de flotte automobile"
featured: true
context: "Projet personnel — transport & services"
hook: "Piloter tout un parc de véhicules depuis un seul écran, et ne plus laisser passer une échéance."

status: "Fonctionnel · données de démo"
frontend: "Un poste unique pour suivre véhicules, conducteurs, documents et entretiens."
backend: "Le cœur du système : un moteur qui détecte et hiérarchise chaque échéance."
database: "Toutes les données du parc, centralisées et historisées."

intro: "Une application de gestion de flotte qui remplace un suivi éclaté — tableurs, e-mails, rappels manuels — par un poste unique. Elle surveille trois sources d’échéances (permis, documents réglementaires, entretiens), par date ou par kilométrage, et transforme chaque échéance proche en alerte hiérarchisée qu’un gestionnaire acquitte puis résout."

highlights:
  - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
  - "Sévérité avertissement / critique, avec acquittement puis résolution par le gestionnaire"
  - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]
---
