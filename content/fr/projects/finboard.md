---
slug: "finboard"
order: 2
title: "Tableau de bord de suivi financier"
featured: false
context: "Projet client — PME, secteur financier"
role: "Conception & développement full-stack"
hook: "Toute la finance d’une PME dans un seul tableau de bord, à jour en continu."
intro: "Pensé pour des PME, l’outil devait offrir une visibilité claire et consolidée sur des flux financiers jusque-là éclatés entre plusieurs sources."
objectives:
  - "Consolider des flux financiers éclatés en un tableau de bord unique"
  - "Automatiser la catégorisation et le rapprochement des transactions"
  - "Fiabiliser le reporting et détecter les anomalies au plus tôt"
challenge: "Les équipes rapprochaient et catégorisaient à la main des transactions issues de sources multiples — un travail chronophage, répétitif et sujet aux erreurs, sans vision consolidée des indicateurs."
solution: "Un tableau de bord unique qui importe automatiquement les transactions, suit revenus et dépenses, gère les factures et visualise les indicateurs clés — avec, au cœur, un moteur de catégorisation à règles éditables par le métier plutôt qu’une boîte noire."
architecture: "Un backend Python assure l’import et le traitement des transactions ainsi que le moteur de règles de catégorisation. PostgreSQL stocke les données financières et des agrégats pré-calculés pour des tableaux de bord réactifs, consultés depuis un frontend Vue.js. Conteneurisation Docker et déploiement continu via GitLab CI."
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
access: "private"
---

