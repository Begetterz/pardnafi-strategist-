export type StrategyHorizon = 30 | 90 | 180;

export type InspectSimulationScenario = {
  horizon: StrategyHorizon;
  projected_return: string;
  yield_band?: string;
  key_assumption?: string;
  best_case?: string;
  base_case?: string;
  stress_case?: string;
};

export type InspectSimulation = {
  selected_horizon: StrategyHorizon;
  scenarios: InspectSimulationScenario[];
};

export type StrategyExplanationTone = 'neutral' | 'positive' | 'caution' | 'danger';

export type StrategyExplanationBlock = {
  id: string;
  title: string;
  body: string;
  tone?: StrategyExplanationTone;
};

export type InspectResponse = {
  strategy_id: string;
  registry_id: number;
  strategy_name: string;
  protocol: string;
  network: string;
  selected_horizon: StrategyHorizon;
  expected_return: string;
  current_risk_level: string;
  selected_live_metrics: Record<string, number>;
  simulation: InspectSimulation;
  explanation: StrategyExplanationBlock[];
  assumptions: string[];
  assets: string[];
};

export type CopiedStrategySnapshot = {
  id: string;
  strategy_id: string;
  registry_id: number;
  strategy_name: string;
  protocol: string;
  network: string;
  selected_horizon: StrategyHorizon;
  expected_return: string;
  current_risk_level: string;
  selected_live_metrics: Record<string, number>;
  simulation_snapshot: InspectResponse['simulation'];
  explanation_snapshot: InspectResponse['explanation'];
  copied_at: string;
  wallet_address?: string;
  tx_hash?: string;
  onchain_proof_status: 'pending' | 'confirmed' | 'failed';
  onchain_proof_error?: string;
};

export type InspectQueryOptions = {
  selectedHorizon?: StrategyHorizon;
  liveMetrics?: Record<string, number>;
};

const EXPLANATION_FALLBACKS: Array<{
  id: string;
  keys: string[];
  title: string;
  tone?: StrategyExplanationTone;
}> = [
  {
    id: 'what-this-strategy-does',
    keys: ['what_this_strategy_does', 'whatItDoes', 'what_it_does'],
    title: 'What this strategy does',
  },
  {
    id: 'why-it-ranks-here',
    keys: ['why_it_ranks_here', 'whySelected', 'why_selected'],
    title: 'Why it ranks here',
  },
  {
    id: 'what-could-go-wrong',
    keys: ['what_could_go_wrong', 'mainRisks', 'main_risks'],
    title: 'What could go wrong',
    tone: 'caution',
  },
  {
    id: 'best-fit-user',
    keys: ['best_fit_user', 'bestFor', 'best_for'],
    title: 'Best fit user',
    tone: 'positive',
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFirst(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }

  return undefined;
}

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  const value = readFirst(source, keys);

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function readNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  const value = readFirst(source, keys);

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function parseHorizon(value: unknown): StrategyHorizon | undefined {
  if (typeof value === 'number' && (value === 30 || value === 90 || value === 180)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === '30' || trimmed === '30d') return 30;
    if (trimmed === '90' || trimmed === '90d') return 90;
    if (trimmed === '180' || trimmed === '180d') return 180;
  }

  return undefined;
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeLiveMetrics(value: unknown): Record<string, number> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.entries(value).reduce<Record<string, number>>((accumulator, [key, metricValue]) => {
    if (typeof metricValue === 'number' && Number.isFinite(metricValue)) {
      accumulator[key] = metricValue;
      return accumulator;
    }

    if (typeof metricValue === 'string') {
      const parsed = Number.parseFloat(metricValue);
      if (Number.isFinite(parsed)) {
        accumulator[key] = parsed;
      }
    }

    return accumulator;
  }, {});
}

function normalizeScenario(value: unknown): InspectSimulationScenario | null {
  if (!isRecord(value)) {
    return null;
  }

  const horizon = parseHorizon(readFirst(value, ['horizon', 'label', 'selected_horizon']));
  const projectedReturn = readString(value, ['projected_return', 'projectedReturn', 'expected_return', 'expectedReturn']);

  if (!horizon || !projectedReturn) {
    return null;
  }

  return {
    horizon,
    projected_return: projectedReturn,
    yield_band: readString(value, ['yield_band', 'yieldBand']),
    key_assumption: readString(value, ['key_assumption', 'keyAssumption']),
    best_case: readString(value, ['best_case', 'bestCase']),
    base_case: readString(value, ['base_case', 'baseCase']),
    stress_case: readString(value, ['stress_case', 'stressCase']),
  };
}

function normalizeSimulation(value: unknown, selectedHorizon: StrategyHorizon): InspectSimulation {
  const container = isRecord(value) ? value : null;
  const rawScenarios = Array.isArray(value)
    ? value
    : Array.isArray(container?.scenarios)
      ? container.scenarios
      : [];

  const scenarios = rawScenarios
    .map((scenario) => normalizeScenario(scenario))
    .filter((scenario): scenario is InspectSimulationScenario => Boolean(scenario))
    .sort((left, right) => left.horizon - right.horizon);

  if (scenarios.length === 0) {
    throw new Error('Inspect payload is missing simulation scenarios.');
  }

  const fallbackHorizon = scenarios.find((scenario) => scenario.horizon === selectedHorizon)?.horizon ?? scenarios[0].horizon;

  return {
    selected_horizon: fallbackHorizon,
    scenarios,
  };
}

function normalizeExplanation(value: unknown): StrategyExplanationBlock[] {
  if (Array.isArray(value)) {
    const blocks = value
      .map((entry, index) => {
        if (!isRecord(entry)) {
          return null;
        }

        const title = readString(entry, ['title', 'heading']);
        const body = readString(entry, ['body', 'content', 'text']);
        if (!title || !body) {
          return null;
        }

        const tone = readString(entry, ['tone']) as StrategyExplanationTone | undefined;

        return {
          id: readString(entry, ['id']) ?? `block-${index}`,
          title,
          body,
          tone,
        } satisfies StrategyExplanationBlock;
      })
      .filter((block): block is NonNullable<typeof block> => Boolean(block));

    if (blocks.length > 0) {
      return blocks;
    }
  }

  if (!isRecord(value)) {
    throw new Error('Inspect payload is missing explanation content.');
  }

  const blocks = EXPLANATION_FALLBACKS.flatMap((config) => {
    const body = readString(value, config.keys);
    if (!body) {
      return [];
    }

    return [
      {
        id: config.id,
        title: config.title,
        body,
        tone: config.tone,
      } satisfies StrategyExplanationBlock,
    ];
  });

  if (blocks.length === 0) {
    throw new Error('Inspect payload is missing explanation blocks.');
  }

  return blocks;
}

function normalizeAssumptions(root: Record<string, unknown>, explanationValue: unknown): string[] {
  const topLevelAssumptions = parseStringArray(readFirst(root, ['assumptions', 'inputs']));
  if (topLevelAssumptions.length > 0) {
    return topLevelAssumptions;
  }

  if (isRecord(explanationValue)) {
    return parseStringArray(readFirst(explanationValue, ['assumptions', 'inputs']));
  }

  return [];
}

function buildRemoteInspectUrl(strategyId: string, searchParams?: URLSearchParams): string {
  const baseUrl = process.env.STRATEGIST_API_BASE_URL ?? process.env.NEXT_PUBLIC_STRATEGIST_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('STRATEGIST_API_BASE_URL is not configured.');
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const url = new URL(`${normalizedBaseUrl}/strategies/${encodeURIComponent(strategyId)}/inspect`);

  searchParams?.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

export function buildInspectSearchParams(options: InspectQueryOptions = {}): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (options.selectedHorizon) {
    searchParams.set('horizon', String(options.selectedHorizon));
  }

  if (options.liveMetrics) {
    Object.entries(options.liveMetrics)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .forEach(([key, value]) => {
        if (Number.isFinite(value)) {
          searchParams.set(key, String(value));
        }
      });
  }

  return searchParams;
}

export function normalizeInspectResponse(payload: unknown): InspectResponse {
  if (!isRecord(payload)) {
    throw new Error('Inspect payload is not an object.');
  }

  const strategyId = readString(payload, ['strategy_id', 'strategyId']);
  const registryId = readNumber(payload, ['registry_id', 'registryId']);
  const strategyName = readString(payload, ['strategy_name', 'strategyName', 'name']);
  const protocol = readString(payload, ['protocol', 'venue']);
  const network = readString(payload, ['network', 'chain']);

  if (!strategyId) {
    throw new Error('Inspect payload is missing strategy_id.');
  }

  if (!Number.isInteger(registryId) || (registryId ?? 0) <= 0) {
    throw new Error('Inspect payload is missing a valid registry_id.');
  }

  const normalizedRegistryId = registryId as number;

  if (!strategyName || !protocol || !network) {
    throw new Error('Inspect payload is missing strategy identity fields.');
  }

  const rawSelectedHorizon = parseHorizon(readFirst(payload, ['selected_horizon', 'selectedHorizon']));
  const simulation = normalizeSimulation(payload.simulation, rawSelectedHorizon ?? 90);
  const selectedHorizon = rawSelectedHorizon ?? simulation.selected_horizon;
  const expectedReturn =
    readString(payload, ['expected_return', 'expectedReturn']) ??
    simulation.scenarios.find((scenario) => scenario.horizon === selectedHorizon)?.projected_return;

  if (!expectedReturn) {
    throw new Error('Inspect payload is missing expected_return.');
  }

  const explanationValue = readFirst(payload, ['explanation', 'education']);
  const explanation = normalizeExplanation(explanationValue);
  const assumptions = normalizeAssumptions(payload, explanationValue);
  const assets = parseStringArray(readFirst(payload, ['assets', 'asset_pair', 'assetPair']));

  return {
    strategy_id: strategyId,
    registry_id: normalizedRegistryId,
    strategy_name: strategyName,
    protocol,
    network,
    selected_horizon: selectedHorizon,
    expected_return: expectedReturn,
    current_risk_level: readString(payload, ['current_risk_level', 'currentRiskLevel', 'risk', 'risk_level']) ?? 'Unknown',
    selected_live_metrics: normalizeLiveMetrics(readFirst(payload, ['selected_live_metrics', 'selectedLiveMetrics', 'live_metrics'])),
    simulation,
    explanation,
    assumptions,
    assets,
  };
}

export async function fetchRemoteInspectStrategy(
  strategyId: string,
  options: InspectQueryOptions = {},
): Promise<InspectResponse> {
  const response = await fetch(buildRemoteInspectUrl(strategyId, buildInspectSearchParams(options)), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Inspect request failed with ${response.status}.`);
  }

  return normalizeInspectResponse(await response.json());
}

export async function fetchRemoteInspectStrategyFromSearchParams(
  strategyId: string,
  searchParams: URLSearchParams,
): Promise<InspectResponse> {
  const response = await fetch(buildRemoteInspectUrl(strategyId, searchParams), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Inspect request failed with ${response.status}.`);
  }

  return normalizeInspectResponse(await response.json());
}

export async function fetchInspectStrategy(
  strategyId: string,
  options: InspectQueryOptions = {},
): Promise<InspectResponse> {
  const response = await fetch(buildRemoteInspectUrl(strategyId, buildInspectSearchParams(options)), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Inspect request failed with ${response.status}.`);
  }

  return normalizeInspectResponse(await response.json());
}
