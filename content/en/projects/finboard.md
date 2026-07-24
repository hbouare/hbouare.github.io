---
slug: "finboard"
order: 2
title: "Financial Monitoring Dashboard"
featured: false
context: "Client engagement — SMB, finance"
hook: "A small business’s entire finances in one dashboard, always up to date."

# Facts shown under the title. Any value starting with TODO is dropped at
# render: replace them, but nothing false ships in the meantime.
role: "Full-stack design & development"
period: "TODO — e.g. 2023 · 4 months"
team: "TODO — e.g. Solo / 2 developers"
status: "TODO — e.g. In production / Delivered / Prototype"

intro: "Designed for SMBs, the tool had to give clear, consolidated visibility over financial flows that were previously spread across multiple sources."
objectives:
  - "Consolidate scattered financial flows into a single dashboard"
  - "Automate transaction categorisation and reconciliation"
  - "Make reporting reliable and surface anomalies early"
challenge: "Teams reconciled and categorised transactions from multiple sources by hand — slow, repetitive, error-prone work, with no consolidated view of their indicators."
solution: "A single dashboard that imports transactions automatically, tracks revenue and expenses, manages invoices and visualises key indicators — with, at its core, a categorisation engine driven by business-editable rules rather than a black box."

architecture: "Three blocks, and one rule: the dashboard computes nothing. The Python backend ingests transactions and applies the rules engine to them; PostgreSQL holds both the financial data and pre-computed aggregates; the Vue.js frontend only ever reads those aggregates. That split is what keeps the dashboards responsive as the history grows."
stack:
  - layer: "Interface"
    detail: "Vue.js · dashboards, indicator visualisation, exports"
  - layer: "Processing"
    detail: "Python · automatic bank-transaction import · rule-based categorisation engine · report generation (CSV / PDF)"
  - layer: "Data"
    detail: "PostgreSQL · financial records and pre-computed aggregates"
  - layer: "Delivery"
    detail: "Docker containerisation · continuous deployment through GitLab CI"

decisions:
  - problem: "Automatic categorisation could have relied on a statistical model: more autonomous, but opaque. A misclassified transaction then becomes unexplainable — and uncorrectable by the finance team itself."
    choice: "An explicit rules engine, editable by the business, rather than a black box."
    consequence: "Every classification is traceable and correctable without a developer — at the cost of a rule set to maintain, which does not generalise to new cases on its own."

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
---
