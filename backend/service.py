"""Thin service facade representing backend API behavior for MVP."""

from __future__ import annotations

from dataclasses import asdict
from decimal import Decimal
from pathlib import Path

from backend.engine import apply_live_metrics, explain, load_seed_strategies, score_strategy, simulate


ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "data" / "seed_strategies.json"


def list_strategies(
    risk: str | None = None,
    chain: str | None = None,
    live_metrics_by_id: dict[str, dict[str, float | str | int]] | None = None,
) -> list[dict]:
    strategies = load_seed_strategies(SEED)
    live_metrics_by_id = live_metrics_by_id or {}

    if risk:
        strategies = [s for s in strategies if s.risk_level == risk]
    if chain:
        strategies = [s for s in strategies if s.chain.lower() == chain.lower()]

    strategies = [apply_live_metrics(s, live_metrics_by_id.get(s.id)) for s in strategies]
    ranked = sorted(strategies, key=score_strategy, reverse=True)

    return [
        {
            "registry_id": idx + 1,
            "id": s.id,
            "name": s.name,
            "protocol": s.protocol,
            "chain": s.chain,
            "asset": s.asset,
            "base_apy": str(s.base_apy),
            "reward_apr": str(s.reward_apr),
            "category": s.category,
            "risk_level": s.risk_level,
            "score": str(score_strategy(s)),
        }
        for idx, s in enumerate(ranked)
    ]


def inspect_strategy(
    strategy_id: str,
    deposit_usd: Decimal,
    live_metrics: dict[str, float | str | int] | None = None,
) -> dict:
    strategies = load_seed_strategies(SEED)
    lookup = {s.id: s for s in strategies}

    if strategy_id not in lookup:
        raise KeyError(f"unknown strategy_id: {strategy_id}")

    strategy = apply_live_metrics(lookup[strategy_id], live_metrics)
    score = score_strategy(strategy)
    ranked_ids = [row["id"] for row in list_strategies()]
    registry_id = ranked_ids.index(strategy_id) + 1 if strategy_id in ranked_ids else 0

    return {
        "registry_id": registry_id,
        "strategy": asdict(strategy),
        "score": str(score),
        "simulation": [asdict(x) for x in simulate(strategy, deposit_usd)],
        "explanation": explain(strategy, score),
        "disclaimer": "Educational output only. Not investment advice.",
    }
