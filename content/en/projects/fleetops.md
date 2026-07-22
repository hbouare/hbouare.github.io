---
slug: "fleetops"
order: 1
title: "FleetOps — Vehicle Fleet Management"
featured: true
context: "Client engagement — transport & services"
role: "Full-stack design & development"
hook: "Steer an entire vehicle fleet from a single screen, and never let a deadline slip."
intro: "A fleet-management application built to replace fragmented tracking — spreadsheets, emails, manual reminders — with centralised operations where every deadline is detected automatically."
objectives:
  - "Centralise vehicles, drivers, documents and servicing in a single tool"
  - "Automatically detect maintenance and compliance deadlines"
  - "Give managers visibility over fleet status and operating costs"
challenge: "Mileage, servicing, insurance and regulatory documents usually live in separate files. No overview, no anticipation: one missed deadline means a compliance breach, sometimes a vehicle off the road."
solution: "A platform that brings all fleet data together and watches three sources of deadlines: driver licences, documents (insurance, regulatory inspection) and servicing — triggered by date or by mileage. Each approaching deadline becomes a ranked alert (warning or critical) that a manager can acknowledge and then resolve."
architecture: "FastAPI backend (Python 3.12) with SQLAlchemy 2.0 on PostgreSQL and Alembic migrations, API versioned under /api/v1. Vue 3 + Vuetify frontend in TypeScript (Vite, Pinia). Security: JWT in an httpOnly cookie, Argon2 hashing, and RBAC (admin / manager) always enforced server-side. A defining choice: rather than recomputing deadlines on every read, alerts are materialised in a dedicated table and rebuilt by an explicit recalculation — which keeps the lists fast, filterable and paginated, at the cost of triggering that recalculation to stay current. Liveness/readiness probes, production start-up guards, and a one-command Docker Compose run, under GitLab CI."
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
access: "public"
github: "https://github.com/hamedbouare9/gestion-de-flottes"
---
