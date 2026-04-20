import type { StrategyEducation } from '../lib/strategies';

type ExplanationPanelProps = {
  education: StrategyEducation;
};

const blocks: Array<{ key: keyof StrategyEducation; title: string }> = [
  { key: 'whatItDoes', title: 'What this strategy does' },
  { key: 'whySelected', title: 'Why it ranks here' },
  { key: 'mainRisks', title: 'What could go wrong' },
  { key: 'bestFor', title: 'Best fit user' },
];

export default function ExplanationPanel({ education }: ExplanationPanelProps) {
  return (
    <section className="strategist-panel bg-white p-5 md:p-6">
      <div className="mb-5 space-y-2">
        <p className="strategist-kicker text-brand-blue">Decision context</p>
        <h2 className="text-2xl font-semibold text-brand-ink">Plain-English readout</h2>
      </div>
      <div className="grid gap-4">
        {blocks.map((block) => (
          <article key={block.key} className="rounded-2xl border border-brand-line/70 bg-brand-canvas/80 p-4">
            <h3 className="text-base font-semibold text-brand-ink">{block.title}</h3>
            <p className="mt-2 text-sm leading-6 strategist-quiet">{education[block.key]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
