import type { StrategyScenario } from '../lib/strategies';

type SimulationTableProps = {
  scenarios: StrategyScenario[];
};

export default function SimulationTable({ scenarios }: SimulationTableProps) {
  return (
    <section className="strategist-panel bg-white p-5 md:p-6">
      <div className="mb-4 space-y-2">
        <p className="strategist-kicker text-brand-blue">Outcome curve</p>
        <h2 className="text-2xl font-semibold text-brand-ink">Projected path over time</h2>
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
            {scenarios.map((scenario) => (
              <tr key={scenario.label}>
                <td className="font-medium text-brand-ink">{scenario.label}</td>
                <td className="font-semibold text-brand-green">{scenario.projectedReturn}</td>
                <td>{scenario.yieldBand}</td>
                <td className="strategist-quiet">{scenario.keyAssumption}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
