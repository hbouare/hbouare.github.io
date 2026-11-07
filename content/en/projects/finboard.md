---
slug: "finboard"
order: 2
title: "Foundations of a financial-tracking SaaS"
featured: false
context: "Personal project — SMB, finance"
hook: "The foundations of a financial-tracking SaaS for SMBs: a solid technical base, laid before the features."

status: "In progress · foundations delivered"
frontend: "The dashboard, designed to take on new business domains."
backend: "Organised by domain: each one is added without touching the foundations."
database: "A shared data model, consistent from one domain to the next."

intro: "The foundations of a financial-tracking SaaS for SMBs: a modular monolith organised by domains, where each new domain (categories, invoices, imports, reports…) is added without touching the foundations. This first increment delivers the architecture, the dashboard shell and a complete, blocking quality chain — before the business domains."

highlights:
  - "Modular monolith by domains, extensible without touching the foundations"
  - "Dashboard shell and a versioned REST API (/api/v1)"
  - "Shared data model: UUID identifiers, UTC timestamps, reversible migrations"
  - "Complete, blocking quality chain (lint, strict typing, tests) in CI"
# Figures counted in the repository (2026-11-06): 42 API routes, 5 Alembic
# migrations (each with a downgrade), 56 pytest + 24 Vitest + 7 Playwright
# tests, CI coverage gates: API 90%, front-end 80% (branches 70%).
story:
  problem:
    title: "Foundations before features"
  constraints:
    title: "Adding domains without touching the foundations"
    text: "A financial SaaS for SMEs grows one domain at a time — finance, imports, invoices, alerts, reports. Each addition has to plug into what exists without rewriting it, and without quality eroding release after release."
  approach:
    title: "A modular monolith, a blocking quality chain"
  result:
    title: "Business domains, plugged into the foundations"
    text: "On these foundations, the business domains were added one by one, each with its own routes, service and repository."
    points:
      - "42 API routes across seven business domains: authentication, finance, CSV/XLSX imports, invoices, alerts, reports, search"
      - "5 schema migrations, each one reversible"
      - "87 automated tests: 56 on the API, 24 front-end unit tests, 7 end-to-end journeys"
      - "Minimum coverage enforced in CI: 90% on the API, 80% on the front end"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]

cover:
  src: "/projects/finboard/hero.webp"
  alt: "Pilotis — dashboard: revenue, expenses, profit and cash on hand"

gallery:
  - src: "/projects/finboard/transactions.webp"
    caption: "Every operation: search, filters, categories and signed amounts"
    span: 4
  - src: "/projects/finboard/mobile.webp"
    caption: "Financial steering, available on mobile"
    device: phone
    span: 2
  - src: "/projects/finboard/imports.webp"
    caption: "CSV/XLSX statement import: parse, review line by line, then confirm"
    span: 3
  - src: "/projects/finboard/login.webp"
    caption: "A reliable space to centralise financial flows"
    span: 3
---
