---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe sécurisé"
featured: false
context: "Projet personnel / R&D sécurité"
role: "Conception & développement full-stack"
hook: "Un coffre à mots de passe où même une fuite de base ne révèle rien."
intro: "Une application pour stocker et organiser ses identifiants dans un espace centralisé, sans jamais transiger sur la confidentialité des données."
objectives:
  - "Protéger les identifiants même en cas de fuite de la base"
  - "Simplifier la gestion quotidienne des mots de passe"
  - "Offrir un stockage organisé et recherchable"
challenge: "Stocker des secrets impose une garantie forte : même si la base de données fuite, les identifiants doivent rester illisibles — le tout sans alourdir l’usage quotidien."
solution: "Un coffre où chaque information est chiffrée avant stockage via un mécanisme fort, organisée par catégories, avec générateur de mots de passe robustes, recherche instantanée et import/export chiffré."
architecture: "Un backend Python réalise le chiffrement des données avant persistance ; les entrées chiffrées sont stockées dans MongoDB, jamais en clair. Le frontend Vue.js en TypeScript assure une expérience fluide de consultation et de saisie. Conteneurisation Docker et déploiement continu via GitLab CI."
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
tags: ["Python","Vue.js","Typescript","MongoDB","Docker","GitLab CI"]
access: "private"
---

