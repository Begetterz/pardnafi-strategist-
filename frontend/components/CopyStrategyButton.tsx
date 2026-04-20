type CopyStrategyButtonProps = {
  strategyId: string;
};

export default function CopyStrategyButton({ strategyId }: CopyStrategyButtonProps) {
  return (
    <div className="strategist-panel bg-white p-5">
      <p className="strategist-kicker text-brand-blue">Deferred action</p>
      <h2 className="mt-2 text-xl font-semibold text-brand-ink">Copy strategy will land after the UI pass.</h2>
      <p className="mt-3 text-sm leading-6 strategist-quiet">Strategy copy and onchain proof are intentionally deferred in this branch. The current goal is a clean hackathon-grade inspect workflow.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="strategist-button-secondary" disabled>
          Copy strategy later
        </button>
        <span className="strategist-badge strategist-badge-neutral">ID: {strategyId}</span>
      </div>
    </div>
  );
}
