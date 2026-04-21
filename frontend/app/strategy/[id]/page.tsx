import Link from 'next/link';
import StrategyInspectPanel from '../../../components/strategist/StrategyInspectPanel';
import { fetchRemoteInspectStrategy } from '../../../lib/api';

type StrategyInspectPageProps = {
  params: {
    id: string;
  };
};

export default async function StrategyInspectPage({ params }: StrategyInspectPageProps) {
  try {
    const inspectPayload = await fetchRemoteInspectStrategy(params.id);

    return (
      <main className="min-h-screen text-brand-ink">
        <StrategyInspectPanel initialInspect={inspectPayload} />
      </main>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load strategy inspect data.';

    return (
      <main className="min-h-screen text-brand-ink">
        <div className="strategist-shell">
          <section className="strategist-panel strategist-panel-contrast p-8 md:p-10">
            <Link href="/" className="strategist-hero-nav strategist-hero-nav-dark">
              <span aria-hidden="true">←</span>
              <span>Back to strategy feed</span>
            </Link>
            <p className="mt-6 strategist-kicker text-brand-blue">Inspect unavailable</p>
            <h1 className="mt-2 text-3xl font-semibold text-brand-ink md:text-4xl">
              Backend inspect data is required before this strategy can be copied.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 strategist-quiet">
              This route is intentionally locked to the backend payload so the copy flow never invents registry IDs, assumptions, or simulation data from local seed content.
            </p>
            <p className="mt-4 text-sm text-brand-red">{message}</p>
          </section>
        </div>
      </main>
    );
  }
}
