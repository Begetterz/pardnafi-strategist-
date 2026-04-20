export type StrategyRisk = 'Low' | 'Medium' | 'High';

export type StrategyScenario = {
  label: '30d' | '90d' | '180d';
  projectedReturn: string;
  yieldBand: string;
  keyAssumption: string;
};

export type StrategyEducation = {
  whatItDoes: string;
  whySelected: string;
  mainRisks: string;
  bestFor: string;
};

export type Strategy = {
  id: string;
  name: string;
  protocol: string;
  chain: 'BSC' | 'opBNB';
  assets: string[];
  expectedNetApy: number;
  risk: StrategyRisk;
  verdict: string;
  whyNow: string;
  highlightLabel?: string;
  scenarios: StrategyScenario[];
  education: StrategyEducation;
};

export const strategies: Strategy[] = [
  {
    id: 'venus-usdt-stability',
    name: 'Stable Lending Strategy',
    protocol: 'Venus',
    chain: 'BSC',
    assets: ['USDT', 'USDC'],
    expectedNetApy: 8.2,
    risk: 'Low',
    verdict: 'Best for stable capital that needs clarity more than excitement.',
    whyNow: 'Rates remain competitive without introducing LP impermanent-loss exposure.',
    highlightLabel: 'Anchor Position',
    scenarios: [
      { label: '30d', projectedReturn: '+0.67%', yieldBand: '6.8% - 8.9%', keyAssumption: 'Base lending demand stays steady on BSC stablecoin pools.' },
      { label: '90d', projectedReturn: '+2.18%', yieldBand: '6.2% - 8.4%', keyAssumption: 'Incentive emissions soften slightly but utilization remains healthy.' },
      { label: '180d', projectedReturn: '+4.44%', yieldBand: '5.8% - 7.9%', keyAssumption: 'The strategy compounds modestly without requiring rotation.' }
    ],
    education: {
      whatItDoes: 'Supplies stablecoins into a lending market and earns base yield with lower operational overhead than active farming.',
      whySelected: 'It ranks highly on consistency, readability, and downside control for savings-led users.',
      mainRisks: 'Rates can compress, incentive schedules can change, and protocol smart-contract exposure remains.',
      bestFor: 'Users who want a clear BNB Chain savings strategy with minimal moving parts.'
    }
  },
  {
    id: 'pancakeswap-opbnb-lp',
    name: 'Stable LP Farming',
    protocol: 'PancakeSwap',
    chain: 'opBNB',
    assets: ['USDT', 'WBNB'],
    expectedNetApy: 14.5,
    risk: 'Medium',
    verdict: 'Higher upside, but the user must accept path dependency and reward volatility.',
    whyNow: 'opBNB routing remains attractive while fee flows and incentive emissions stay elevated.',
    highlightLabel: 'Yield Lift',
    scenarios: [
      { label: '30d', projectedReturn: '+1.11%', yieldBand: '11.2% - 16.8%', keyAssumption: 'Swap volume stays above recent weekly average and the pair retains emissions.' },
      { label: '90d', projectedReturn: '+3.76%', yieldBand: '10.4% - 15.3%', keyAssumption: 'Reward rates taper slightly while price dispersion remains manageable.' },
      { label: '180d', projectedReturn: '+7.58%', yieldBand: '9.1% - 13.8%', keyAssumption: 'Fee generation offsets moderate impermanent-loss drag over time.' }
    ],
    education: {
      whatItDoes: 'Pairs capital into a liquid farming venue to earn trading fees and rewards rather than just lending yield.',
      whySelected: 'The strategy provides stronger projected returns when the user can tolerate more moving variables.',
      mainRisks: 'Impermanent loss, emissions decay, and faster changes in route profitability.',
      bestFor: 'Users who can monitor conditions and want yield above plain stable lending.'
    }
  },
  {
    id: 'kinza-stable-barbell',
    name: 'Stablecoin Barbell',
    protocol: 'Kinza Finance',
    chain: 'BSC',
    assets: ['FDUSD', 'USDT'],
    expectedNetApy: 10.4,
    risk: 'Low',
    verdict: 'A steadier middle ground for users who want more than simple lending without going full LP.',
    whyNow: 'Good diversification against a single venue while keeping the strategy readable for newer users.',
    highlightLabel: 'Balanced',
    scenarios: [
      { label: '30d', projectedReturn: '+0.84%', yieldBand: '8.1% - 10.9%', keyAssumption: 'Stablecoin borrow demand remains broad across the split venues.' },
      { label: '90d', projectedReturn: '+2.69%', yieldBand: '7.8% - 10.2%', keyAssumption: 'One venue softens slightly, but the blended position preserves income.' },
      { label: '180d', projectedReturn: '+5.49%', yieldBand: '7.4% - 9.8%', keyAssumption: 'Rebalancing stays minimal while stablecoin demand stays resilient.' }
    ],
    education: {
      whatItDoes: 'Splits stablecoin capital across lending sleeves to reduce single-protocol dependence.',
      whySelected: 'It offers a cleaner risk-return compromise for users moving up from simple vault saving.',
      mainRisks: 'Multi-venue exposure still inherits protocol risk and can dilute best-case upside.',
      bestFor: 'Users who want diversification with low operational burden.'
    }
  },
  {
    id: 'lista-bnb-yield',
    name: 'BNB Carry Sleeve',
    protocol: 'Lista DAO',
    chain: 'BSC',
    assets: ['BNB', 'slisBNB'],
    expectedNetApy: 11.8,
    risk: 'Medium',
    verdict: 'Useful when the user already holds BNB and wants yield without fully exiting the asset.',
    whyNow: 'BNB-denominated yield remains attractive if the user wants native-chain positioning.',
    scenarios: [
      { label: '30d', projectedReturn: '+0.92%', yieldBand: '9.7% - 13.6%', keyAssumption: 'Liquid staking spread holds and BNB volatility stays inside recent range.' },
      { label: '90d', projectedReturn: '+3.02%', yieldBand: '8.9% - 12.7%', keyAssumption: 'Carry remains healthy without severe BNB drawdown pressure.' },
      { label: '180d', projectedReturn: '+6.08%', yieldBand: '8.4% - 12.1%', keyAssumption: 'The user accepts BNB exposure as part of the strategy thesis.' }
    ],
    education: {
      whatItDoes: 'Uses BNB-native positions to earn yield while preserving exposure to the base asset.',
      whySelected: 'It is attractive for BNB-native users but should not be framed as stable savings.',
      mainRisks: 'Underlying BNB price moves matter more than with stablecoin strategies.',
      bestFor: 'Users already comfortable holding BNB and seeking productive carry.'
    }
  }
];

export function getStrategyById(id: string) {
  return strategies.find((strategy) => strategy.id === id);
}
