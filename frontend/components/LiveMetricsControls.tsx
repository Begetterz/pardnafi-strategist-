import type { StrategyHorizon } from '../lib/api';

type LiveMetricsControlsProps = {
  selectedHorizon: StrategyHorizon;
  liveMetrics: Record<string, number>;
  onHorizonChange: (horizon: StrategyHorizon) => void;
  onMetricChange: (key: string, value: number) => void;
  isRefreshing: boolean;
  refreshError?: string | null;
};

const HORIZONS: StrategyHorizon[] = [30, 90, 180];

function humanizeMetricKey(metricKey: string) {
  return metricKey
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function LiveMetricsControls({
  selectedHorizon,
  liveMetrics,
  onHorizonChange,
  onMetricChange,
  isRefreshing,
  refreshError,
}: LiveMetricsControlsProps) {
  const metricEntries = Object.entries(liveMetrics);

  return (
    <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="strategist-kicker text-brand-blue">Simulation controls</p>
          <h2 className="text-2xl font-semibold text-brand-ink">Refresh the evaluated outcome without leaving inspect.</h2>
          <p className="text-sm strategist-quiet">
            Horizon changes and live metrics refetch the backend inspect payload. Copy stays disabled until the refreshed state is back.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {HORIZONS.map((horizon) => (
            <button
              key={horizon}
              type="button"
              className={selectedHorizon === horizon ? 'strategist-button-secondary' : 'strategist-button-ghost'}
              onClick={() => onHorizonChange(horizon)}
            >
              {horizon} day
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 strategist-metrics-layout">
        {metricEntries.length > 0 ? (
          metricEntries.map(([key, value]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-medium text-brand-ink">{humanizeMetricKey(key)}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className="strategist-input"
                value={Number.isFinite(value) ? value : 0}
                onChange={(event) => onMetricChange(key, Number.parseFloat(event.target.value || '0'))}
              />
            </label>
          ))
        ) : (
          <div className="strategist-empty-state">
            <p className="text-sm font-medium text-brand-ink">No live metric overrides are present in the current inspect payload.</p>
            <p className="mt-1 text-sm strategist-quiet">The strategy can still be copied, but there are no backend-exposed inputs to tune yet.</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm strategist-quiet">
        <span>{isRefreshing ? 'Refreshing evaluated state…' : 'Simulation is synced with the latest applied backend state.'}</span>
        {refreshError ? <span className="text-brand-red">{refreshError}</span> : null}
      </div>
    </section>
  );
}
