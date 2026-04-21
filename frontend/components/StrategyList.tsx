'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import { strategies, type Strategy } from '../lib/strategies';
import StrategyCard from './StrategyCard';

type ControlTone = {
  accent: string;
  tint: string;
  glow: string;
  fill: string;
};

type SliderOption<Value extends string | number> = {
  value: Value;
  label: string;
  summary: string;
};

type RiskValue = 'conservative' | 'balanced' | 'aggressive';
type ChainValue = 'all' | 'BSC' | 'opBNB';
type SortValue = 'best-fit' | 'highest-yield' | 'lowest-risk';
type HorizonValue = 30 | 90 | 180;

type SliderControlProps<Value extends string | number> = {
  title: string;
  ariaLabel: string;
  options: SliderOption<Value>[];
  selectedIndex: number;
  onChange: (index: number) => void;
  tone: ControlTone;
  variant?: 'default' | 'risk';
};

const COOL_BLUE_TONE: ControlTone = {
  accent: '#0f4fb8',
  tint: 'rgba(15, 79, 184, 0.12)',
  glow: 'rgba(15, 79, 184, 0.2)',
  fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.94) 0%, rgba(87, 137, 225, 0.88) 100%)',
};

const RISK_TONES: Record<RiskValue, ControlTone> = {
  conservative: {
    accent: '#0f4fb8',
    tint: 'rgba(15, 79, 184, 0.12)',
    glow: 'rgba(15, 79, 184, 0.24)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(86, 137, 225, 0.9) 100%)',
  },
  balanced: {
    accent: '#b76a37',
    tint: 'rgba(183, 106, 55, 0.13)',
    glow: 'rgba(183, 106, 55, 0.24)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(191, 110, 63, 0.9) 66%, rgba(225, 153, 112, 0.86) 100%)',
  },
  aggressive: {
    accent: '#b83a33',
    tint: 'rgba(184, 58, 51, 0.12)',
    glow: 'rgba(184, 58, 51, 0.25)',
    fill: 'linear-gradient(90deg, rgba(15, 79, 184, 0.96) 0%, rgba(184, 58, 51, 0.92) 62%, rgba(120, 27, 29, 0.96) 100%)',
  },
};

const CHAIN_OPTIONS: SliderOption<ChainValue>[] = [
  {
    value: 'all',
    label: 'All chains',
    summary: 'Keep BSC and opBNB opportunities in the same decision rail.',
  },
  {
    value: 'BSC',
    label: 'BSC only',
    summary: 'Limit the rail to native BSC strategies and keep the stack tighter.',
  },
  {
    value: 'opBNB',
    label: 'opBNB only',
    summary: 'Focus the rail on opBNB routes when speed and lower-cost sleeves matter.',
  },
];

const HORIZON_OPTIONS: SliderOption<HorizonValue>[] = [
  {
    value: 30,
    label: '30 day',
    summary: 'Bias the ranking toward near-term outcomes and tighter readbacks.',
  },
  {
    value: 90,
    label: '90 day',
    summary: 'Use the middle horizon for the main comparison pass across the rail.',
  },
  {
    value: 180,
    label: '180 day',
    summary: 'Stretch the ranking toward longer compounding paths and slower rotations.',
  },
];

const RISK_OPTIONS: SliderOption<RiskValue>[] = [
  {
    value: 'conservative',
    label: 'Conservative',
    summary: 'Blue-first view. Keep the rail limited to lower-volatility sleeves.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    summary: 'Warm the mix slightly. Keep stable sleeves leading while allowing selective upside.',
  },
  {
    value: 'aggressive',
    label: 'Aggressive',
    summary: 'Push hotter sleeves to the front. Use when upside matters more than calm sequencing.',
  },
];

const SORT_OPTIONS: SliderOption<SortValue>[] = [
  {
    value: 'best-fit',
    label: 'Best fit',
    summary: 'Keep the editorial ordering centered on readability and product judgment.',
  },
  {
    value: 'highest-yield',
    label: 'Highest yield',
    summary: 'Promote the strongest projected return at the selected horizon.',
  },
  {
    value: 'lowest-risk',
    label: 'Lowest risk',
    summary: 'Pull the calmest sleeves forward before chasing extra yield.',
  },
];

const RISK_WEIGHT: Record<Strategy['risk'], number> = {
  Low: 0,
  Medium: 1,
  High: 2,
};

function parseProjectedReturn(value: string) {
  return Number.parseFloat(value.replace(/[^0-9.-]/g, ''));
}

function projectedReturnForHorizon(strategy: Strategy, horizon: HorizonValue) {
  const scenario = strategy.scenarios.find((entry) => Number.parseInt(entry.label, 10) === horizon);
  return scenario ? parseProjectedReturn(scenario.projectedReturn) : strategy.expectedNetApy;
}

function applyChainFilter(entries: Strategy[], chain: ChainValue) {
  if (chain === 'all') {
    return entries;
  }

  return entries.filter((strategy) => strategy.chain === chain);
}

function applyRiskStance(entries: Strategy[], stance: RiskValue, horizon: HorizonValue) {
  if (stance === 'conservative') {
    return entries.filter((strategy) => strategy.risk === 'Low');
  }

  if (stance === 'aggressive') {
    return [...entries].sort((left, right) => {
      const riskDelta = RISK_WEIGHT[right.risk] - RISK_WEIGHT[left.risk];
      if (riskDelta !== 0) {
        return riskDelta;
      }

      return projectedReturnForHorizon(right, horizon) - projectedReturnForHorizon(left, horizon);
    });
  }

  return entries;
}

function applySort(entries: Strategy[], sort: SortValue, horizon: HorizonValue) {
  if (sort === 'best-fit') {
    return entries;
  }

  if (sort === 'highest-yield') {
    return [...entries].sort((left, right) => projectedReturnForHorizon(right, horizon) - projectedReturnForHorizon(left, horizon));
  }

  return [...entries].sort((left, right) => {
    const riskDelta = RISK_WEIGHT[left.risk] - RISK_WEIGHT[right.risk];
    if (riskDelta !== 0) {
      return riskDelta;
    }

    return projectedReturnForHorizon(right, horizon) - projectedReturnForHorizon(left, horizon);
  });
}

function controlRailStyle(tone: ControlTone, selectedIndex: number, total: number) {
  return {
    '--control-accent': tone.accent,
    '--control-tint': tone.tint,
    '--control-glow': tone.glow,
    '--control-progress': `${total <= 1 ? 100 : (selectedIndex / (total - 1)) * 100}%`,
    '--control-fill': tone.fill,
  } as CSSProperties;
}

function SliderControl<Value extends string | number>({
  title,
  ariaLabel,
  options,
  selectedIndex,
  onChange,
  tone,
  variant = 'default',
}: SliderControlProps<Value>) {
  const activeOption = options[selectedIndex] ?? options[0];
  const controlStyle = controlRailStyle(tone, selectedIndex, options.length);

  return (
    <div className={variant === 'risk' ? 'strategist-control-rail strategist-control-rail-risk' : 'strategist-control-rail'} style={controlStyle}>
      <div className="strategist-control-head">
        <div>
          <p className="strategist-kicker strategist-control-kicker">{title}</p>
          <p className="strategist-control-summary">{activeOption.summary}</p>
        </div>
        <span className="strategist-control-state">{activeOption.label}</span>
      </div>
      <div className="strategist-control-slider-shell">
        <div className="strategist-control-slider-track" aria-hidden="true" />
        <div className="strategist-control-slider-fill" aria-hidden="true" />
        <input
          type="range"
          min="0"
          max={options.length - 1}
          step="1"
          value={selectedIndex}
          onChange={(event) => onChange(Number(event.target.value))}
          className="strategist-control-slider"
          aria-label={ariaLabel}
        />
      </div>
      <div className="strategist-control-legend" aria-hidden="true">
        {options.map((option, index) => (
          <span
            key={String(option.value)}
            className={index === selectedIndex ? 'strategist-control-legend-item strategist-control-legend-item-active' : 'strategist-control-legend-item'}
          >
            {option.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StrategyList() {
  const [chainIndex, setChainIndex] = useState(0);
  const [horizonIndex, setHorizonIndex] = useState(1);
  const [riskIndex, setRiskIndex] = useState(1);
  const [sortIndex, setSortIndex] = useState(0);

  const activeChain = CHAIN_OPTIONS[chainIndex] ?? CHAIN_OPTIONS[0];
  const activeHorizon = HORIZON_OPTIONS[horizonIndex] ?? HORIZON_OPTIONS[1];
  const activeRisk = RISK_OPTIONS[riskIndex] ?? RISK_OPTIONS[1];
  const activeSort = SORT_OPTIONS[sortIndex] ?? SORT_OPTIONS[0];

  const rankedStrategies = useMemo(() => {
    const byChain = applyChainFilter(strategies, activeChain.value);
    const byRisk = applyRiskStance(byChain, activeRisk.value, activeHorizon.value);
    return applySort(byRisk, activeSort.value, activeHorizon.value);
  }, [activeChain.value, activeHorizon.value, activeRisk.value, activeSort.value]);

  const [spotlight, ...remaining] = rankedStrategies;
  const secondary = remaining.slice(0, 2);
  const compact = remaining.slice(2);

  return (
    <section className="strategist-stack">
      <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="strategist-kicker text-brand-blue">Opportunity rail</p>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-ink md:text-3xl">Ranked for readability first, upside second.</h2>
            <p className="max-w-2xl text-base strategist-quiet">This feed is built for quick inspection. Stable positions lead, higher-volatility sleeves sit behind them.</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            <SliderControl
              title="Chain"
              ariaLabel="Chain"
              options={CHAIN_OPTIONS}
              selectedIndex={chainIndex}
              onChange={setChainIndex}
              tone={COOL_BLUE_TONE}
            />
            <SliderControl
              title="Horizon"
              ariaLabel="Horizon"
              options={HORIZON_OPTIONS}
              selectedIndex={horizonIndex}
              onChange={setHorizonIndex}
              tone={COOL_BLUE_TONE}
            />
            <SliderControl
              title="Risk"
              ariaLabel="Risk"
              options={RISK_OPTIONS}
              selectedIndex={riskIndex}
              onChange={setRiskIndex}
              tone={RISK_TONES[activeRisk.value]}
              variant="risk"
            />
            <SliderControl
              title="Sort"
              ariaLabel="Sort"
              options={SORT_OPTIONS}
              selectedIndex={sortIndex}
              onChange={setSortIndex}
              tone={COOL_BLUE_TONE}
            />
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
      {rankedStrategies.length === 0 ? (
        <div className="strategist-panel strategist-panel-contrast p-6 md:p-7">
          <p className="strategist-kicker text-brand-blue">No match</p>
          <h3 className="mt-2 text-2xl font-semibold text-brand-ink">The current control rail leaves no visible strategies.</h3>
          <p className="mt-3 max-w-2xl text-base strategist-quiet">Shift chain or risk back toward the center and the opportunity rail will reopen immediately.</p>
        </div>
      ) : null}
    </section>
  );
}
