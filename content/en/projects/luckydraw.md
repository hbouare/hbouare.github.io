---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Personal project — consumer platform"
hook: "Online prize draws whose fairness is proven, not just promised."

# Facts shown under the title. `period` is intentionally omitted: the repo
# history is a snapshot and does not reflect the real development timeline.
role: "Full-stack design & development"
team: "Solo"
status: "Functional — 6 phases delivered"

intro: "A consumer platform to run and play prize draws, where participant trust rested entirely on the transparency of the process."
objectives:
  - "Guarantee draws that are fair and verifiable by the participants themselves"
  - "Make campaigns simple to operate for the organiser"
  - "Track participation and ticket sales"
challenge: "An online draw is only worth anything if its fairness is verifiable: without a guarantee of integrity, trust collapses — while it still has to stay simple to operate."
solution: "A platform where users create accounts, buy tickets and follow their history, backed by a verifiable draw engine (a provably-fair commit-reveal scheme) and operated from a full back-office: campaigns, results, transactions and analytics."

architecture: "A single Node.js API serves two audiences with opposite requirements: the player area, where draw integrity must be out of reach, and the back-office, where the organiser configures rules, schedule and prizes. The draw lives server-side only, backed by MongoDB for campaigns, tickets and entries, and by Redis for caching and multi-instance rate-limiting. Inputs pass a double validation barrier — Zod at the HTTP edge, Mongoose at persistence — and monetary amounts are stored as integer cents."
stack:
  - layer: "Interface"
    detail: "Vue 3 (script setup) · Vuetify 3 · Pinia · Vue Router · Vue I18n · Axios · TypeScript"
  - layer: "API"
    detail: "Node.js 20 · Express · TypeScript · layered architecture (controller → service → repository) · JWT access/refresh · Zod · Pino · Swagger"
  - layer: "Data"
    detail: "MongoDB / Mongoose · Redis (cache and distributed rate-limiting)"
  - layer: "Delivery"
    detail: "Docker Compose · Travis CI (lint, typecheck, test, build per package) · Husky / lint-staged · Jest + Vitest + Playwright"

decisions:
  - problem: "An online draw must be both unpredictable beforehand and verifiable afterwards: nobody may anticipate the result, yet anyone must be able to prove it was not rigged. Plain server-side randomness is a black box — the player has to take the organiser's word for it."
    choice: "A provably-fair commit-reveal scheme: a cryptographic server seed is committed by its published hash before the draw, the selection is deterministic (HMAC-SHA256), and the seed is revealed afterwards."
    consequence: "Every participant can replay and verify the draw themselves, without trusting the organiser — at the cost of a strict protocol: the seed must be committed first, archived, then revealed without fail for every draw."
  - problem: "Handling ticket prices and prize pools as floating-point numbers always ends up producing rounding drift — unacceptable on money."
    choice: "Store every amount as integer cents rather than floats."
    consequence: "Monetary maths is exact by construction — at the cost of an explicit display conversion to handle at every boundary."

highlights:
  - "Provably-fair draw (commit-reveal), replayable and verifiable by the player"
  - "Configurable campaigns (rules, schedule, prizes)"
  - "Ticket purchase and participation history"
  - "Back-office: results, transactions, analytics, exports"
deliverables:
  - "Player area (account, ticket purchase, history)"
  - "Provably-fair draw engine (commit-reveal, HMAC-SHA256)"
  - "Back-office for campaigns and results, with charts and exports"
  - "Containerised deployment and continuous integration (Travis CI)"
impact:
  - "Draw fairness no longer promised but verifiable by every participant"
  - "Fully configurable campaigns, operated from a back-office"
  - "Six phases delivered, from foundation to admin dashboard, under a test suite (unit, integration, e2e)"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
