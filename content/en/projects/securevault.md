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
---
