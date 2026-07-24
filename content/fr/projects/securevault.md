---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe sécurisé"
featured: false
context: "Projet personnel / R&D sécurité"
hook: "Un coffre à mots de passe où même une fuite de base ne révèle rien."

# Faits affichés sous le titre. Toute valeur commençant par TODO est
# ignorée au rendu : à remplacer, mais rien de faux ne sera publié entre-temps.
role: "Conception & développement full-stack"
period: "TODO — ex. 2023 · 3 mois"
team: "TODO — ex. Solo"
status: "TODO — ex. R&D / Prototype / Usage personnel"

intro: "Une application pour stocker et organiser ses identifiants dans un espace centralisé, sans jamais transiger sur la confidentialité des données."
objectives:
  - "Protéger les identifiants même en cas de fuite de la base"
  - "Simplifier la gestion quotidienne des mots de passe"
  - "Offrir un stockage organisé et recherchable"
challenge: "Stocker des secrets impose une garantie forte : même si la base de données fuite, les identifiants doivent rester illisibles — le tout sans alourdir l’usage quotidien."
solution: "Un coffre où chaque information est chiffrée avant stockage via un mécanisme fort, organisée par catégories, avec générateur de mots de passe robustes, recherche instantanée et import/export chiffré."

architecture: "Une frontière nette : rien n’atteint la base en clair. Le chiffrement est appliqué côté backend avant persistance, et MongoDB ne voit jamais que des entrées chiffrées — ce qui vaut aussi pour une sauvegarde ou une copie volée. Le frontend n’a donc pas à être un maillon de confiance : il consulte et saisit, il ne protège pas."
stack:
  - layer: "Interface"
    detail: "Vue.js · TypeScript · consultation, saisie, recherche instantanée, générateur de mots de passe"
  - layer: "Traitement"
    detail: "Python · chiffrement des données avant persistance · import / export chiffré · historique des modifications"
  - layer: "Données"
    detail: "MongoDB · entrées chiffrées uniquement, jamais de clair"
  - layer: "Livraison"
    detail: "Conteneurisation Docker · déploiement continu via GitLab CI"

# TODO — Ajouter ici l’arbitrage technique réel du projet (le problème posé,
# le choix fait, ce qu’il coûte). La section disparaît tant que ce champ est
# absent. Piste la plus forte : chiffrement côté serveur plutôt que
# zero-knowledge côté client — ce que cela simplifie (recherche, récupération)
# et ce que cela élargit (surface de confiance).

highlights:
  - "Chiffrement des données avant stockage"
  - "Générateur de mots de passe robustes"
  - "Organisation par catégories & recherche instantanée"
  - "Import / export chiffré et historique des modifications"
deliverables:
  - "Application de coffre-fort chiffré"
  - "Générateur de mots de passe et recherche instantanée"
  - "Import / export chiffré et historique des modifications"
  - "Déploiement conteneurisé et pipeline CI/CD"
impact:
  - "Identifiants chiffrés avant stockage — protégés même en cas de fuite de base"
  - "Générateur de mots de passe robustes et recherche instantanée"
  - "Import / export chiffré et historique des modifications"
tags: ["Python","Vue.js","TypeScript","MongoDB","Docker","GitLab CI"]
---
