# PardnaFi Strategist SRS (Hackathon MVP)

## 1. System Overview

PardnaFi Strategist is an AI powered DeFi strategy discovery system.

It enables users to:
- discover yield strategies
- simulate outcomes
- understand risk
- inspect strategy breakdowns
- copy strategies into their own dashboard

The system integrates with BNB Chain testnet for verifiable interactions.

## 2. Functional Requirements

### 2.1 Strategy Feed

The system must:
- display a list of AI generated strategies
- include protocol, chain, APY, risk, and score
- allow filtering by risk and chain

### 2.2 Strategy Inspection

The system must:
- display strategy details
- show simulation results
- show AI explanation blocks
- show risk indicators

### 2.3 Simulation Engine

The system must:
- accept deposit amount input
- generate 30, 90, and 180 day projections
- display best, base, and stress scenarios

### 2.4 AI Explanation Layer

The system must:
- generate plain English explanations
- include:
  - what the strategy does
  - why it was selected
  - main risks
  - best use case

### 2.5 Copy Strategy

The system must:
- allow user to click "Copy Strategy"
- store strategy locally or in app state
- trigger onchain interaction via contract

### 2.6 Wallet Integration

The system must:
- allow wallet connection
- support testnet transactions
- display transaction status

### 2.7 Onchain Registry

The system must:
- deploy StrategyRegistry contract
- allow strategy publication
- allow copyStrategy interaction
- emit events

## 3. Non Functional Requirements

### Performance
- dashboard loads under 3 seconds
- simulation returns within 1 second

### Usability
- user can copy strategy in under 3 clicks
- UI must be understandable without explanation

### Security
- no private key storage
- all writes require wallet confirmation
- no custodial logic in MVP

### Reliability
- fallback to seed data if API fails

## 4. Acceptance Criteria

- user can view strategies
- user can inspect strategy details
- user can view simulation results
- user can understand explanation output
- user can click copy strategy
- onchain transaction is triggered
- contract events are visible on explorer

## 5. Deployment Requirements

- contract deployed to BNB testnet or opBNB
- contract verified on explorer
- at least 2 successful transactions

## 6. Constraints

- must be buildable in 1 day
- must be open source
- must be demoable in under 2 minutes

## 7. Future Extensions

- execution layer for strategies
- portfolio tracking
- alerts and notifications
- advanced scoring models
