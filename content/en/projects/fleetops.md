---
slug: "fleetops"
order: 1
title: "FleetOps — Vehicle Fleet Management"
featured: true
context: "Client engagement — transport & services"
hook: "Steer an entire vehicle fleet from a single screen, and never let a deadline slip."

# Facts shown under the title. Any value starting with TODO is dropped at
# render: replace them, but nothing false ships in the meantime.
role: "Full-stack design & development"
period: "TODO — e.g. 2024 · 6 months"
team: "TODO — e.g. Solo / 3 developers"
status: "TODO — e.g. In production / Delivered / Prototype"

intro: "A fleet-management application built to replace fragmented tracking — spreadsheets, emails, manual reminders — with centralised operations where every deadline is detected automatically."
objectives:
  - "Centralise vehicles, drivers, documents and servicing in a single tool"
  - "Automatically detect maintenance and compliance deadlines"
  - "Give managers visibility over fleet status and operating costs"
challenge: "Mileage, servicing, insurance and regulatory documents usually live in separate files. No overview, no anticipation: one missed deadline means a compliance breach, sometimes a vehicle off the road."
solution: "A platform that brings all fleet data together and watches three sources of deadlines: driver licences, documents (insurance, regulatory inspection) and servicing — triggered by date or by mileage. Each approaching deadline becomes a ranked alert (warning or critical) that a manager can acknowledge and then resolve."

# Frames the technical plan without repeating it: the technology list lives
# in `stack`, this paragraph explains the shape of the system.
architecture: "A three-layer web application — Vue 3 interface, versioned FastAPI API, PostgreSQL database — with all business logic and every authorisation check living server-side. The heart of the system is not the CRUD but the alert engine: it watches three sources of deadlines and two triggers, by date and by mileage. How it computes them is the defining choice of the project."
stack:
  - layer: "Interface"
    detail: "Vue 3 · Vuetify · TypeScript · Vite · Pinia"
  - layer: "API"
    detail: "FastAPI (Python 3.12) · API versioned under /api/v1 · JWT in an httpOnly cookie · Argon2 hashing · admin / manager RBAC enforced server-side"
  - layer: "Data"
    detail: "PostgreSQL · SQLAlchemy 2.0 · Alembic migrations · materialised alerts table"
  - layer: "Delivery"
    detail: "Docker Compose (one-command run) · GitLab CI: lint, tests, e2e, dependency audit · liveness / readiness probes and production start-up guards"

decisions:
  - problem: "Deadlines depend on three sources (licences, documents, servicing) and two triggers (date, mileage). Recomputing them on every read made the lists slow and impossible to filter, sort or paginate in the database."
    choice: "Materialise alerts in a dedicated table, rebuilt by an explicit recalculation rather than derived on read."
    consequence: "Lists stay fast, filterable and paginated — but state is no longer computed in real time: the recalculation has to be triggered for alerts to stay correct."

highlights:
  - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
  - "Warning / critical severity, with manager acknowledge then resolve"
  - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  - "Paginated, filterable lists (search, status, sort) and cost tracking"
deliverables:
  - "Complete web application (FastAPI API + Vue 3/Vuetify interface)"
  - "Versioned data model (Alembic migrations) and a demo dataset"
  - "Multi-source alert engine with recalculation and lifecycle"
  - "Docker Compose deployment and CI pipeline (lint, tests, e2e, dependency audit)"
impact:
  - "Unified fleet tracking: vehicles, drivers, documents and servicing in one place"
  - "Deadlines detected automatically across three sources, by date and by mileage"
  - "Tooled quality: backend tests (pytest and coverage), front unit and e2e, migration checks — all in CI"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
