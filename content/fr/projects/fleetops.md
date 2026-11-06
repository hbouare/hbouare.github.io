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
story:
  problem:
    title: "Un suivi éclaté, des échéances qui passent"
    text: "Une application de gestion de flotte qui remplace un suivi éclaté — tableurs, e-mails, rappels manuels — par un poste unique."
  constraints:
    title: "Trois sources d’échéances, deux rôles"
    text: "Elle surveille trois sources d’échéances (permis, documents réglementaires, entretiens), par date ou par kilométrage."
    points:
      - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
      - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  approach:
    title: "Sous le capot"
    points:
      - "Sévérité avertissement / critique, avec acquittement puis résolution par le gestionnaire"
      - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
  result:
    title: "Chaque échéance devient une alerte traitée"
    text: "Chaque échéance proche est transformée en alerte hiérarchisée qu’un gestionnaire acquitte puis résout."
    points:
      - "79 routes d’API sur 14 ressources : véhicules, conducteurs, affectations, documents, entretiens, carburant, incidents, dépenses, alertes…"
      - "Recalcul des alertes idempotent : relancé, il ne crée aucun doublon (vérifié par un test)"
      - "8 migrations de schéma versionnées"
      - "51 tests automatisés : 43 côté API, 8 tests unitaires front"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]

cover:
  src: "/projects/fleetops/hero.webp"
  alt: "Tableau de bord FleetOps — vue d’ensemble opérationnelle du parc"

gallery:
  - src: "/projects/fleetops/vehicles.webp"
    caption: "Le parc : recherche, filtres et statut de chaque véhicule"
    section: approach
    span: 6
  - src: "/projects/fleetops/form.webp"
    caption: "Fiche véhicule : identification et données d’exploitation"
    section: approach
    span: 3
  - src: "/projects/fleetops/analytics.webp"
    caption: "Répartition du parc et coûts du mois en un coup d’œil"
    section: result
    span: 3
  - src: "/projects/fleetops/costs.webp"
    caption: "Suivi des coûts par véhicule, catégorie et fournisseur"
    section: result
    span: 4
  - src: "/projects/fleetops/mobile.webp"
    caption: "Interface responsive, pensée pour le terrain"
    device: phone
    section: result
    span: 2
---
