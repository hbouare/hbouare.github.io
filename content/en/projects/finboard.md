---
slug: "finboard"
order: 2
title: "Pilotis — foundations of a financial-tracking SaaS"
featured: false
context: "Personal project — SMB, finance"
hook: "The foundations of a financial-tracking SaaS for SMBs: a solid technical base, laid before the features."

status: "In progress · foundations delivered"

intro: "The foundations of a financial-tracking SaaS for SMBs: a modular monolith organised by domains, where each new domain (categories, invoices, imports, reports…) is added without touching the foundations. This first increment delivers the architecture, the dashboard shell and a complete, blocking quality chain — before the business domains."
architecture: "A FastAPI modular monolith organised by domains: routes delegate to business services, which orchestrate SQLAlchemy repositories on PostgreSQL. The Vue 3 frontend separates pages, components, stores, API calls and plugins. A REST API versioned under /api/v1, shared UUID identifiers and UTC timestamps, migrations designed to stay coherent and reversible. Later domains are added on these foundations without modifying them."

decisions:
  - problem: "A multi-domain financial SaaS can start as microservices — strong isolation, but immediate infrastructure complexity — or as a rigid monolith, simpler but costly to evolve later."
    choice: "A modular monolith organised by domains, in layers (routes → services → repositories), designed so each domain is added without reworking the foundations."
    consequence: "Evolution stays simple and deployment stays single — at the cost of a layering discipline to uphold, and without the deployment isolation that truly separate services would give."

highlights:
  - "Modular monolith by domains, extensible without touching the foundations"
  - "Dashboard shell and a versioned REST API (/api/v1)"
  - "Shared data model: UUID identifiers, UTC timestamps, reversible migrations"
  - "Complete, blocking quality chain (lint, strict typing, tests) in CI"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
