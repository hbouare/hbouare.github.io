---
slug: "fleetops"
order: 1
title: "Gestion de flotte automobile"
featured: true
context: "Projet personnel — transport & services"
hook: "Centraliser le suivi des véhicules, des conducteurs et des échéances d’entretien."

status: "Fonctionnel · données de démo"
frontend: "Un poste unique pour suivre véhicules, conducteurs, documents et entretiens."
backend: "Un moteur d’alertes fondé sur les dates et le kilométrage."
database: "Toutes les données du parc, centralisées et historisées."

intro: "FleetOps regroupe les véhicules, les conducteurs et les opérations de maintenance dans une application. Les échéances des permis, des documents réglementaires et des entretiens alimentent des alertes que le gestionnaire peut prendre en charge, puis clôturer."

highlights:
  - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
  - "Deux niveaux de sévérité : avertissement et critique ; prise en charge puis résolution par le gestionnaire"
  - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
story:
  problem:
    title: "Regrouper un suivi dispersé"
    text: "Le suivi d’un parc peut être réparti entre tableurs, e-mails et rappels manuels. FleetOps rassemble ces informations pour donner au gestionnaire une vue commune des véhicules et des actions à prévoir."
  constraints:
    title: "Des échéances de nature différente"
    text: "Les permis et les documents réglementaires ont des dates de validité ; les entretiens dépendent aussi du kilométrage. Le système doit suivre ces règles et distinguer les droits des administrateurs de ceux des gestionnaires."
    points:
      - "Alertes sur trois domaines : permis, documents réglementaires et entretiens (par date ou par kilométrage)"
      - "Rôles admin / gestionnaire appliqués côté serveur, JWT en cookie httpOnly et hachage Argon2"
  approach:
    title: "Organiser les alertes et leur traitement"
    points:
      - "Deux niveaux de sévérité : avertissement et critique ; prise en charge puis résolution par le gestionnaire"
      - "Listes paginées et filtrables (recherche, statut, tri) et suivi des coûts"
  result:
    title: "Un suivi des alertes jusqu’à leur résolution"
    text: "L’application fonctionne avec des données de démonstration. Elle classe les échéances proches par niveau de sévérité et permet au gestionnaire de suivre leur prise en charge et leur résolution."
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
