---
slug: "securevault"
order: 4
title: "Password manager"
featured: false
context: "Personal / security R&D project"
hook: "Keep credentials in one place, with secrets encrypted before storage and two-factor authentication."

status: "Functional"
frontend: "View, enter and search credentials without exposing the master key to the browser."
backend: "Encrypt secrets on the server before storage and control access."
database: "Store secrets in encrypted form."

intro: "SecureVault centralises credentials and encrypts secrets on the server using AES-256-GCM before storage. Authentication combines a password hashed with Argon2id and a TOTP second factor. The application includes a password generator, a security dashboard and an audit trail of sensitive actions."

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
    title: "Centralising credentials and controlling access"
  constraints:
    title: "Accounting for key compromise scenarios"
    text: "The project considers database leaks, repeated login attempts and token reuse. Protecting stored secrets also depends on protecting the master key, which is managed on the server."
  approach:
    title: "Encrypting secrets and controlling access"
  result:
    title: "Tested security controls"
    text: "Tests and configuration cover encrypted storage, login limits and token handling. They check these mechanisms without providing a blanket guarantee against compromise."
    points:
      - "A test checks that the stored encrypted value does not contain the plaintext secret"
      - "Login limited to 5 attempts per minute; account locked for 15 minutes after 5 failures"
      - "Tokens rotated on every refresh, reuse detected; tampered tokens rejected"
      - "88 automated tests (69 on the API, 12 front-end unit tests, 7 end-to-end journeys), 80% minimum coverage enforced in CI"
tags: ["FastAPI","Vue 3","TypeScript","MongoDB","AES-256-GCM"]

cover:
  src: "/projects/securevault/hero.webp"
  alt: "SecureVault dashboard — security indicators and vault alerts"

gallery:
  - src: "/projects/securevault/vault.webp"
    caption: "The vault: encrypted entries, search, favourites and categories"
    span: 6
  - src: "/projects/securevault/entry.webp"
    caption: "Editing a credential with a built-in password generator"
    span: 3
  - src: "/projects/securevault/generator.webp"
    caption: "Generator: measured entropy, length and character sets"
    span: 3
  - src: "/projects/securevault/login.webp"
    caption: "Sign-in screen — password and two-factor authentication"
    span: 4
  - src: "/projects/securevault/mobile.webp"
    caption: "Responsive vault, accessible anywhere"
    device: phone
    span: 2
---
