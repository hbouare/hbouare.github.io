---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Personal project — consumer platform"
hook: "Online prize draws whose fairness is proven, not just promised."

status: "Functional · 6 phases delivered"
cover: "/projects/luckydraw/architecture-en.svg"

intro: "A consumer prize-draw platform where trust rests on proof, not promises. Players create an account, buy tickets and follow their history; every draw runs on a verifiable engine (provably-fair commit-reveal), operated from a full back-office: campaigns, results, analytics."
architecture: "A single Node.js API serves two audiences with opposite requirements: the player area, where draw integrity must be out of reach, and the back-office, where the organiser configures rules, schedule and prizes. The draw lives server-side only, backed by MongoDB for campaigns, tickets and entries, and by Redis for caching and multi-instance rate-limiting. Inputs pass a double validation barrier — Zod at the HTTP edge, Mongoose at persistence — and monetary amounts are stored as integer cents."

highlights:
  - "Provably-fair draw (commit-reveal), replayable and verifiable by the player"
  - "Configurable campaigns (rules, schedule, prizes)"
  - "Ticket purchase and participation history"
  - "Back-office: results, transactions, analytics, exports"
tags: ["Node.js","Express","TypeScript","Vue 3","MongoDB","Redis","Docker","Travis CI"]
---
