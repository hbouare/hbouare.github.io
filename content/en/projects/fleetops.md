---
slug: "fleetops"
order: 1
title: "Vehicle Fleet Management"
featured: true
context: "Personal project — transport & services"
hook: "Track vehicles, drivers and maintenance deadlines in one place."

status: "Functional · demo data"
frontend: "A single place to track vehicles, drivers, documents and servicing."
backend: "An alert engine based on dates and mileage."
database: "All fleet data, centralised and kept over time."

intro: "FleetOps brings vehicles, drivers and maintenance operations into one application. Licence, regulatory document and servicing deadlines feed alerts that a manager can acknowledge and resolve."

highlights:
  - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
  - "Warning and critical severity levels, with manager acknowledgement and resolution"
  - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  - "Paginated, filterable lists (search, status, sort) and cost tracking"
story:
  problem:
    title: "Bringing scattered records together"
    text: "Fleet records can be spread across spreadsheets, emails and manual reminders. FleetOps brings this information together so managers can see the vehicles and the work that needs to be planned."
  constraints:
    title: "Different kinds of deadlines"
    text: "Licences and regulatory documents have expiry dates; servicing can also depend on mileage. The system needs to handle these rules and distinguish administrator permissions from manager permissions."
    points:
      - "Alerts across three domains: licences, regulatory documents and servicing (by date or by mileage)"
      - "Admin / manager roles enforced server-side, JWT httpOnly cookie and Argon2 hashing"
  approach:
    title: "Organising alerts and follow-up"
    points:
      - "Warning and critical severity levels, with manager acknowledgement and resolution"
      - "Paginated, filterable lists (search, status, sort) and cost tracking"
  result:
    title: "Tracking alerts through to resolution"
    text: "The application runs with demonstration data. It assigns severity levels to approaching deadlines and lets managers track alerts from acknowledgement to resolution."
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
