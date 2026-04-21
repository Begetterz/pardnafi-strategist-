import Link from 'next/link';
import CopyStrategyButton from '../../../components/CopyStrategyButton';
import ExplanationPanel from '../../../components/ExplanationPanel';
import LiveMetricsControls from '../../../components/LiveMetricsControls';
import SimulationTable from '../../../components/SimulationTable';
import { getStrategyById } from '../../../lib/strategies';

type StrategyInspectPageProps = {
  params: {
    id: string;
  };
};

function riskClass(risk: 'Low' | 'Medium' | 'High') {
  if (risk === 'Low') return 'strategist-badge strategist-badge-positive';
  if (risk === 'Medium') return 'strategist-badge strategist-badge-caution';
  return 'strategist-badge strategist-badge-danger';
}

export default function StrategyInspectPage({ params }: StrategyInspectPageProps) {
  const strategy = getStrategyById(params.id);

  if (!strategy) {
    return (
      <main className="min-h-screen">
        <div className="strategist-shell">
          <section className="strategist-panel bg-white p-8">
            <p className="strategist-kicker text-brand-blue">Not found</p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-ink">The strategy ID does not exist in this local seed.</h1>
          </section>
        </div>
      </main>
    );
  }

  const primaryScenario = strategy.scenarios[1] ?? strategy.scenarios[0];

  return (
    <main className="min-h-screen text-brand-ink">
      <div className="strategist-shell strategist-stack">
        <section className="strategist-panel strategist-hero p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Link href="/" className="strategist-hero-nav">
                <span aria-hidden="true">←</span>
                <span>Back to strategy feed</span>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <span className="strategist-proof">{strategy.protocol}</span>
                <span className="strategist-proof">{strategy.chain}</span>
                <span className={riskClass(strategy.risk)}>{strategy.risk} risk</span>
              </div>
              <div>
                <p className="strategist-kicker">Inspect strategy</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{strategy.name}</h1>
                <p className="mt-3 max-w-3xl text-base text-white/76 md:text-lg">{strategy.verdict}</p>
              </div>
            </div>
            <div className="strategist-panel strategist-panel-hero-side p-5 backdrop-blur-sm lg:max-w-sm">
              <p className="strategist-kicker strategist-hero-side-copy-muted">Current 90d read</p>
              <p className="mt-3 text-4xl font-semibold text-white">{primaryScenario.projectedReturn}</p>
              <p className="mt-3 text-sm strategist-hero-side-copy">{primaryScenario.keyAssumption}</p>
            </div>
          </div>
        </section>
        <div className="strategist-grid-2">
          <section className="strategist-stack">
            <div className="strategist-panel strategist-panel-contrast p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="strategist-kicker text-brand-blue">Outcome story</p>
                  <h2 className="mt-1 text-2xl font-semibold text-brand-ink md:text-3xl">What happens over 30, 90, and 180 days.</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strategy.scenarios.map((scenario) => (
                    <span key={scenario.label} className={scenario.label === primaryScenario.label ? 'strategist-button-secondary' : 'strategist-button-ghost'}>
                      {scenario.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <LiveMetricsControls />
            <SimulationTable scenarios={strategy.scenarios} />
            <ExplanationPanel education={strategy.education} />
          </section>
          <aside className="strategist-stack strategist-sticky">
            <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
              <p className="strategist-kicker text-brand-blue">Strategy summary</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm strategist-quiet">Expected net APY</p>
                  <p className="mt-1 text-4xl font-semibold text-brand-green">{strategy.expectedNetApy}%</p>
                </div>
                <dl className="grid gap-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="strategist-quiet">Protocol</dt>
                    <dd className="font-medium text-brand-ink">{strategy.protocol}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="strategist-quiet">Chain</dt>
                    <dd className="font-medium text-brand-ink">{strategy.chain}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="strategist-quiet">Assets</dt>
                    <dd className="font-medium text-brand-ink">{strategy.assets.join(', ')}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="strategist-quiet">Why now</dt>
                    <dd className="max-w-[220px] text-right font-medium text-brand-ink">{strategy.whyNow}</dd>
                  </div>
                </dl>
              </div>
            </section>
            <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
              <p className="strategist-kicker text-brand-blue">Risk focus</p>
              <h2 className="mt-2 text-xl font-semibold text-brand-ink">Watch the assumptions, not just the APY.</h2>
              <p className="mt-3 text-sm leading-6 strategist-quiet">{strategy.education.mainRisks}</p>
            </section>
            <CopyStrategyButton strategyId={strategy.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
