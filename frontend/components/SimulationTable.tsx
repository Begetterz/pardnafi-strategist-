import type { InspectSimulationScenario, StrategyHorizon } from '../lib/api';

type SimulationTableProps = {
  scenarios: InspectSimulationScenario[];
  activeHorizon: StrategyHorizon;
  isRefreshing?: boolean;
};

function secondaryRangeLabel(scenario: InspectSimulationScenario) {
  const rows = [
    scenario.best_case ? `Best ${scenario.best_case}` : null,
    scenario.base_case ? `Base ${scenario.base_case}` : null,
    scenario.stress_case ? `Stress ${scenario.stress_case}` : null,
  ].filter(Boolean);

  return rows.join(' · ');
}

export default function SimulationTable({ scenarios, activeHorizon, isRefreshing = false }: SimulationTableProps) {
  return (
    <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
      <div className="mb-4 space-y-2">
        <p className="strategist-kicker text-brand-blue">Outcome curve</p>
        <h2 className="text-2xl font-semibold text-brand-ink">Projected path over time</h2>
        <p className="text-sm strategist-quiet">
          The selected horizon is highlighted. Values remain estimates and update whenever the inspect assumptions change.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="strategist-table">
          <thead>
            <tr>
              <th>Horizon</th>
              <th>Projected return</th>
              <th>Yield band</th>
              <th>Key assumption</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((scenario) => {
              const isActive = scenario.horizon === activeHorizon;
              return (
                <tr key={scenario.horizon} className={isActive ? 'strategist-table-row-active' : undefined}>
                  <td className="font-medium text-brand-ink">{scenario.horizon}d</td>
                  <td>
                    <div className="font-semibold text-brand-green">{scenario.projected_return}</div>
                    {secondaryRangeLabel(scenario) ? <div className="mt-1 text-xs strategist-quiet">{secondaryRangeLabel(scenario)}</div> : null}
                  </td>
                  <td>{scenario.yield_band ?? 'Not provided'}</td>
                  <td className="strategist-quiet">{scenario.key_assumption ?? 'Backend did not return an explicit assumption.'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isRefreshing ? <p className="mt-4 text-sm strategist-quiet">Refreshing the selected scenario from the backend…</p> : null}
    </section>
  );
}
