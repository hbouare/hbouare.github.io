---
slug: "finboard"
order: 2
title: "Financial Monitoring Dashboard"
featured: false
context: "Client engagement — SMB, finance"
role: "Full-stack design & development"
hook: "A small business’s entire finances in one dashboard, always up to date."
intro: "Designed for SMBs, the tool had to give clear, consolidated visibility over financial flows that were previously spread across multiple sources."
objectives:
  - "Consolidate scattered financial flows into a single dashboard"
  - "Automate transaction categorisation and reconciliation"
  - "Make reporting reliable and surface anomalies early"
challenge: "Teams reconciled and categorised transactions from multiple sources by hand — slow, repetitive, error-prone work, with no consolidated view of their indicators."
solution: "A single dashboard that imports transactions automatically, tracks revenue and expenses, manages invoices and visualises key indicators — with, at its core, a categorisation engine driven by business-editable rules rather than a black box."
architecture: "A Python backend handles transaction import and processing along with the rule-based categorisation engine. PostgreSQL stores financial data and pre-computed aggregates for responsive dashboards, consumed by a Vue.js frontend. Docker containerisation and continuous deployment through GitLab CI."
highlights:
  - "Rule-based, business-configurable categorisation engine"
  - "Automatic bank-transaction import"
  - "Monthly reports and accounting exports (CSV / PDF)"
  - "Alerts on overdue invoices and abnormal cash flow"
deliverables:
  - "Financial dashboard web application"
  - "Configurable rule-based categorisation engine"
  - "Report generation and exports (CSV / PDF)"
  - "Containerised deployment and CI/CD pipeline"
impact:
  - "Transaction reconciliation and categorisation automated, previously manual"
  - "Monthly reporting and accounting exports (CSV / PDF) generated on demand"
  - "Real-time alerts on overdue invoices and abnormal cash-flow patterns"
tags: ["Python","Vue.js","PostgreSQL","Docker","GitLab CI"]
access: "private"
---

