# StrategyRegistry Deployment

This workspace deploys the `StrategyRegistry` contract used by the strategist frontend's Copy Strategy proof flow.

## What this contract does

- stores lightweight published strategy metadata
- emits explorer-visible `StrategyPublished` events
- emits explorer-visible `StrategyCopied` events
- does not custody funds
- does not move assets
- does not execute strategies

## Important constraint

A fresh `StrategyRegistry` cannot accept `copyStrategy(strategyId)` until at least one strategy has been published.

That means the real order is:

1. deploy registry
2. publish at least one strategy
3. make backend inspect payload return the matching `registry_id`
4. configure frontend env with deployed registry address
5. test Copy Strategy with a real wallet

## Setup

```bash
cd contracts
cp .env.example .env
npm install
```

Fill `.env` with a funded testnet key and the correct RPC URL.

## Compile

```bash
npm run compile
```

## Deploy

BNB Chain testnet:

```bash
npm run deploy:bsc
```

opBNB testnet:

```bash
npm run deploy:opbnb
```

The deploy script prints the contract address plus the frontend env block:

```env
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_REGISTRY_NETWORK=BSC
```

## Publish a sample strategy

After deployment, set `REGISTRY_ADDRESS` in `.env`, then run:

```bash
npm run publish:bsc
```

or

```bash
npm run publish:opbnb
```

The script prints the new `strategyId`. Your backend inspect API must return that value as `registry_id` for the matching strategy.

## Verify on explorer

BNB Chain testnet:

```bash
npm run verify:bsc -- 0xYourRegistryAddress
```

opBNB testnet:

```bash
npm run verify:opbnb -- 0xYourRegistryAddress
```

## Frontend env

The strategist frontend needs:

```env
STRATEGIST_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_REGISTRY_ADDRESS=0xYourRegistryAddress
NEXT_PUBLIC_REGISTRY_NETWORK=BSC
```

Deployment alone is not enough. The inspect route also requires a live backend API because the copy flow is locked to backend payloads.
