export default function HeroStats() {
  return (
    <div className="bg-[#0047AB] text-white rounded-xl p-6">
      <h2 className="text-2xl font-bold">AI Strategy Engine</h2>
      <p className="text-sm opacity-80">Understand. Simulate. Decide.</p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div>
          <p className="text-lg font-semibold">12</p>
          <p className="text-xs">Strategies Found</p>
        </div>
        <div>
          <p className="text-lg font-semibold">6% - 15%</p>
          <p className="text-xs">Yield Range</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Balanced</p>
          <p className="text-xs">Risk Mix</p>
        </div>
      </div>
    </div>
  );
}
