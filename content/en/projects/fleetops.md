---
slug: "fleetops"
order: 1
title: "Vehicle Fleet Management System"
featured: true
context: "Client engagement — transport & services"
role: "Full-stack design & development"
hook: "A whole vehicle fleet steered from one screen — no more scattered spreadsheets."
intro: "Built for transport and service companies, the tool had to replace a fragmented fleet-tracking routine with genuinely centralised operations."
objectives:
  - "Centralise day-to-day fleet operations in a single tool"
  - "Anticipate maintenance and compliance deadlines"
  - "Give managers visibility over operating costs"
challenge: "Mileage, servicing, insurance and regulatory documents lived in separate files: no overview, no way to anticipate deadlines, and a compliance risk with every missed date."
solution: "A platform centralising all vehicle and driver data, backed by a scheduling module that automatically raises alerts as inspections, insurance renewals and regulatory deadlines approach."
architecture: "A Python API exposes fleet data to a dedicated Vue.js frontend for viewing and data entry. Persistence relies on PostgreSQL (vehicles, drivers, deadlines, costs) and alert computation runs server-side. Everything is containerised with Docker and shipped through a GitLab CI/CD pipeline."
highlights:
  - "Automatic maintenance and compliance alerts"
  - "Mileage, servicing and fuel-consumption tracking"
  - "Dashboard of fleet status and operating costs"
deliverables:
  - "Complete web application (frontend and backend)"
  - "Fleet, driver and document management"
  - "Deadline scheduling and alerting module"
  - "Containerised deployment and CI/CD pipeline"
impact:
  - "Fleet data, previously scattered across spreadsheets, centralised in one place"
  - "Maintenance and compliance deadlines tracked automatically instead of by hand"
  - "Visibility over fleet operating costs"
tags: ["Python","Vue.js","PostgreSQL","Docker","GitLab CI"]
access: "private"
---

