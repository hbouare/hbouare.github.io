---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Client engagement — consumer platform"
hook: "Online prize draws whose fairness is proven, not just promised."

# Facts shown under the title. Any value starting with TODO is dropped at
# render: replace them, but nothing false ships in the meantime.
role: "Full-stack design & development"
period: "TODO — e.g. 2022 · 5 months"
team: "TODO — e.g. Solo / 2 developers"
status: "TODO — e.g. In production / Delivered / Prototype"

intro: "A consumer platform to run and play prize draws, where participant trust rested entirely on the transparency of the process."
objectives:
  - "Guarantee fair and verifiable draws"
  - "Make campaigns simple to operate for the organiser"
  - "Track participation and ticket sales"
challenge: "An online draw is only worth anything if its fairness is verifiable: without a guarantee of integrity, trust collapses — while it still has to stay simple to operate."
solution: "A platform where users create accounts, buy tickets and follow their history, backed by a secure random-generation engine that guarantees draw integrity, operated from a full back-office."

architecture: "A single Node.js API serves two audiences with opposite requirements: the player area, where draw integrity must be out of reach, and the back-office, where the organiser configures rules, schedule and prizes. The draw itself lives server-side only, backed by MongoDB for campaigns, tickets and entries."
stack:
  - layer: "Interface"
    detail: "Vue.js · player area (account, ticket purchase, history) and back-office"
  - layer: "API"
    detail: "Node.js · TypeScript · game logic and secure random-draw engine, server-side only"
  - layer: "Data"
    detail: "MongoDB · campaigns, draws, tickets and entries"
  - layer: "Delivery"
    detail: "Docker containerisation · continuous integration with Travis CI"

# TODO — Add the project's real engineering trade-off here (the problem, the
# choice, what it costs). None is documented in the existing copy, and the
# section stays hidden while this field is absent.
# Leads: choosing MongoDB over a transactional model for ticketing; the
# source of randomness and how a player can verify it.

highlights:
  - "Secure random-draw engine"
  - "Configurable campaigns (rules, schedule, prizes)"
  - "Ticket purchase and participation history"
  - "Back-office: results, transactions, analytics"
deliverables:
  - "Player area (account, ticket purchase, history)"
  - "Secure random-draw engine"
  - "Back-office for campaigns and results management"
  - "Containerised deployment and continuous integration"
impact:
  - "Draws provably fair via a secure random-generation engine"
  - "Fully configurable campaigns, operated from a back-office"
  - "Real-time tracking of participation and ticket sales"
tags: ["Node.js","Vue.js","TypeScript","MongoDB","Docker","Travis CI"]
---
