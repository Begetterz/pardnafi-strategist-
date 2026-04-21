'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import CopyStrategyButton from '../CopyStrategyButton';
import ExplanationPanel from '../ExplanationPanel';
import LiveMetricsControls from '../LiveMetricsControls';
import SimulationTable from '../SimulationTable';
import type { InspectResponse, StrategyHorizon } from '../../lib/api';
import { fetchInspectStrategy } from '../../lib/api';

const REFRESH_DELAY_MS = 320;

function riskClass(risk: string) {
  const normalizedRisk = risk.trim().toLowerCase();
  if (normalizedRisk.includes('low')) return 'strategist-badge strategist-badge-positive';
  if (normalizedRisk.includes('medium')) return 'strategist-badge strategist-badge-caution';
  if (normalizedRisk.includes('high')) return 'strategist-badge strategist-badge-danger';
  return 'strategist-badge strategist-badge-neutral';
}

function createQueryKey(horizon: StrategyHorizon, liveMetrics: Record<string, number>) {
  return JSON.stringify({
    horizon,
    liveMetrics: Object.entries(liveMetrics).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)),
  });
}

export default function StrategyInspectPanel({ initialInspect }: { initialInspect: InspectResponse }) {
  const [inspect, setInspect] = useState(initialInspect);
  const [selectedHorizon, setSelectedHorizon] = useState<StrategyHorizon>(initialInspect.selected_horizon);
  const [liveMetrics, setLiveMetrics] = useState<Record<string, number>>(initialInspect.selected_live_metrics);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const initialQueryKey = useMemo(
    () => createQueryKey(initialInspect.selected_horizon, initialInspect.selected_live_metrics),
    [initialInspect.selected_horizon, initialInspect.selected_live_metrics],
  );
  const [appliedQueryKey, setAppliedQueryKey] = useState(initialQueryKey);
  const [attemptedQueryKey, setAttemptedQueryKey] = useState(initialQueryKey);

  const currentQueryKey = useMemo(() => createQueryKey(selectedHorizon, liveMetrics), [selectedHorizon, liveMetrics]);

  useEffect(() => {
    if (currentQueryKey === attemptedQueryKey) {
      return;
    }

    setAttemptedQueryKey(currentQueryKey);

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsRefreshing(true);

      try {
        const nextInspect = await fetchInspectStrategy(inspect.strategy_id, {
          selectedHorizon,
          liveMetrics,
        });

        if (cancelled) {
          return;
        }

        setInspect(nextInspect);
        setSelectedHorizon(nextInspect.selected_horizon);
        setLiveMetrics(nextInspect.selected_live_metrics);
        const nextQueryKey = createQueryKey(nextInspect.selected_horizon, nextInspect.selected_live_metrics);
        setAppliedQueryKey(nextQueryKey);
        setAttemptedQueryKey(nextQueryKey);
        setRefreshError(null);
      } catch (error) {
        if (!cancelled) {
          setRefreshError(error instanceof Error ? error.message : 'Unable to refresh inspect data.');
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false);
        }
      }
    }, REFRESH_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [attemptedQueryKey, currentQueryKey, inspect.strategy_id, liveMetrics, selectedHorizon]);

  const currentScenario =
    inspect.simulation.scenarios.find((scenario) => scenario.horizon === inspect.selected_horizon) ??
    inspect.simulation.scenarios[0];

  const copyDisabled = isRefreshing || currentQueryKey !== appliedQueryKey;
  const copyDisabledReason = copyDisabled
    ? 'Wait for the backend to return the latest evaluated state before recording the copy.'
    : null;

  return (
    <div className="strategist-shell strategist-stack">
      <section className="strategist-panel strategist-hero strategist-hero-entry p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link href="/" className="strategist-hero-nav">
              <span aria-hidden="true">←</span>
              <span>Back to strategy feed</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <span className="strategist-proof">{inspect.protocol}</span>
              <span className="strategist-proof">{inspect.network}</span>
              <span className={riskClass(inspect.current_risk_level)}>{inspect.current_risk_level}</span>
            </div>
            <div>
              <p className="strategist-kicker">Inspect strategy</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{inspect.strategy_name}</h1>
              <p className="mt-3 max-w-3xl text-base text-white/76 md:text-lg">
                Review the evaluated path, tune the live metrics, then copy the decision state only when the refreshed backend payload is current.
              </p>
            </div>
          </div>
          <div className="strategist-panel strategist-panel-hero-side p-5 backdrop-blur-sm lg:max-w-sm">
            <p className="strategist-kicker strategist-hero-side-copy-muted">Current read</p>
            <p className="mt-3 text-4xl font-semibold text-white">{inspect.expected_return}</p>
            <p className="mt-3 text-sm strategist-hero-side-copy">
              {currentScenario?.key_assumption ?? 'The backend did not return a primary assumption for the selected horizon.'}
            </p>
          </div>
        </div>
      </section>

      <div className="strategist-grid-2">
        <section className="strategist-stack">
          <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="strategist-kicker text-brand-blue">Outcome story</p>
                <h2 className="mt-1 text-2xl font-semibold text-brand-ink md:text-3xl">What the current backend evaluation says over 30, 90, and 180 days.</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {inspect.simulation.scenarios.map((scenario) => (
                  <span
                    key={scenario.horizon}
                    className={scenario.horizon === inspect.selected_horizon ? 'strategist-button-secondary' : 'strategist-button-ghost'}
                  >
                    {scenario.horizon}d
                  </span>
                ))}
              </div>
            </div>
          </div>

          <LiveMetricsControls
            selectedHorizon={selectedHorizon}
            liveMetrics={liveMetrics}
            onHorizonChange={setSelectedHorizon}
            onMetricChange={(key, value) => {
              setLiveMetrics((current) => ({
                ...current,
                [key]: Number.isFinite(value) ? value : 0,
              }));
            }}
            isRefreshing={isRefreshing}
            refreshError={refreshError}
          />

          <SimulationTable
            scenarios={inspect.simulation.scenarios}
            activeHorizon={inspect.selected_horizon}
            isRefreshing={isRefreshing}
          />

          <ExplanationPanel blocks={inspect.explanation} assumptions={inspect.assumptions} />
        </section>

        <aside className="strategist-stack strategist-sticky">
          <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
            <p className="strategist-kicker text-brand-blue">Strategy summary</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm strategist-quiet">Expected return at selected horizon</p>
                <p className="mt-1 text-4xl font-semibold text-brand-green">{inspect.expected_return}</p>
              </div>
              <dl className="strategist-detail-grid text-sm">
                <div>
                  <dt className="strategist-quiet">Protocol</dt>
                  <dd className="mt-1 font-medium text-brand-ink">{inspect.protocol}</dd>
                </div>
                <div>
                  <dt className="strategist-quiet">Network</dt>
                  <dd className="mt-1 font-medium text-brand-ink">{inspect.network}</dd>
                </div>
                <div>
                  <dt className="strategist-quiet">Registry ID</dt>
                  <dd className="mt-1 font-medium text-brand-ink">{inspect.registry_id}</dd>
                </div>
                <div>
                  <dt className="strategist-quiet">Assets</dt>
                  <dd className="mt-1 font-medium text-brand-ink">{inspect.assets.length > 0 ? inspect.assets.join(', ') : 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
            <p className="strategist-kicker text-brand-blue">Risk focus</p>
            <h2 className="mt-2 text-xl font-semibold text-brand-ink">Watch the assumptions, not just the return line.</h2>
            <p className="mt-3 text-sm leading-6 strategist-quiet">
              {inspect.explanation.find((block) => block.id === 'what-could-go-wrong')?.body ??
                'Risk detail is carried by the backend explanation blocks and current live assumptions.'}
            </p>
          </section>

          <CopyStrategyButton inspect={inspect} disabled={copyDisabled} disabledReason={copyDisabledReason} />
        </aside>
      </div>
    </div>
  );
}
