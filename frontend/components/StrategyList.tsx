import { strategies } from '../lib/strategies';
import StrategyCard from './StrategyCard';

export default function StrategyList() {
  const [spotlight, ...remaining] = strategies;
  const secondary = remaining.slice(0, 2);
  const compact = remaining.slice(2);

  return (
    <section className="strategist-stack">
      <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="strategist-kicker text-brand-blue">Opportunity rail</p>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-ink md:text-3xl">Ranked for readability first, upside second.</h2>
            <p className="max-w-2xl text-base strategist-quiet">This feed is built for quick inspection. Stable positions lead, higher-volatility sleeves sit behind them.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button className="strategist-button-secondary">All chains</button>
            <button className="strategist-button-ghost">90 day horizon</button>
            <button className="strategist-button-ghost">Balanced risk</button>
            <button className="strategist-button-ghost">Sort: best fit</button>
          </div>
        </div>
      </div>
      <StrategyCard strategy={spotlight} emphasis="spotlight" />
      <div className="grid gap-4 lg:grid-cols-2">
        {secondary.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} emphasis="secondary" />
        ))}
      </div>
      <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="strategist-kicker text-brand-blue">Remaining strategies</p>
            <h3 className="mt-1 text-xl font-semibold text-brand-ink">Compact comparison set</h3>
          </div>
        </div>
        <div className="strategist-list">
          {compact.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} emphasis="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
