---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe sécurisé"
featured: false
context: "Projet personnel / R&D sécurité"
hook: "Un coffre à mots de passe où même une fuite de base ne révèle rien."

status: "Fonctionnel"

intro: "Un coffre à mots de passe centralisé où la confidentialité ne se négocie jamais : chaque secret est chiffré en AES-256-GCM avant stockage, si bien qu’une fuite de base ne révèle rien. L’accès est verrouillé par mot de passe fort (Argon2id) et 2FA TOTP, avec générateur avancé, tableau de bord de sécurité et audit des actions sensibles."
architecture: "Une frontière nette : rien n’atteint la base en clair. Le chiffrement est appliqué côté backend avant persistance et MongoDB ne voit jamais que des entrées chiffrées — ce qui vaut aussi pour une sauvegarde ou une copie volée. L’API FastAPI suit une Clean Architecture (domaine / application / infrastructure / api), avec JWT access + refresh, révocation et gestion des sessions/appareils, et 2FA TOTP. Le frontend n’a donc pas à être un maillon de confiance : il consulte et saisit, il ne protège pas."

highlights:
  - "Chiffrement enveloppe AES-256-GCM, clé maître versionnée, jamais exposée au client"
  - "Authentification forte : Argon2id + 2FA TOTP, sessions et appareils révocables"
  - "Générateur avancé, recherche instantanée et tableau de bord de sécurité"
  - "Rate-limiting, anti-brute-force et audit des actions sensibles"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM","Docker","GitLab CI"]
---
