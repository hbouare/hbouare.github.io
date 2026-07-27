---
slug: "luckydraw"
order: 3
title: "Plateforme de loterie en ligne"
featured: false
context: "Projet personnel — plateforme grand public"
hook: "Des tirages au sort en ligne dont l’équité se prouve, au lieu de se promettre."

status: "Fonctionnel · 6 phases livrées"
frontend: "Un espace joueur et un back-office d’administration des campagnes."
backend: "Un moteur de tirage vérifiable : l’équité se prouve, elle ne se promet pas."
database: "Campagnes, tickets, participations et transactions."

intro: "Une plateforme grand public de tirages au sort où la confiance repose sur la preuve, pas la promesse. Les joueurs créent un compte, achètent des tickets et suivent leur historique ; chaque tirage s’appuie sur un moteur vérifiable (provably-fair commit-reveal), piloté depuis un back-office complet : campagnes, résultats, statistiques."

highlights:
  - "Tirage provably-fair (commit-reveal) rejouable et vérifiable par le joueur"
  - "Campagnes configurables (règles, calendrier, gains)"
  - "Achat de tickets et historique de participation"
  - "Back-office : résultats, transactions, statistiques, exports"
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
    caption: "Tentez votre chance, en toute confiance"
    span: 3
---
