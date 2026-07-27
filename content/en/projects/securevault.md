---
slug: "securevault"
order: 4
title: "Secure Password Manager"
featured: false
context: "Personal / security R&D project"
hook: "A password vault where even a database leak reveals nothing."

status: "Functional"
frontend: "View, enter and search credentials — without ever holding the keys."
backend: "An encryption boundary: nothing reaches the store in clear."
database: "Holds only encrypted data, useless if the database leaks."

intro: "A centralised password vault where confidentiality is never negotiable: every secret is encrypted with AES-256-GCM before storage, so a database leak reveals nothing. Access is locked behind a strong password (Argon2id) and TOTP 2FA, with an advanced generator, a security dashboard and an audit trail of sensitive actions."

highlights:
  - "AES-256-GCM envelope encryption, versioned master key, never exposed to the client"
  - "Strong authentication: Argon2id + TOTP 2FA, revocable sessions and devices"
  - "Advanced generator, instant search and a security dashboard"
  - "Rate-limiting, anti-brute-force and an audit trail of sensitive actions"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM"]

cover:
  src: "/projects/securevault/hero.webp"
  alt: "SecureVault dashboard — security health and vault alerts"

gallery:
  - src: "/projects/securevault/vault.webp"
    caption: "The vault: encrypted entries, search, favourites and categories"
    span: 6
  - src: "/projects/securevault/entry.webp"
    caption: "Editing an entry — inline generation, existing values never exposed"
    span: 3
  - src: "/projects/securevault/generator.webp"
    caption: "Generator: measured entropy, length and character sets"
    span: 3
  - src: "/projects/securevault/login.webp"
    caption: "End-to-end encryption — AES-256-GCM, Argon2id, 2FA"
    span: 4
  - src: "/projects/securevault/mobile.webp"
    caption: "Responsive vault, accessible anywhere"
    device: phone
    span: 2
---
