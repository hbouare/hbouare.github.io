---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Personal project — consumer platform"
hook: "Online prize draws whose fairness is proven, not just promised."

status: "Functional · 6 phases delivered"

intro: "A consumer prize-draw platform where trust rests on proof, not promises. Players create an account, buy tickets and follow their history; every draw runs on a verifiable engine (provably-fair commit-reveal), operated from a full back-office: campaigns, results, analytics."
architecture: "A single Node.js API serves two audiences with opposite requirements: the player area, where draw integrity must be out of reach, and the back-office, where the organiser configures rules, schedule and prizes. The draw lives server-side only, backed by MongoDB for campaigns, tickets and entries, and by Redis for caching and multi-instance rate-limiting. Inputs pass a double validation barrier — Zod at the HTTP edge, Mongoose at persistence — and monetary amounts are stored as integer cents."

decisions:
  - problem: "An online draw must be both unpredictable beforehand and verifiable afterwards: nobody may anticipate the result, yet anyone must be able to prove it was not rigged. Plain server-side randomness is a black box — the player has to take the organiser’s word for it."
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
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
