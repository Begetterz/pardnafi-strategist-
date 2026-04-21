'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { strategies, type Strategy } from '../lib/strategies';
import StrategyCard from './StrategyCard';

type RiskStance = {
  value: number;
  id: 'conservative' | 'balanced' | 'aggressive';
  label: string;
  summary: string;
  accent: string;
  tint: string;
  glow: string;
  fill: string;
};

const RISK_STANCES: RiskStance[] = [
  {
    value: 0,
    id: 'conservative',
    label: 'Conservative',
    summary: 'Blue-first view. Keep the rail limited to lower-volatility sleeves.',
    accent: '#0f4fb8',
    tint: 'rgba(15, 79, 184, 0.12)',
    glow: 'rgba(15, 79, 184, 0.24)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(86, 137, 225, 0.9) 100%)',
  },
  {
    value: 1,
    id: 'balanced',
    label: 'Balanced',
    summary: 'Warm the mix slightly. Keep stable sleeves leading while allowing selective upside.',
    accent: '#b76a37',
    tint: 'rgba(183, 106, 55, 0.13)',
    glow: 'rgba(183, 106, 55, 0.24)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(191, 110, 63, 0.9) 66%, rgba(225, 153, 112, 0.86) 100%)',
  },
  {
    value: 2,
    id: 'aggressive',
    label: 'Aggressive',
    summary: 'Push hotter sleeves to the front. Use when upside matters more than calm sequencing.',
    accent: '#b83a33',
    tint: 'rgba(184, 58, 51, 0.12)',
    glow: 'rgba(184, 58, 51, 0.25)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(184, 58, 51, 0.92) 62%, rgba(120, 27, 29, 0.96) 100%)',
  },
];

const RISK_WEIGHT: Record<Strategy['risk'], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
};

function rankStrategies(entries: Strategy[], stance: RiskStance['id']) {
  if (stance === 'conservative') {
    return entries.filter((strategy) => strategy.risk === 'Low');
  }

  if (stance === 'aggressive') {
    return [...entries].sort((left, right) => {
      const riskDelta = RISK_WEIGHT[right.risk] - RISK_WEIGHT[left.risk];
      if (riskDelta !== 0) {
        return riskDelta;
      }

      return right.expectedNetApy - left.expectedNetApy;
    });
  }

  return entries;
}

export default function StrategyList() {
  const [riskValue, setRiskValue] = useState(1);
  const activeStance = RISK_STANCES[riskValue] ?? RISK_STANCES[1];
  const rankedStrategies = useMemo(() => rankStrategies(strategies, activeStance.id), [activeStance.id]);
  const [spotlight, ...remaining] = rankedStrategies;
  const secondary = remaining.slice(0, 2);
  const compact = remaining.slice(2);
  const riskControlStyle = {
    '--risk-accent': activeStance.accent,
    '--risk-tint': activeStance.tint,
    '--risk-glow': activeStance.glow,
    '--risk-progress': `${(riskValue / (RISK_STANCES.length - 1)) * 100}%`,
    '--risk-fill': activeStance.fill,
  } as CSSProperties;

  return (
    <section className="strategist-stack">
      <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="strategist-kicker text-brand-blue">Opportunity rail</p>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-ink md:text-3xl">Ranked for readability first, upside second.</h2>
            <p className="max-w-2xl text-base strategist-quiet">This feed is built for quick inspection. Stable positions lead, higher-volatility sleeves sit behind them.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_minmax(320px,1.35fr)_auto_auto]">
            <button className="strategist-button-secondary">All chains</button>
            <div className="strategist-risk-rail" style={riskControlStyle}>
              <div className="strategist-risk-head">
                <div>
                  <p className="strategist-kicker strategist-risk-kicker">Risk stance</p>
                  <p className="strategist-risk-summary">{activeStance.summary}</p>
                </div>
                <span className="strategist-risk-state">{activeStance.label}</span>
              </div>
              <div className="strategist-risk-slider-shell">
                <div className="strategist-risk-slider-track" aria-hidden="true" />
                <div className="strategist-risk-slider-fill" aria-hidden="true" />
                <input
                  type="range"
                  min="0"
                  max={RISK_STANCES.length - 1}
                  step="1"
                  value={riskValue}
                  onChange={(event) => setRiskValue(Number(event.target.value))}
                  className="strategist-risk-slider"
                  aria-label="Risk stance"
                />
              </div>
              <div className="strategist-risk-legend" aria-hidden="true">
                {RISK_STANCES.map((stance) => (
                  <span
                    key={stance.id}
                    className={stance.id === activeStance.id ? 'strategist-risk-legend-item strategist-risk-legend-item-active' : 'strategist-risk-legend-item'}
                  >
                    {stance.label}
                  </span>
                ))}
              </div>
            </div>
            <button className="strategist-button-ghost">90 day horizon</button>
            <button className="strategist-button-ghost">Sort: best fit</button>
          </div>
        </div>
      </div>
      {spotlight ? <StrategyCard strategy={spotlight} emphasis="spotlight" /> : null}
      {secondary.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {secondary.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} emphasis="secondary" />
          ))}
        </div>
      ) : null}
      {compact.length > 0 ? (
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
      ) : null}
    </section>
  );
}
