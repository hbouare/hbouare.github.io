---
slug: "fleetops"
order: 1
title: "Vehicle Fleet Management"
featured: true
context: "Personal project — transport & services"
hook: "Steer an entire vehicle fleet from a single screen, and never let a deadline slip."

status: "Functional · demo data"
frontend: "A single place to track vehicles, drivers, documents and servicing."
backend: "The core of the system: an engine that detects and ranks every deadline."
database: "All fleet data, centralised and kept over time."

intro: "A fleet-management application that replaces fragmented tracking — spreadsheets, emails, manual reminders — with a single operational view. It watches three sources of deadlines (driver licences, regulatory documents, servicing), by date or by mileage, and turns each approaching deadline into a ranked alert that a manager acknowledges and then resolves."

highlights:
  - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
  - "Warning / critical severity, with manager acknowledge then resolve"
  - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  - "Paginated, filterable lists (search, status, sort) and cost tracking"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]
---
