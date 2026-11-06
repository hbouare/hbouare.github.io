---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe sécurisé"
featured: false
context: "Projet personnel / R&D sécurité"
hook: "Un coffre à mots de passe où même une fuite de base ne révèle rien."

status: "Fonctionnel"
frontend: "Consulter, saisir et rechercher ses identifiants — sans jamais détenir les clés."
backend: "Une frontière de chiffrement : rien n’atteint la base en clair."
database: "Ne conserve que des données chiffrées, inexploitables en cas de fuite."

intro: "Un coffre à mots de passe centralisé où la confidentialité ne se négocie jamais : chaque secret est chiffré en AES-256-GCM avant stockage, si bien qu’une fuite de base ne révèle rien. L’accès est verrouillé par mot de passe fort (Argon2id) et 2FA TOTP, avec générateur avancé, tableau de bord de sécurité et audit des actions sensibles."

highlights:
  - "Chiffrement enveloppe AES-256-GCM, clé maître versionnée, jamais exposée au client"
  - "Authentification forte : Argon2id + 2FA TOTP, sessions et appareils révocables"
  - "Générateur avancé, recherche instantanée et tableau de bord de sécurité"
  - "Rate-limiting, anti-brute-force et audit des actions sensibles"
# Chiffres relevés dans le dépôt (2026-11-06) : 69 tests pytest + 12
# Vitest + 7 Playwright, couverture CI ≥ 80 %, connexion limitée à 5/min,
# verrouillage 15 min après 5 échecs, rotation des jetons + détection de rejeu.
story:
  problem:
    title: "Des mots de passe partout, protégés nulle part"
  constraints:
    title: "Supposer que la base fuitera"
    text: "Un coffre à mots de passe est une cible. Il faut partir du principe que la base fuitera un jour, que des robots essaieront des milliers de mots de passe, et qu’un jeton volé sera rejoué."
  approach:
    title: "Chiffrer avant de stocker, verrouiller l’accès"
  result:
    title: "Des garanties vérifiées, pas promises"
    text: "Chaque garantie de sécurité est fixée par un test automatisé ou par une règle de configuration."
    points:
      - "Les secrets restent illisibles sans la clé maître : un test vérifie que le texte chiffré ne contient jamais le texte en clair"
      - "Connexion limitée à 5 tentatives par minute ; compte verrouillé 15 minutes après 5 échecs"
      - "Jetons renouvelés à chaque rafraîchissement, réutilisation détectée ; jeton altéré rejeté"
      - "88 tests automatisés (69 côté API, 12 unitaires front, 7 parcours de bout en bout), couverture minimale de 80 % imposée en CI"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM"]

cover:
  src: "/projects/securevault/hero.webp"
  alt: "Tableau de bord SecureVault — santé de sécurité et alertes du coffre"

gallery:
  - src: "/projects/securevault/vault.webp"
    caption: "Le coffre : entrées chiffrées, recherche, favoris et catégories"
    span: 6
  - src: "/projects/securevault/entry.webp"
    caption: "Édition d’une entrée — génération intégrée, valeurs jamais exposées"
    span: 3
  - src: "/projects/securevault/generator.webp"
    caption: "Générateur : entropie mesurée, longueur et jeux de caractères"
    span: 3
  - src: "/projects/securevault/login.webp"
    caption: "Chiffrement de bout en bout — AES-256-GCM, Argon2id, 2FA"
    span: 4
  - src: "/projects/securevault/mobile.webp"
    caption: "Coffre responsive, accessible partout"
    device: phone
    span: 2
---
