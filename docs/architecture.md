# PardnaFi Strategist Architecture

## Overview

PardnaFi Strategist is an AI powered DeFi strategy discovery product for BNB Chain.

The system scans supported opportunities on BSC and opBNB, simulates possible outcomes, explains risk and mechanics in plain language, and allows the user to inspect and copy strategies.

For the hackathon MVP, the product is intentionally split into:

- offchain intelligence and UX
- minimal onchain proof and interaction

This gives us a system that is demoable, honest, technically credible, and buildable within one day.

## Core user flow

hunt -> simulate -> educate -> inspect -> copy strategy

1. Hunt
   - The backend discovers supported yield or reward opportunities.
2. Simulate
   - The backend computes projected outcomes for selected deposit amounts and time horizons.
3. Educate
   - The AI explanation layer turns strategy data into plain English guidance.
4. Inspect
   - The frontend renders strategy detail, simulation, risk, and rationale.
5. Copy Strategy
   - The user saves or copies the strategy and an onchain record is created.

## System components

### 1. Frontend

Purpose:
- render strategy feed
- render inspect page
- display simulation and education
- connect wallet
- trigger copy strategy action

Recommended stack:
- Next.js
- TypeScript
- Tailwind CSS
- wagmi + viem

Pages:
- `/` strategy dashboard
- `/strategy/[id]` strategy inspector
- `/my-strategies` copied strategies

### 2. Backend API

Purpose:
- collect protocol data
- normalize strategy objects
- score strategies
- run simulations
- generate educational summaries
- prepare contract interaction payloads

Recommended stack:
- Node.js
- TypeScript
- Next.js API routes or Express

Modules:
- StrategyFetcher
- StrategyScorer
- StrategySimulator
- StrategyExplainer
- RegistryService

### 3. AI Layer

Purpose:
- explain what each strategy does
- explain why it was selected
- explain risk in plain language
- identify who the strategy is best for

The AI layer must be constrained to explanation and education.
It must not claim certainty, guaranteed yield, or personalized investment advice.

### 4. Onchain Layer

Purpose:
- create verifiable strategy publication records
- record copy strategy actions
- emit visible events for the explorer and hackathon judging

Recommended contract:
- `StrategyRegistry.sol`

This contract is intentionally minimal.
It is not a vault, not a custody contract, and not an automated yield router.

### 5. Data Layer

Purpose:
- store seeded strategy data for MVP
- optionally persist copied strategies and activity

Recommended for MVP:
- local JSON or lightweight DB
- fallback seed data if live fetch fails

## Architecture split

### Offchain responsibilities
- protocol scanning
- strategy scoring
- simulation calculations
- educational explanation
- dashboard rendering

### Onchain responsibilities
- strategy publication record
- copy strategy intent record
- explorer-visible events

This split is deliberate.
The product value is mostly offchain intelligence.
The chain value is proof, transparency, and auditable interaction.

## Supported strategy categories for MVP

To stay buildable, the hackathon MVP should support only a few strategy types.

### Stable lending
Example:
- Venus stablecoin supply strategy

Fields:
- protocol
- chain
- asset
- base APY
- reward APR
- estimated net APY
- lockup info
- risk level

### Stable LP or reward farming
Example:
- PancakeSwap stable pair opportunity

Fields:
- protocol
- chain
- asset pair
- fee APR
- reward APR
- estimated net APY
- impermanent loss warning
- risk level

### Baseline hold and earn
Example:
- basic BNB or stable strategy used as a benchmark

## Strategy scoring model

A simple transparent ranking model is enough.

Suggested model:

`score = base_yield + reward_bonus - risk_penalty - complexity_penalty - liquidity_penalty`

Inputs:
- base APY
- reward APR
- volatility profile
- lockup duration
- strategy complexity
- impermanent loss exposure
- liquidity depth

Outputs:
- score
- risk level
- confidence label

## Simulation model

The simulator must be deterministic and understandable.

Inputs:
- deposit amount
- time horizon
- APY
- reward APR
- fee drag
- reward haircut
- compounding assumption

Outputs:
- 30 day estimate
- 90 day estimate
- 180 day estimate
- best case
- base case
- stress case

Important note in UI:
- estimates only
- no guaranteed returns
- rates can change

## Education model

Each strategy should generate four explanation blocks:

- What this strategy does
- Why AI selected it
- Main risks
- Best for

This makes the product useful to non expert users.

## Smart contract architecture

### Contract: StrategyRegistry.sol

Purpose:
- store lightweight strategy metadata
- emit explorer-visible events
- record user copy actions

Core storage:
- strategy id
- strategy hash
- chain id
- protocol name
- expected APY in basis points
- risk score
- publisher address
- timestamp

Core functions:
- `publishStrategy(...)`
- `copyStrategy(strategyId)`
- `getStrategy(strategyId)`

Core events:
- `StrategyPublished`
- `StrategyCopied`

### Why this is the right contract scope

The hackathon rewards real chain integration, but trying to manage live user funds in one day would create too much complexity and risk.

The registry proves that:
- the AI generated strategy output
- the app committed it to chain
- a user copied it
- judges can verify everything on testnet explorer

## Testnet deployment recommendation

Recommended target:
- opBNB testnet or BNB Chain testnet

Selection criteria:
- faster deployment
- lower fees
- easier wallet support
- clearer alignment with challenge requirements

Required deployment outcomes:
- verified contract
- at least two successful transactions
- explorer link ready for submission

## Security principles

This repo should reflect PardnaFi's principles:
- radical truth
- radical transparency
- relentless reality testing
- codify everything
- users trust above all

Implementation security rules:
- no private key storage in repo
- no custodial fund flows in MVP
- all writes require wallet signature
- clear simulation disclaimers
- avoid false certainty in AI output

## Recommended repo layout

```text
README.md
/docs
  architecture.md
  srs.md
  hackathon-plan.md
  clawbot.md
/contracts
  StrategyRegistry.sol
  README.md
/backend
  README.md
/frontend
  README.md
/data
  README.md
```

## Demo architecture summary

The final demo should show:
- AI strategy feed
- inspect page with simulation and education
- copy strategy action
- wallet confirmation
- onchain event visible on explorer

That is enough to prove:
- usability
- technical execution
- BNB chain integration
- real product direction
