---
slug: "luckydraw"
order: 3
title: "Online Lottery Platform"
featured: false
context: "Client engagement — consumer platform"
role: "Full-stack design & development"
hook: "Online prize draws whose fairness is proven, not just promised."
intro: "A consumer platform to run and play prize draws, where participant trust rested entirely on the transparency of the process."
objectives:
  - "Guarantee fair and verifiable draws"
  - "Make campaigns simple to operate for the organiser"
  - "Track participation and ticket sales"
challenge: "An online draw is only worth anything if its fairness is verifiable: without a guarantee of integrity, trust collapses — while it still has to stay simple to operate."
solution: "A platform where users create accounts, buy tickets and follow their history, backed by a secure random-generation engine that guarantees draw integrity, operated from a full back-office."
architecture: "A Node.js API in TypeScript drives the game logic, backed by a MongoDB store for draws, tickets and entries. The Vue.js frontend serves both the player area and the back-office. Docker containerisation and continuous integration with Travis CI."
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
access: "private"
---

