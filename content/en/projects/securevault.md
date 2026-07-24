---
slug: "securevault"
order: 4
title: "Secure Password Manager"
featured: false
context: "Personal / security R&D project"
hook: "A password vault where even a database leak reveals nothing."

# Facts shown under the title. `period` is intentionally omitted: the repo
# history is a snapshot and does not reflect the real development timeline.
role: "Full-stack design & development"
team: "Solo"
status: "Functional"

intro: "An application to store and organise credentials in one place, without ever compromising on data confidentiality."
objectives:
  - "Protect credentials even if the database leaks"
  - "Simplify day-to-day password management"
  - "Provide organised, searchable storage"
challenge: "Storing secrets demands a strong guarantee: even if the database leaks, credentials must stay unreadable — all without weighing down day-to-day use."
solution: "A vault where every secret is encrypted with AES-256-GCM before storage, access protected by a strong password (Argon2id) and TOTP 2FA, with an advanced generator, a security dashboard and an audit trail of sensitive actions."

architecture: "One hard boundary: nothing reaches the database in clear text. Encryption is applied in the backend before persistence and MongoDB only ever sees encrypted entries — which holds just as true for a backup or a stolen copy. The FastAPI backend follows Clean Architecture (domain / application / infrastructure / api), with JWT access + refresh, revocation and session/device management, and TOTP 2FA. The frontend therefore never has to be a link in the trust chain: it views and it captures, it does not protect."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · SPA: viewing, entry, search, generator, security dashboard"
  - layer: "API"
    detail: "FastAPI · Clean Architecture (domain / application / infrastructure / api) · JWT access + refresh, revocation and sessions · TOTP 2FA · rate-limiting and anti-brute-force"
  - layer: "Data"
    detail: "MongoDB · AES-256-GCM encrypted entries only, never clear text"
  - layer: "Delivery"
    detail: "Docker Compose · GitLab CI (lint → typecheck → test → build) · pre-commit"

decisions:
  - problem: "Protecting secrets even if the database leaks means encrypting everything. But a zero-knowledge model, where only the client’s machine can decrypt, makes server-side search and account recovery impossible — two things people expect from a password manager day to day."
    choice: "Server-side AES-256-GCM envelope encryption, with a versioned master key (for rotation) never exposed to the client, rather than client-side zero-knowledge."
    consequence: "Server-side search, recovery and key rotation stay possible — at the cost of a wider trust surface: unlike a zero-knowledge model, the server can technically reach the secrets in clear at processing time."

highlights:
  - "AES-256-GCM envelope encryption, versioned master key, never exposed to the client"
  - "Strong authentication: Argon2id + TOTP 2FA, revocable sessions and devices"
  - "Advanced generator, instant search and a security dashboard"
  - "Rate-limiting, anti-brute-force and an audit trail of sensitive actions"
deliverables:
  - "Encrypted vault application (AES-256-GCM envelope)"
  - "Argon2id + TOTP 2FA authentication with session/device management"
  - "Password generator, search and security dashboard"
  - "Containerised deployment and CI pipeline (GitLab)"
impact:
  - "Credentials encrypted before storage — protected even if the database leaks"
  - "Access locked behind Argon2id and TOTP 2FA, with revocable sessions"
  - "Versioned master key: rotation stays possible without a redeploy"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM","Docker","GitLab CI"]
---
