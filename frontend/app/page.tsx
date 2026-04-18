import StrategyList from "../components/StrategyList";
import HeroStats from "../components/HeroStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <HeroStats />
        <StrategyList />
      </div>
    </main>
  );
}
