export default function HeroStats() {
  return (
    <section className="strategist-panel strategist-hero strategist-hero-entry p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_360px] lg:items-end">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="strategist-kicker">PardnaFi Strategist</p>
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
                Understand BNB Chain outcomes before capital leaves the wallet.
              </h1>
              <p className="max-w-2xl text-base text-white/80 md:text-lg">
                Hunt yield, simulate 30 / 90 / 180 day paths, and inspect the tradeoffs in plain English.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="strategist-proof">Built for BNB Chain decision-making</span>
            <span className="strategist-proof">BSC + opBNB strategy coverage</span>
          </div>
        </div>
        <aside className="strategist-panel border border-white/15 bg-white/10 p-5 shadow-none backdrop-blur-sm">
          <p className="strategist-kicker text-white/70">Market state</p>
          <div className="strategist-metric-grid mt-4 md:grid-cols-1">
            <div className="strategist-metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Strategies live</p>
              <p className="strategist-stat-value mt-2">12</p>
              <p className="mt-2 text-sm text-white/72">Curated for BSC and opBNB opportunity scanning.</p>
            </div>
            <div className="strategist-metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Yield band</p>
              <p className="strategist-stat-value mt-2">6% - 15%</p>
              <p className="mt-2 text-sm text-white/72">Wide enough to compare stability against higher-risk sleeves.</p>
            </div>
            <div className="strategist-metric-tile">
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Current mix</p>
              <p className="strategist-stat-value mt-2">Balanced</p>
              <p className="mt-2 text-sm text-white/72">The feed favors readable risk before aggressive upside.</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
