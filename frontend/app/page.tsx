import HeroStats from '../components/HeroStats';
import StrategyList from '../components/StrategyList';

export default function Home() {
  return (
    <main className="min-h-screen text-brand-ink">
      <div className="strategist-shell strategist-stack">
        <HeroStats />
        <StrategyList />
      </div>
    </main>
  );
}
