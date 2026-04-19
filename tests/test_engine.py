from decimal import Decimal
from pathlib import Path
import unittest

from backend.engine import ValidationError, apply_live_metrics, load_seed_strategies, score_strategy, simulate
from backend.service import inspect_strategy, list_strategies


ROOT = Path(__file__).resolve().parents[1]


class EngineTests(unittest.TestCase):
    def test_seed_loads_and_scores(self):
        strategies = load_seed_strategies(ROOT / "data" / "seed_strategies.json")
        self.assertGreaterEqual(len(strategies), 2)
        score = score_strategy(strategies[0])
        self.assertGreater(score, Decimal("0"))

    def test_simulation_requires_bounds(self):
        strategy = load_seed_strategies(ROOT / "data" / "seed_strategies.json")[0]
        with self.assertRaises(ValidationError):
            simulate(strategy, Decimal("1"))

    def test_list_and_inspect(self):
        feed = list_strategies(risk="low", chain="bsc")
        self.assertGreaterEqual(len(feed), 1)

        result = inspect_strategy(feed[0]["id"], Decimal("1000"))
        self.assertIn("simulation", result)
        self.assertEqual(len(result["simulation"]), 3)

    def test_live_metrics_override_seed_values(self):
        strategy = load_seed_strategies(ROOT / "data" / "seed_strategies.json")[0]
        original_score = score_strategy(strategy)
        updated = apply_live_metrics(strategy, {"base_apy": "0.15", "reward_apr": "0.03"})
        updated_score = score_strategy(updated)
        self.assertGreater(updated_score, original_score)

    def test_service_uses_live_metrics(self):
        base = inspect_strategy("venus-usdt-lend", Decimal("1000"))
        boosted = inspect_strategy(
            "venus-usdt-lend",
            Decimal("1000"),
            live_metrics={"base_apy": "0.2", "reward_apr": "0.1"},
        )
        self.assertGreater(Decimal(boosted["score"]), Decimal(base["score"]))


if __name__ == "__main__":
    unittest.main()
