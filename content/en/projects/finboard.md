---
slug: "finboard"
order: 2
title: "Financial tracking for small businesses"
featured: false
context: "Personal project — SMB, finance"
hook: "Bring transactions, invoices, imports and reports together in an application organised by business domain."

status: "In progress · foundations delivered"
frontend: "A dashboard for viewing financial data and accessing each business domain."
backend: "A modular monolith with separate routes, services and data access for each domain."
database: "A shared data model, consistent from one domain to the next."

intro: "This SaaS project for small businesses brings together financial tracking, statement imports, invoices, alerts and reports. Development began with a shared foundation: a modular architecture, a dashboard shell and automated quality checks. Business domains were then added incrementally."

highlights:
  - "Modular monolith organised by business domain"
  - "Dashboard shell and a versioned REST API (/api/v1)"
  - "Shared data model: UUID identifiers, UTC timestamps, reversible migrations"
  - "Required CI checks: lint, strict typing and tests"
# Figures counted in the repository (2026-11-06): 42 API routes, 5 Alembic
# migrations (each with a downgrade), 56 pytest + 24 Vitest + 7 Playwright
# tests, CI coverage gates: API 90%, front-end 80% (branches 70%).
story:
  problem:
    title: "Building a financial application that can grow"
  constraints:
    title: "Adding features on a shared foundation"
    text: "Finance, imports, invoices, alerts and reports need consistent data conventions. The architecture must support incremental development, with quality checks on every release."
  approach:
    title: "Separating domains and automating checks"
  result:
    title: "Seven domains integrated into the application"
    text: "The project is still in progress. The foundation and the domains listed below are implemented, each with its own routes, service and data access."
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
    caption: "Transactions: search, filters, categories and signed amounts"
    span: 4
  - src: "/projects/finboard/mobile.webp"
    caption: "Financial dashboard on mobile"
    device: phone
    span: 2
  - src: "/projects/finboard/imports.webp"
    caption: "CSV/XLSX statement import: parse, review line by line, then confirm"
    span: 3
  - src: "/projects/finboard/login.webp"
    caption: "Sign-in screen for the financial tracking application"
    span: 3
---
