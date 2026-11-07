---
slug: "securevault"
order: 4
title: "Gestionnaire de mots de passe"
featured: false
context: "Projet personnel / R&D sécurité"
hook: "Centraliser ses identifiants avec un chiffrement des secrets avant stockage et un accès à double facteur."

status: "Fonctionnel"
frontend: "Consulter, saisir et rechercher ses identifiants, sans exposer la clé maître au navigateur."
backend: "Chiffrer les secrets côté serveur avant leur stockage et contrôler les accès."
database: "Conserver les secrets sous forme chiffrée."

intro: "SecureVault centralise les identifiants et chiffre les secrets côté serveur en AES-256-GCM avant stockage. L’authentification associe un mot de passe haché avec Argon2id et un second facteur TOTP. L’application comprend un générateur de mots de passe, un tableau de bord de sécurité et un journal des actions sensibles."

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
    title: "Centraliser les identifiants et contrôler leur accès"
  constraints:
    title: "Prévoir les principaux scénarios de compromission"
    text: "Le projet prend en compte la fuite de la base de données, les tentatives de connexion répétées et la réutilisation de jetons. La protection des secrets stockés dépend aussi de celle de la clé maître, gérée côté serveur."
  approach:
    title: "Chiffrer les secrets et encadrer les accès"
  result:
    title: "Des contrôles de sécurité testés"
    text: "Les tests et la configuration couvrent le stockage chiffré, les limites de connexion et la gestion des jetons. Ils vérifient ces mécanismes sans constituer une garantie générale contre toute compromission."
    points:
      - "Un test vérifie que la valeur stockée après chiffrement ne contient pas le secret en clair"
      - "Connexion limitée à 5 tentatives par minute ; compte verrouillé 15 minutes après 5 échecs"
      - "Jetons renouvelés à chaque rafraîchissement, réutilisation détectée ; jeton altéré rejeté"
      - "88 tests automatisés (69 côté API, 12 unitaires front, 7 parcours de bout en bout), couverture minimale de 80 % imposée en CI"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM"]

cover:
  src: "/projects/securevault/hero.webp"
  alt: "Tableau de bord SecureVault — indicateurs de sécurité et alertes du coffre"

gallery:
  - src: "/projects/securevault/vault.webp"
    caption: "Le coffre : entrées chiffrées, recherche, favoris et catégories"
    span: 6
  - src: "/projects/securevault/entry.webp"
    caption: "Édition d’un identifiant avec générateur de mot de passe intégré"
    span: 3
  - src: "/projects/securevault/generator.webp"
    caption: "Générateur : entropie mesurée, longueur et jeux de caractères"
    span: 3
  - src: "/projects/securevault/login.webp"
    caption: "Écran de connexion — mot de passe et authentification à double facteur"
    span: 4
  - src: "/projects/securevault/mobile.webp"
    caption: "Coffre responsive, accessible partout"
    device: phone
    span: 2
---
