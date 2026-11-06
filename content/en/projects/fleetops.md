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
story:
  problem:
    title: "Fragmented tracking, missed deadlines"
    text: "A fleet-management application that replaces fragmented tracking — spreadsheets, emails, manual reminders — with a single operational view."
  constraints:
    title: "Three sources of deadlines, two roles"
    text: "It watches three sources of deadlines (driver licences, regulatory documents, servicing), by date or by mileage."
    points:
      - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
      - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  approach:
    title: "Under the hood"
    points:
      - "Warning / critical severity, with manager acknowledge then resolve"
      - "Paginated, filterable lists (search, status, sort) and cost tracking"
  result:
    title: "Every deadline becomes a handled alert"
    text: "Each approaching deadline is turned into a ranked alert that a manager acknowledges and then resolves."
    points:
      - "79 API routes over 14 resources: vehicles, drivers, assignments, documents, servicing, fuel, incidents, expenses, alerts…"
      - "Idempotent alert recalculation: re-running it never creates a duplicate (covered by a test)"
      - "8 versioned schema migrations"
      - "51 automated tests: 43 on the API, 8 front-end unit tests"
tags: ["FastAPI","Vue 3","TypeScript","PostgreSQL","SQLAlchemy"]

cover:
  src: "/projects/fleetops/hero.webp"
  alt: "FleetOps dashboard — operational overview of the fleet"

gallery:
  - src: "/projects/fleetops/vehicles.webp"
    caption: "The fleet: search, filters and each vehicle’s status"
    section: approach
    span: 6
  - src: "/projects/fleetops/form.webp"
    caption: "Vehicle record: identification and operational data"
    section: approach
    span: 3
  - src: "/projects/fleetops/analytics.webp"
    caption: "Fleet breakdown and monthly costs at a glance"
    section: result
    span: 3
  - src: "/projects/fleetops/costs.webp"
    caption: "Cost tracking by vehicle, category and supplier"
    section: result
    span: 4
  - src: "/projects/fleetops/mobile.webp"
    caption: "Responsive interface, built for the field"
    device: phone
    section: result
    span: 2
---
