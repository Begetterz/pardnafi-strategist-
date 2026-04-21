import Link from 'next/link';
import type { Strategy } from '../lib/strategies';

type StrategyCardProps = {
  strategy: Strategy;
  emphasis?: 'spotlight' | 'secondary' | 'compact';
};

function riskClass(risk: Strategy['risk']) {
  if (risk === 'Low') return 'strategist-badge strategist-badge-positive';
  if (risk === 'Medium') return 'strategist-badge strategist-badge-caution';
  return 'strategist-badge strategist-badge-danger';
}

export default function StrategyCard({ strategy, emphasis = 'compact' }: StrategyCardProps) {
  const isSpotlight = emphasis === 'spotlight';

  return (
    <article className={['strategist-panel strategist-opportunity p-5', isSpotlight ? 'strategist-panel-spotlight text-white shadow-strategist' : 'strategist-panel-contrast text-brand-ink'].join(' ')}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {strategy.highlightLabel ? (
              <span className={isSpotlight ? 'strategist-badge bg-white/12 text-white' : 'strategist-badge strategist-badge-neutral'}>{strategy.highlightLabel}</span>
            ) : null}
            <span className={isSpotlight ? 'strategist-badge bg-white/12 text-white/90' : 'strategist-badge strategist-badge-neutral'}>{strategy.protocol}</span>
            <span className={riskClass(strategy.risk)}>{strategy.risk} risk</span>
          </div>
          <div>
            <h2 className={isSpotlight ? 'text-3xl font-semibold tracking-tight' : 'text-2xl font-semibold tracking-tight text-brand-blue'}>{strategy.name}</h2>
            <p className={isSpotlight ? 'mt-2 max-w-2xl text-base text-white/74' : 'mt-2 max-w-2xl text-base strategist-quiet'}>{strategy.verdict}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className={isSpotlight ? 'strategist-badge bg-white/12 text-white/92' : 'strategist-badge strategist-badge-neutral'}>{strategy.chain}</span>
            {strategy.assets.map((asset) => (
              <span key={asset} className={isSpotlight ? 'strategist-badge bg-white/12 text-white/92' : 'strategist-badge strategist-badge-neutral'}>{asset}</span>
            ))}
          </div>
        </div>
        <div className="min-w-[180px] space-y-3 md:text-right">
          <div>
            <p className={isSpotlight ? 'text-sm uppercase tracking-[0.18em] text-white/55' : 'text-sm uppercase tracking-[0.18em] strategist-quiet'}>Expected APY</p>
            <p className={isSpotlight ? 'mt-1 text-4xl font-semibold text-white' : 'mt-1 text-4xl font-semibold text-brand-green'}>{strategy.expectedNetApy}%</p>
          </div>
          <p className={isSpotlight ? 'text-sm text-white/68' : 'text-sm strategist-quiet'}>{strategy.whyNow}</p>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href={`/strategy/${strategy.id}`} className={isSpotlight ? 'strategist-button-ghost' : 'strategist-button'}>
              Inspect
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
