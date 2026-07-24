---
slug: "securevault"
order: 4
title: "Secure Password Manager"
featured: false
context: "Personal / security R&D project"
hook: "A password vault where even a database leak reveals nothing."

# Facts shown under the title. Any value starting with TODO is dropped at
# render: replace them, but nothing false ships in the meantime.
role: "Full-stack design & development"
period: "TODO — e.g. 2023 · 3 months"
team: "TODO — e.g. Solo"
status: "TODO — e.g. R&D / Prototype / Personal use"

intro: "An application to store and organise credentials in one place, without ever compromising on data confidentiality."
objectives:
  - "Protect credentials even if the database leaks"
  - "Simplify day-to-day password management"
  - "Provide organised, searchable storage"
challenge: "Storing secrets demands a strong guarantee: even if the database leaks, credentials must stay unreadable — all without weighing down day-to-day use."
solution: "A vault where every item is encrypted before storage using a strong scheme, organised into categories, with a robust password generator, instant search and encrypted import/export."

architecture: "One hard boundary: nothing reaches the database in clear text. Encryption is applied in the backend before persistence, and MongoDB only ever sees encrypted entries — which holds just as true for a backup or a stolen copy. The frontend therefore never has to be a link in the trust chain: it views and it captures, it does not protect."
stack:
  - layer: "Interface"
    detail: "Vue.js · TypeScript · viewing, entry, instant search, password generator"
  - layer: "Processing"
    detail: "Python · encryption before persistence · encrypted import / export · change history"
  - layer: "Data"
    detail: "MongoDB · encrypted entries only, never clear text"
  - layer: "Delivery"
    detail: "Docker containerisation · continuous deployment through GitLab CI"

# TODO — Add the project's real engineering trade-off here (the problem, the
# choice, what it costs). The section stays hidden while this field is absent.
# Strongest lead: server-side encryption rather than client-side
# zero-knowledge — what it simplifies (search, recovery) and what it widens
# (the trust surface).

highlights:
  - "Data encrypted before storage"
  - "Robust password generator"
  - "Category organisation & instant search"
  - "Encrypted import / export and change history"
deliverables:
  - "Encrypted vault application"
  - "Password generator and instant search"
  - "Encrypted import / export and change history"
  - "Containerised deployment and CI/CD pipeline"
impact:
  - "Credentials encrypted before storage — protected even if the database leaks"
  - "Strong password generator and instant search"
  - "Encrypted import / export and change history"
tags: ["Python","Vue.js","TypeScript","MongoDB","Docker","GitLab CI"]
---
