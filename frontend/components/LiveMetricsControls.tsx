export default function LiveMetricsControls() {
  return (
    <section className="strategist-panel bg-white p-5 md:p-6">
      <div className="space-y-2">
        <p className="strategist-kicker text-brand-blue">Live simulation</p>
        <h2 className="text-2xl font-semibold text-brand-ink">Adjust the assumptions, keep the narrative stable.</h2>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-brand-ink">Horizon</span>
          <select className="strategist-select" defaultValue="90d">
            <option>30d</option>
            <option>90d</option>
            <option>180d</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-brand-ink">Market rate shift</span>
          <input className="strategist-input" defaultValue="Base case" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-brand-ink">Risk posture</span>
          <select className="strategist-select" defaultValue="Balanced">
            <option>Conservative</option>
            <option>Balanced</option>
            <option>Aggressive</option>
          </select>
        </label>
      </div>
    </section>
  );
}
