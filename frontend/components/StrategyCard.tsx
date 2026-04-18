export default function StrategyCard({ strategy }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#0047AB]">
            {strategy.name}
          </h3>
          <p className="text-sm text-gray-500">{strategy.protocol}</p>
        </div>
        <div className="text-right">
          <p className="text-green-600 font-semibold">
            {strategy.apy}%
          </p>
          <p className="text-xs text-gray-400">Net APY</p>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs px-2 py-1 rounded bg-gray-100">
          {strategy.chain}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600">
          {strategy.risk}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="bg-[#0047AB] text-white px-3 py-2 rounded">
          Inspect
        </button>
        <button className="bg-gray-200 px-3 py-2 rounded">
          Copy Strategy
        </button>
      </div>
    </div>
  );
}
