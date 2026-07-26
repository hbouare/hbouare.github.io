---
slug: "securevault"
order: 4
title: "Secure Password Manager"
featured: false
context: "Personal / security R&D project"
hook: "A password vault where even a database leak reveals nothing."

status: "Functional"
cover: "/projects/securevault/architecture.svg"

intro: "A centralised password vault where confidentiality is never negotiable: every secret is encrypted with AES-256-GCM before storage, so a database leak reveals nothing. Access is locked behind a strong password (Argon2id) and TOTP 2FA, with an advanced generator, a security dashboard and an audit trail of sensitive actions."
architecture: "One hard boundary: nothing reaches the database in clear text. Encryption is applied in the backend before persistence and MongoDB only ever sees encrypted entries — which holds just as true for a backup or a stolen copy. The FastAPI backend follows Clean Architecture (domain / application / infrastructure / api), with JWT access + refresh, revocation and session/device management, and TOTP 2FA. The frontend therefore never has to be a link in the trust chain: it views and it captures, it does not protect."

highlights:
  - "AES-256-GCM envelope encryption, versioned master key, never exposed to the client"
  - "Strong authentication: Argon2id + TOTP 2FA, revocable sessions and devices"
  - "Advanced generator, instant search and a security dashboard"
  - "Rate-limiting, anti-brute-force and an audit trail of sensitive actions"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM","Docker","GitLab CI"]
---
