---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet personnel — plateforme grand public"
hook: "Organiser des campagnes de tirage au sort et permettre aux joueurs de vérifier les résultats."

status: "Fonctionnel · 6 phases livrées"
frontend: "Un espace joueur et un back-office d’administration des campagnes."
backend: "Un moteur de tirage qui publie une empreinte avant le tirage, puis révèle la graine utilisée."
database: "Campagnes, tickets, participations et transactions."

intro: "LuckyDraw permet de créer un compte, d’acheter des tickets et de consulter son historique de participation. Les campagnes, les résultats et les statistiques sont gérés depuis une interface d’administration. Le moteur de tirage utilise un mécanisme commit-reveal pour permettre la vérification du résultat."

highlights:
  - "Mécanisme commit-reveal permettant au joueur de recalculer et vérifier le résultat"
  - "Campagnes configurables (règles, calendrier, gains)"
  - "Achat de tickets et historique de participation"
  - "Back-office : résultats, transactions, statistiques, exports"
# Chiffres relevés dans le dépôt (2026-11-06) : 44 routes d'API en 10
# modules, 43 tests unitaires/intégration + 2 Playwright ; tests du moteur
# provably-fair (hash SHA-256, graine falsifiée rejetée, tirage immuable).
story:
  problem:
    title: "Rendre le résultat d’un tirage vérifiable"
  constraints:
    title: "Vérifier les tirages et représenter les montants"
    text: "Le joueur doit pouvoir vérifier le résultat à partir des informations publiées par le moteur. Les montants sont stockés en centimes entiers pour éviter les erreurs liées aux calculs en virgule flottante."
  approach:
    title: "Engager, révéler, vérifier"
  result:
    title: "Des vérifications couvertes par des tests"
    text: "Les tests portent notamment sur la vérification de la graine, le refus d’un second tirage et la représentation des montants."
    points:
      - "Graine engagée par un hash SHA-256 publié avant le tirage, révélée après : un tirage authentique est validé, une graine falsifiée est rejetée"
      - "Tirage immuable : un second tirage sur la même loterie est refusé"
      - "Montants stockés en centimes entiers, sans arithmétique flottante"
      - "45 tests automatisés (43 unitaires et d’intégration, 2 parcours de bout en bout) ; lint, typage, tests et build bloquants en CI"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis"]

cover:
  src: "/projects/luckydraw/hero.webp"
  alt: "Le catalogue des loteries : cagnottes, catégories et statuts en direct"

gallery:
  - src: "/projects/luckydraw/verify.webp"
    caption: "Chaque tirage est cryptographiquement vérifiable (commit-reveal) : hash publié avant, graine révélée, résultat rejouable"
    span: 4
  - src: "/projects/luckydraw/mobile.webp"
    caption: "Parcourir les loteries et jouer, aussi depuis mobile"
    device: phone
    span: 2
  - src: "/projects/luckydraw/detail.webp"
    caption: "Fiche loterie : gain, prix du ticket, tirage daté et règlement"
    span: 3
  - src: "/projects/luckydraw/landing.webp"
    caption: "Page d’accueil de la plateforme de tirages au sort"
    span: 3
---
