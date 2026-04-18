# Frontend Scaffold

This frontend scaffold is designed for the PardnaFi Strategist hackathon MVP.

## Design direction

The UI follows the PardnaFi brand direction:
- primary blue: `#0047AB`
- accent green: `#28A745`
- white-first surfaces
- clean fintech layout
- dashboard-first information hierarchy

## Target UX

The interface should feel like:
- a financial decision tool
- not a trading terminal
- not a generic crypto dashboard

## Primary screens

- dashboard strategy feed
- strategy inspect page
- my strategies page

## Core components

- `TopNav`
- `HeroStats`
- `StrategyCard`
- `StrategyList`
- `SimulationTable`
- `ExplanationPanel`
- `RiskBadge`
- `CopyStrategyButton`

## Integration notes

Codex should wire this scaffold to:
- backend strategy feed
- inspect payload from backend service
- wallet connector
- `StrategyRegistry.sol`

## UI principles

- show risk clearly
- show simulation before action
- keep primary actions obvious
- avoid noisy charts unless needed
- use disclaimers where outcomes are shown
