import type { StrategyExplanationBlock } from '../lib/api';

type ExplanationPanelProps = {
  blocks: StrategyExplanationBlock[];
  assumptions?: string[];
};

function toneClass(tone?: StrategyExplanationBlock['tone']) {
  if (tone === 'positive') return 'strategist-explanation strategist-explanation-positive';
  if (tone === 'caution') return 'strategist-explanation strategist-explanation-caution';
  if (tone === 'danger') return 'strategist-explanation strategist-explanation-danger';
  return 'strategist-explanation';
}

export default function ExplanationPanel({ blocks, assumptions = [] }: ExplanationPanelProps) {
  return (
    <section className="strategist-panel strategist-panel-contrast p-5 md:p-6">
      <div className="mb-5 space-y-2">
        <p className="strategist-kicker text-brand-blue">Decision context</p>
        <h2 className="text-2xl font-semibold text-brand-ink">Plain-English readout</h2>
      </div>
      <div className="grid gap-4">
        {blocks.map((block) => (
          <article key={block.id} className={toneClass(block.tone)}>
            <h3 className="text-base font-semibold text-brand-ink">{block.title}</h3>
            <p className="mt-2 text-sm leading-6 strategist-quiet">{block.body}</p>
          </article>
        ))}
      </div>
      {assumptions.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-brand-line/70 bg-brand-surface/84 p-4">
          <h3 className="text-base font-semibold text-brand-ink">Assumptions and inputs</h3>
          <ul className="mt-3 strategist-bullet-list text-sm strategist-quiet">
            {assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
