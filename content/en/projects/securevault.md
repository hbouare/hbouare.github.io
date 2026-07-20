---
id: securevault
order: 4
title: "Secure Password Manager"
featured: false
tags: ["Python", "Vue.js", "Typescript", "MongoDB", "Docker", "GitLab CI"]
context: "Personal / security R&D project"
role: "Full-stack design & development"
impact:
  - "Credentials encrypted before storage — protected even if the database leaks"
  - "Strong password generator and instant search"
  - "Encrypted import / export and change history"
access: "private"
github: ""
demo: ""
---

**The problem.** Storing sensitive credentials demands a strong guarantee: even if the database leaks, the secrets must stay unreadable — while keeping day-to-day use frictionless.

**The approach.** A vault where information is encrypted before storage using strong cryptography, organised into categories, with a robust password generator and instant search. Change history and encrypted import/export round out the management tools.
