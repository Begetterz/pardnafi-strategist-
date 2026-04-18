import SimulationTable from "../../../components/SimulationTable";
import ExplanationPanel from "../../../components/ExplanationPanel";
import LiveMetricsControls from "../../../components/LiveMetricsControls";
import CopyStrategyButton from "../../../components/CopyStrategyButton";

const strategy = {
  id: "venus-usdt",
  name: "Stable Lending Strategy",
  protocol: "Venus",
  chain: "BSC",
  assets: ["USDT"],
  expectedNetApy: 8.2,
  risk: "Low",
  simulation: {
    thirtyDays: { best: 10.8, base: 9.6, stress: 6.3 },
    ninetyDays: { best: 33.4, base: 28.2, stress: 18.4 },
    oneEightyDays: { best: 69.2, base: 58.7, stress: 38.1 },
  },
  education: {
    whatItDoes: "Supplies stablecoins into a lending market to earn base yield and incentive rewards.",
    whySelected: "Lower complexity and steadier profile than LP farming, with a solid risk-adjusted score.",
    mainRisks: "Rates can fall, incentives can change, and protocol smart contract risk remains.",
    bestFor: "Users who want a simpler savings-oriented DeFi strategy rather than aggressive farming.",
  },
};

export default function StrategyInspectPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm text-gray-500">{strategy.protocol} · {strategy.chain}</p>
              <h1 className="text-3xl font-bold text-[#0047AB] mt-1">{strategy.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                {strategy.assets.map((asset) => (
                  <span key={asset} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {asset}
                  </span>
                ))}
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                  {strategy.risk} Risk
                </span>
              </div>
            </div>

            <div className="bg-[#F8FAFF] border border-[#D7E4FF] rounded-2xl p-4 min-w-[220px]">
              <p className="text-sm text-gray-500">Expected Net APY</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{strategy.expectedNetApy}%</p>
              <p className="text-xs text-gray-500 mt-2">
                Simulation only. Not financial advice. Rates may change.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <LiveMetricsControls />
            <SimulationTable simulation={strategy.simulation} />
            <ExplanationPanel education={strategy.education} />
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold text-[#0047AB]">Strategy Summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Protocol</dt>
                  <dd className="font-medium">{strategy.protocol}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Chain</dt>
                  <dd className="font-medium">{strategy.chain}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Assets</dt>
                  <dd className="font-medium">{strategy.assets.join(", ")}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Risk</dt>
                  <dd className="font-medium">{strategy.risk}</dd>
                </div>
              </dl>
            </div>

            <CopyStrategyButton strategyId={1} />
          </div>
        </div>
      </div>
    </main>
  );
}
