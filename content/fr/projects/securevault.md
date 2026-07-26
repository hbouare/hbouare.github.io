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
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM"]
---
