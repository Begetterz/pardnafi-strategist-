# PardnaFi Strategist

AI powered DeFi strategist for BNB Chain.

PardnaFi Strategist hunts yield opportunities, simulates outcomes, explains risk in plain English, and lets users inspect and copy strategies.

## Core flow

hunt -> simulate -> educate -> inspect -> copy strategy

## Why this exists

DeFi is powerful, but most users do not have time to constantly track farming, lending, and reward opportunities across BSC and opBNB.

PardnaFi Strategist gives users an AI layer that:
- discovers opportunities
- scores them
- simulates outcomes
- explains what is happening
- stores strategies on a dashboard
- lets users copy the strategy into their own strategy board

## Hackathon scope

This repository is the public build for the BNB hackathon MVP.

The MVP focuses on:
- strategy discovery for BSC and opBNB
- simulation engine
- educational explainers
- inspect strategy dashboard
- copy strategy action
- onchain strategy registry

## Product positioning

PardnaFi Strategist is not a custodial asset manager.
It is an AI decision layer for users who want clearer DeFi savings and yield opportunities.

## Repo structure

- `/docs` architecture, SRS, hackathon plan, build guides
- `/frontend` dashboard app
- `/backend` strategy engine and APIs
- `/contracts` onchain registry
- `/data` seeded protocol and strategy data for MVP

## Brand principles

This build follows the PardnaFi principles:
- radical truth
- radical transparency
- relentless reality testing
- codify everything
- users trust above all

## Build target

Simple enough to demo in under 2 minutes.
Strong enough to prove a real product direction.
Open enough for contributors to extend.

## Current MVP implementation

- Deterministic backend strategy engine in `backend/engine.py`.
- Runtime market metric overrides are supported so scoring/simulation is not locked to static seed APY values.
- Service facade for strategy feed and inspect views in `backend/service.py`.
- Lightweight backend HTTP API in `backend/api_server.py` exposing `/strategies` and `/inspect` for frontend wiring.
- Seeded strategy data in `data/seed_strategies.json`.
- Unit tests for loading, scoring, simulation bounds, and inspect flow in `tests/test_engine.py`.

## Local run (frontend + backend API)

1. Start backend API:
   - `python -m backend.api_server`
2. Start frontend:
   - `cd frontend && npm install && npm run dev`
3. Optional env vars for frontend:
   - `NEXT_PUBLIC_API_BASE=http://localhost:8000`
   - `NEXT_PUBLIC_REGISTRY_ADDRESS=<deployed_strategy_registry_address>`
