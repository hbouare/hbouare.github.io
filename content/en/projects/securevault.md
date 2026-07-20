---
slug: "securevault"
order: 4
title: "Secure Password Manager"
featured: false
context: "Personal / security R&D project"
role: "Full-stack design & development"
hook: "A password vault where even a database leak reveals nothing."
intro: "An application to store and organise credentials in one place, without ever compromising on data confidentiality."
objectives:
  - "Protect credentials even if the database leaks"
  - "Simplify day-to-day password management"
  - "Provide organised, searchable storage"
challenge: "Storing secrets demands a strong guarantee: even if the database leaks, credentials must stay unreadable — all without weighing down day-to-day use."
solution: "A vault where every item is encrypted before storage using a strong scheme, organised into categories, with a robust password generator, instant search and encrypted import/export."
architecture: "A Python backend encrypts data before persistence; encrypted entries are stored in MongoDB, never in clear text. The Vue.js frontend in TypeScript delivers a smooth viewing and entry experience. Docker containerisation and continuous deployment through GitLab CI."
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
access: "private"
---

