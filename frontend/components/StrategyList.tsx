import StrategyCard from "./StrategyCard";

const mockStrategies = [
  {
    name: "Stable Lending Strategy",
    protocol: "Venus",
    apy: 8.2,
    chain: "BSC",
    risk: "Low",
  },
  {
    name: "Stable LP Farming",
    protocol: "PancakeSwap",
    apy: 14.5,
    chain: "opBNB",
    risk: "Medium",
  },
];

export default function StrategyList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {mockStrategies.map((strategy, index) => (
        <StrategyCard key={index} strategy={strategy} />
      ))}
    </div>
  );
}
