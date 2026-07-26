---
slug: "fleetops"
order: 1
title: "Vehicle Fleet Management"
featured: true
context: "Personal project — transport & services"
hook: "Steer an entire vehicle fleet from a single screen, and never let a deadline slip."

status: "Functional · demo data"
cover: "/projects/fleetops/architecture-en.svg"

intro: "A fleet-management application that replaces fragmented tracking — spreadsheets, emails, manual reminders — with a single operational view. It watches three sources of deadlines (driver licences, regulatory documents, servicing), by date or by mileage, and turns each approaching deadline into a ranked alert that a manager acknowledges and then resolves."
architecture: "A three-layer web application — Vue 3 interface, versioned FastAPI API, PostgreSQL database — with all business logic and every authorisation check living server-side. The heart of the system is not the CRUD but the alert engine: it watches three sources of deadlines and two triggers, by date and by mileage. How it computes them is the defining choice of the project."

highlights:
  - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
  - "Warning / critical severity, with manager acknowledge then resolve"
  - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  - "Paginated, filterable lists (search, status, sort) and cost tracking"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
