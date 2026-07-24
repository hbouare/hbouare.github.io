---
slug: "fleetops"
order: 1
title: "FleetOps — Vehicle Fleet Management"
featured: true
context: "Personal project — transport & services"
hook: "Steer an entire vehicle fleet from a single screen, and never let a deadline slip."

status: "Functional · demo data"

intro: "A fleet-management application that replaces fragmented tracking — spreadsheets, emails, manual reminders — with a single operational view. It watches three sources of deadlines (driver licences, regulatory documents, servicing), by date or by mileage, and turns each approaching deadline into a ranked alert that a manager acknowledges and then resolves."
architecture: "A three-layer web application — Vue 3 interface, versioned FastAPI API, PostgreSQL database — with all business logic and every authorisation check living server-side. The heart of the system is not the CRUD but the alert engine: it watches three sources of deadlines and two triggers, by date and by mileage. How it computes them is the defining choice of the project."

decisions:
  - problem: "Deadlines depend on three sources (licences, documents, servicing) and two triggers (date, mileage). Recomputing them on every read made the lists slow and impossible to filter, sort or paginate in the database."
    choice: "Materialise alerts in a dedicated table, rebuilt by an explicit recalculation rather than derived on read."
    consequence: "Lists stay fast, filterable and paginated — but state is no longer computed in real time: the recalculation has to be triggered for alerts to stay correct."

highlights:
  - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
  - "Warning / critical severity, with manager acknowledge then resolve"
  - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  - "Paginated, filterable lists (search, status, sort) and cost tracking"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy","Docker","GitLab CI"]
---
