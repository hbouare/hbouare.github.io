---
slug: "finboard"
order: 2
title: "Pilotis — foundations of a financial-tracking SaaS"
featured: false
context: "Personal project — SMB, finance"
hook: "The foundations of a financial-tracking SaaS for SMBs: a solid technical base, laid before the features."

# Facts shown under the title. `period` is intentionally omitted: the repo
# history is a snapshot and does not reflect the real development timeline.
role: "Full-stack design & development"
team: "Solo"
status: "In progress — foundations delivered"

intro: "A financial-tracking SaaS aimed at SMBs, whose first increment lays the foundations: the architecture, the dashboard shell and a complete quality chain, before the business domains are added."
objectives:
  - "Lay an extensible technical base for a multi-domain financial SaaS"
  - "Eventually consolidate scattered financial flows into a single dashboard"
  - "Guarantee a strict, blocking quality chain from the foundation up"
challenge: "The target, for an SMB, is reconciliation and categorisation done by hand over transactions scattered across sources — slow, repetitive, with no consolidated view. But before tackling that business problem, a multi-domain SaaS needs foundations that will not be reworked: security, data model, conventions."
solution: "A modular monolith organised by domains, where each new domain (finance, categories, invoices, imports, reports, alerts…) is added without touching the foundations. This first increment delivers the foundations, the dashboard shell and a complete quality chain — the rest plugs into it incrementally."

architecture: "A FastAPI modular monolith organised by domains: routes delegate to business services, which orchestrate SQLAlchemy repositories on PostgreSQL. The Vue 3 frontend separates pages, components, stores, API calls and plugins. A REST API versioned under /api/v1, shared UUID identifiers and UTC timestamps, migrations designed to stay coherent and reversible. Later domains are added on these foundations without modifying them."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · dashboard shell, pages / components / stores / API separation"
  - layer: "API"
    detail: "FastAPI · modular monolith by domains · REST API /api/v1 · UUID identifiers and UTC timestamps"
  - layer: "Data"
    detail: "PostgreSQL · SQLAlchemy · coherent, reversible migrations"
  - layer: "Delivery"
    detail: "Docker Compose · GitLab CI (blocking) · pre-commit · Ruff / Black / MyPy strict / pytest on the back; ESLint / Prettier / TS strict / Stylelint / Vitest / Playwright on the front"

decisions:
  - problem: "A multi-domain financial SaaS can start as microservices — strong isolation, but immediate infrastructure complexity — or as a rigid monolith, simpler but costly to evolve later."
    choice: "A modular monolith organised by domains, in layers (routes → services → repositories), designed so each domain is added without reworking the foundations."
    consequence: "Evolution stays simple and deployment stays single — at the cost of a layering discipline to uphold, and without the deployment isolation that truly separate services would give."

highlights:
  - "Modular monolith by domains, extensible without touching the foundations"
  - "Dashboard shell and a versioned REST API (/api/v1)"
  - "Shared data model: UUID identifiers, UTC timestamps, reversible migrations"
  - "Complete, blocking quality chain (lint, strict typing, tests) in CI"
deliverables:
  - "Technical foundations of a financial SaaS (FastAPI backend + Vue 3 frontend)"
  - "Dashboard shell and versioned REST API"
  - "Complete quality chain (Ruff, Black, MyPy, pytest; ESLint, Prettier, Vitest, Playwright) in CI"
  - "Docker Compose orchestration, one-command run"
impact:
  - "A typed, tested, tooled technical base, ready to receive the business domains"
  - "A strict quality chain laid from the foundation rather than bolted on later"
  - "A modular architecture that absorbs future domains without rewriting the foundations"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
