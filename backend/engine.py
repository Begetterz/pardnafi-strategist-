"""Deterministic strategy engine for the PardnaFi MVP.

Security-focused patterns used here:
- strict input validation and bounded numeric ranges
- deterministic, side-effect-free simulation
- explicit disclosure strings to avoid promise language
"""

from __future__ import annotations

from dataclasses import dataclass, replace
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
import json
from typing import Literal


Risk = Literal["low", "medium", "high"]


class ValidationError(ValueError):
    """Raised when user-controlled inputs fail validation."""


@dataclass(frozen=True)
class Strategy:
    id: str
    name: str
    protocol: str
    chain: str
    category: str
    asset: str
    base_apy: Decimal
    reward_apr: Decimal
    fee_drag: Decimal
    reward_haircut: Decimal
    lockup_days: int
    complexity: Decimal
    il_exposure: Decimal
    liquidity_depth: Decimal
    risk_level: Risk


@dataclass(frozen=True)
class Projection:
    days: int
    best_case: Decimal
    base_case: Decimal
    stress_case: Decimal


def _to_decimal(value: float | str, *, min_value: Decimal, max_value: Decimal, field: str) -> Decimal:
    dec = Decimal(str(value))
    if dec < min_value or dec > max_value:
        raise ValidationError(f"{field} out of range: {dec}")
    return dec


def load_seed_strategies(path: str | Path) -> list[Strategy]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    strategies: list[Strategy] = []

    for row in data:
        strategies.append(
            Strategy(
                id=row["id"],
                name=row["name"],
                protocol=row["protocol"],
                chain=row["chain"],
                category=row["category"],
                asset=row["asset"],
                base_apy=_to_decimal(row["base_apy"], min_value=Decimal("0"), max_value=Decimal("2"), field="base_apy"),
                reward_apr=_to_decimal(row["reward_apr"], min_value=Decimal("0"), max_value=Decimal("2"), field="reward_apr"),
                fee_drag=_to_decimal(row["fee_drag"], min_value=Decimal("0"), max_value=Decimal("1"), field="fee_drag"),
                reward_haircut=_to_decimal(row["reward_haircut"], min_value=Decimal("0"), max_value=Decimal("1"), field="reward_haircut"),
                lockup_days=int(row["lockup_days"]),
                complexity=_to_decimal(row["complexity"], min_value=Decimal("0"), max_value=Decimal("1"), field="complexity"),
                il_exposure=_to_decimal(row["il_exposure"], min_value=Decimal("0"), max_value=Decimal("1"), field="il_exposure"),
                liquidity_depth=_to_decimal(row["liquidity_depth"], min_value=Decimal("0"), max_value=Decimal("1"), field="liquidity_depth"),
                risk_level=row["risk_level"],
            )
        )

    return strategies


def score_strategy(strategy: Strategy) -> Decimal:
    base_yield = strategy.base_apy
    reward_bonus = strategy.reward_apr * (Decimal("1") - strategy.reward_haircut)
    risk_penalty = strategy.il_exposure * Decimal("0.03")
    complexity_penalty = strategy.complexity * Decimal("0.02")
    liquidity_penalty = (Decimal("1") - strategy.liquidity_depth) * Decimal("0.02")

    score = base_yield + reward_bonus - risk_penalty - complexity_penalty - liquidity_penalty
    return score.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)


def _validate_deposit(deposit_usd: Decimal) -> None:
    if deposit_usd < Decimal("10") or deposit_usd > Decimal("10000000"):
        raise ValidationError("deposit must be between 10 and 10,000,000")


def _effective_apy(strategy: Strategy) -> Decimal:
    return strategy.base_apy + strategy.reward_apr * (Decimal("1") - strategy.reward_haircut) - strategy.fee_drag


def _simulate_for_days(deposit_usd: Decimal, days: int, apy: Decimal, drift: Decimal) -> Decimal:
    daily = (apy + drift) / Decimal("365")
    result = deposit_usd * (Decimal("1") + daily) ** Decimal(days)
    return result.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def simulate(strategy: Strategy, deposit_usd: Decimal) -> list[Projection]:
    _validate_deposit(deposit_usd)

    apy = _effective_apy(strategy)
    horizons = [30, 90, 180]
    return [
        Projection(
            days=days,
            best_case=_simulate_for_days(deposit_usd, days, apy, Decimal("0.02")),
            base_case=_simulate_for_days(deposit_usd, days, apy, Decimal("0")),
            stress_case=_simulate_for_days(deposit_usd, days, apy, Decimal("-0.025")),
        )
        for days in horizons
    ]


def explain(strategy: Strategy, score: Decimal) -> dict[str, str]:
    return {
        "what_this_does": (
            f"This strategy allocates into {strategy.protocol} on {strategy.chain} using {strategy.asset} "
            f"to target yield from base lending/fees plus incentives."
        ),
        "why_selected": (
            f"It was selected because its transparent score is {score}, driven by net yield after "
            "fees, reward haircut assumptions, and complexity/risk penalties."
        ),
        "main_risks": (
            "Yields can change quickly, rewards can decay, and protocol smart-contract risk remains. "
            "These are estimates only and not guaranteed returns."
        ),
        "best_for": "Users seeking simple, non-custodial strategy ideas with clear risk disclosures.",
    }


def apply_live_metrics(strategy: Strategy, live_metrics: dict[str, float | str | int] | None) -> Strategy:
    if not live_metrics:
        return strategy

    updates: dict[str, Decimal | int] = {}

    if "base_apy" in live_metrics:
        updates["base_apy"] = _to_decimal(
            live_metrics["base_apy"], min_value=Decimal("0"), max_value=Decimal("2"), field="base_apy"
        )
    if "reward_apr" in live_metrics:
        updates["reward_apr"] = _to_decimal(
            live_metrics["reward_apr"], min_value=Decimal("0"), max_value=Decimal("2"), field="reward_apr"
        )
    if "fee_drag" in live_metrics:
        updates["fee_drag"] = _to_decimal(
            live_metrics["fee_drag"], min_value=Decimal("0"), max_value=Decimal("1"), field="fee_drag"
        )
    if "reward_haircut" in live_metrics:
        updates["reward_haircut"] = _to_decimal(
            live_metrics["reward_haircut"], min_value=Decimal("0"), max_value=Decimal("1"), field="reward_haircut"
        )
    if "complexity" in live_metrics:
        updates["complexity"] = _to_decimal(
            live_metrics["complexity"], min_value=Decimal("0"), max_value=Decimal("1"), field="complexity"
        )
    if "il_exposure" in live_metrics:
        updates["il_exposure"] = _to_decimal(
            live_metrics["il_exposure"], min_value=Decimal("0"), max_value=Decimal("1"), field="il_exposure"
        )
    if "liquidity_depth" in live_metrics:
        updates["liquidity_depth"] = _to_decimal(
            live_metrics["liquidity_depth"], min_value=Decimal("0"), max_value=Decimal("1"), field="liquidity_depth"
        )
    if "lockup_days" in live_metrics:
        lockup_days = int(live_metrics["lockup_days"])
        if lockup_days < 0 or lockup_days > 3650:
            raise ValidationError("lockup_days must be between 0 and 3650")
        updates["lockup_days"] = lockup_days

    return replace(strategy, **updates)
