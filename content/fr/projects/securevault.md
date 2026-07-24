---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe sécurisé"
featured: false
context: "Projet personnel / R&D sécurité"
hook: "Un coffre à mots de passe où même une fuite de base ne révèle rien."

# Faits affichés sous le titre. `period` est volontairement absent : l'historique
# du dépôt est un instantané, il ne reflète pas la durée réelle de développement.
role: "Conception & développement full-stack"
team: "Solo"
status: "Fonctionnel"

intro: "Une application pour stocker et organiser ses identifiants dans un espace centralisé, sans jamais transiger sur la confidentialité des données."
objectives:
  - "Protéger les identifiants même en cas de fuite de la base"
  - "Simplifier la gestion quotidienne des mots de passe"
  - "Offrir un stockage organisé et recherchable"
challenge: "Stocker des secrets impose une garantie forte : même si la base de données fuite, les identifiants doivent rester illisibles — le tout sans alourdir l’usage quotidien."
solution: "Un coffre où chaque secret est chiffré en AES-256-GCM avant stockage, l’accès protégé par mot de passe fort (Argon2id) et 2FA TOTP, avec générateur avancé, tableau de bord de sécurité et audit des actions sensibles."

architecture: "Une frontière nette : rien n’atteint la base en clair. Le chiffrement est appliqué côté backend avant persistance et MongoDB ne voit jamais que des entrées chiffrées — ce qui vaut aussi pour une sauvegarde ou une copie volée. L’API FastAPI suit une Clean Architecture (domaine / application / infrastructure / api), avec JWT access + refresh, révocation et gestion des sessions/appareils, et 2FA TOTP. Le frontend n’a donc pas à être un maillon de confiance : il consulte et saisit, il ne protège pas."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · SPA : consultation, saisie, recherche, générateur, tableau de bord de sécurité"
  - layer: "API"
    detail: "FastAPI · Clean Architecture (domaine / application / infrastructure / api) · JWT access + refresh, révocation et sessions · 2FA TOTP · rate-limiting et anti-brute-force"
  - layer: "Données"
    detail: "MongoDB · entrées chiffrées AES-256-GCM uniquement, jamais de clair"
  - layer: "Livraison"
    detail: "Docker Compose · GitLab CI (lint → typage → tests → build) · pre-commit"

decisions:
  - problem: "Protéger les secrets même en cas de fuite de base impose de tout chiffrer. Mais un modèle zero-knowledge, où seule la machine du client peut déchiffrer, rend impossibles la recherche côté serveur et la récupération de compte — deux fonctions attendues d’un gestionnaire au quotidien."
    choice: "Un chiffrement enveloppe AES-256-GCM appliqué côté serveur, avec une clé maître versionnée (pour la rotation) jamais exposée au client, plutôt qu’un zero-knowledge côté client."
    consequence: "La recherche serveur, la récupération et la rotation de clé restent possibles — au prix d’une surface de confiance élargie : le serveur, contrairement à un modèle zero-knowledge, peut techniquement accéder aux secrets en clair au moment du traitement."

highlights:
  - "Chiffrement enveloppe AES-256-GCM, clé maître versionnée, jamais exposée au client"
  - "Authentification forte : Argon2id + 2FA TOTP, sessions et appareils révocables"
  - "Générateur avancé, recherche instantanée et tableau de bord de sécurité"
  - "Rate-limiting, anti-brute-force et audit des actions sensibles"
deliverables:
  - "Application de coffre-fort chiffré (AES-256-GCM enveloppe)"
  - "Authentification Argon2id + 2FA TOTP avec gestion des sessions/appareils"
  - "Générateur de mots de passe, recherche et tableau de bord de sécurité"
  - "Déploiement conteneurisé et pipeline CI (GitLab)"
impact:
  - "Identifiants chiffrés avant stockage — protégés même en cas de fuite de base"
  - "Accès verrouillé par Argon2id et 2FA TOTP, sessions révocables"
  - "Clé maître versionnée : la rotation reste possible sans re-livraison"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM","Docker","GitLab CI"]
---
