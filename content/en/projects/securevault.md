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
# Figures counted in the repository (2026-11-06): 69 pytest + 12 Vitest +
# 7 Playwright tests, CI coverage ≥ 80%, login limited to 5/min, 15-min
# lockout after 5 failures, token rotation + reuse detection.
story:
  problem:
    title: "Passwords everywhere, protected nowhere"
  constraints:
    title: "Assume the database will leak"
    text: "A password vault is a target. The working assumption is that the database will leak one day, that bots will try thousands of passwords, and that a stolen token will be replayed."
  approach:
    title: "Encrypt before storing, lock down access"
  result:
    title: "Guarantees that are tested, not promised"
    text: "Every security guarantee is pinned down by an automated test or a configuration rule."
    points:
      - "Secrets stay unreadable without the master key: a test checks the ciphertext never contains the plaintext"
      - "Login limited to 5 attempts per minute; account locked for 15 minutes after 5 failures"
      - "Tokens rotated on every refresh, reuse detected; tampered tokens rejected"
      - "88 automated tests (69 on the API, 12 front-end unit tests, 7 end-to-end journeys), 80% minimum coverage enforced in CI"
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
