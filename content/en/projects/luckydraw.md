---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Personal project — consumer platform"
hook: "Run prize-draw campaigns and let players verify the results."

status: "Functional · 6 phases delivered"
frontend: "A player area and an admin back-office for campaigns."
backend: "A draw engine that publishes a hash before the draw and reveals the seed afterwards."
database: "Campaigns, tickets, entries and transactions."

intro: "LuckyDraw lets players create accounts, buy tickets and view their participation history. An administration interface manages campaigns, results and statistics. The draw engine uses a commit-reveal mechanism so players can verify the result."

highlights:
  - "Commit-reveal mechanism that lets players recalculate and verify the result"
  - "Configurable campaigns (rules, schedule, prizes)"
  - "Ticket purchase and participation history"
  - "Back-office: results, transactions, analytics, exports"
# Figures counted in the repository (2026-11-06): 44 API routes in 10
# modules, 43 unit/integration + 2 Playwright tests; provably-fair engine
# tests (SHA-256 hash, tampered seed rejected, immutable draw).
story:
  problem:
    title: "Making draw results verifiable"
  constraints:
    title: "Verifying draws and representing amounts"
    text: "Players need to be able to verify the result using information published by the engine. Monetary amounts are stored as integer cents to avoid errors from floating-point calculations."
  approach:
    title: "Commit, reveal, verify"
  result:
    title: "Verification covered by tests"
    text: "Tests cover seed verification, rejection of a second draw and the representation of monetary amounts."
    points:
      - "Seed committed as a SHA-256 hash published before the draw, revealed after: a genuine draw is validated, a tampered seed is rejected"
      - "Immutable draws: a second draw on the same lottery is refused"
      - "Amounts stored as integer cents, with no floating-point arithmetic"
      - "45 automated tests (43 unit and integration, 2 end-to-end journeys); lint, type checks, tests and build required to pass in CI"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis"]

cover:
  src: "/projects/luckydraw/hero.webp"
  alt: "The lottery catalogue: prize pots, categories and live status"

gallery:
  - src: "/projects/luckydraw/verify.webp"
    caption: "Every draw is cryptographically verifiable (commit-reveal): hash published upfront, seed revealed, result replayable"
    span: 4
  - src: "/projects/luckydraw/mobile.webp"
    caption: "Browse the lotteries and play, on mobile too"
    device: phone
    span: 2
  - src: "/projects/luckydraw/detail.webp"
    caption: "Lottery page: prize, ticket price, scheduled draw and rules"
    span: 3
  - src: "/projects/luckydraw/landing.webp"
    caption: "Prize-draw platform home page"
    span: 3
---
