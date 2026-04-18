# Claw Bot Build Instructions

## Objective

Build PardnaFi Strategist MVP for BNB hackathon.

Focus on:
- AI strategy discovery
- simulation
- education
- inspect UI
- copy strategy
- onchain registry interaction

## Rules

- prioritize working demo over completeness
- do not implement custodial logic
- do not attempt full execution layer
- use seeded data if APIs slow down

## Tasks

### Frontend
- build strategy dashboard
- build strategy inspect page
- add simulation display
- add explanation blocks
- add copy strategy button

### Backend
- create strategy seed data
- implement scoring
- implement simulation function
- implement explanation generator (template or AI)

### Contracts
- deploy StrategyRegistry.sol
- verify on testnet
- connect frontend to contract

### Wallet
- connect wallet
- trigger copyStrategy
- show tx status

## Demo target

- user sees strategies
- user inspects one
- user sees simulation and explanation
- user clicks copy strategy
- tx is visible on explorer

## Important

If conflict between perfection and demo clarity:
choose demo clarity
