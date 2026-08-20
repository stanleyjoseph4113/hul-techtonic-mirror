import type { CandidateStrategy, SimulationResult, KpiReasoning } from './types';
import OpenAI from 'openai';

const NUMERIC_ADJUST_CACHE_KEY = 'mirror_llm_adjust_cache_v1';

type NumericAdjustments = {
  reachMultiplier: number;
  engagementMultiplier: number;
  roiMultiplier: number;
  cpmMultiplier: number;
  backlashDelta: number;
  confidenceDelta: number;
};

const DEFAULT_ADJUSTMENTS: NumericAdjustments = {
  reachMultiplier: 1,
  engagementMultiplier: 1,
  roiMultiplier: 1,
  cpmMultiplier: 1,
  backlashDelta: 0,
  confidenceDelta: 0
};

function getNvidiaApiKey(): string {
  return (
    (import.meta as any).env?.VITE_NVIDIA_API_KEY ||
    (import.meta as any).env?.NVIDIA_API_KEY ||
    (window as any)?.__MIRROR_NVIDIA_KEY__ ||
    (window as any)?.__NVIDIA_API_KEY__ ||
    ''
  );
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableStringify(obj[key])}`)
    .join(',')}}`;
}

function hashString(input: string): string {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

function getAdjustmentSeed(
  strategy: CandidateStrategy,
  simulation: SimulationResult
): string {
  return hashString(
    stableStringify({
      strategy,
      baseline: {
        expectedTotalReach: simulation.expectedTotalReach,
        expectedCPM: simulation.expectedCPM,
        estimatedROI: simulation.estimatedROI,
        engagementRate: simulation.engagementRate,
        costPerEngagedUser: simulation.costPerEngagedUser,
        confidenceScore: simulation.confidenceScore,
        launchTier: simulation.launchTier,
        backlashRisk: simulation.backlashRisk
      }
    })
  );
}

function readAdjustmentCache(): Record<string, NumericAdjustments> {
  try {
    const raw = localStorage.getItem(NUMERIC_ADJUST_CACHE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAdjustmentCache(
  cache: Record<string, NumericAdjustments>
): void {
  try {
    localStorage.setItem(NUMERIC_ADJUST_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Cache failure must never break the simulation.
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseAdjustments(content: string): NumericAdjustments | null {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    const values = {
      reachMultiplier: Number(parsed.reachMultiplier),
      engagementMultiplier: Number(parsed.engagementMultiplier),
      roiMultiplier: Number(parsed.roiMultiplier),
      cpmMultiplier: Number(parsed.cpmMultiplier),
      backlashDelta: Number(parsed.backlashDelta),
      confidenceDelta: Number(parsed.confidenceDelta)
    };

    if (Object.values(values).some(value => !Number.isFinite(value))) {
      return null;
    }

    return {
      // Keep the LLM inside deliberately narrow ranges so it can adjust
      // the deterministic model without replacing it.
      reachMultiplier: clamp(values.reachMultiplier, 0.85, 1.15),
      engagementMultiplier: clamp(values.engagementMultiplier, 0.85, 1.15),
      roiMultiplier: clamp(values.roiMultiplier, 0.85, 1.15),
      cpmMultiplier: clamp(values.cpmMultiplier, 0.85, 1.15),
      backlashDelta: clamp(values.backlashDelta, -10, 10),
      confidenceDelta: clamp(values.confidenceDelta, -10, 10)
    };
  } catch {
    return null;
  }
}

function applyNumericAdjustments(
  simulation: SimulationResult,
  adjustments: NumericAdjustments
): SimulationResult {
  const adjustedReach = Math.max(
    0,
    simulation.expectedTotalReach * adjustments.reachMultiplier
  );

  const adjustedCPM = Math.max(
    0,
    simulation.expectedCPM * adjustments.cpmMultiplier
  );

  const adjustedROI = Math.max(
    0,
    simulation.estimatedROI * adjustments.roiMultiplier
  );

  const adjustedEngagement = clamp(
    simulation.engagementRate.expected * adjustments.engagementMultiplier,
    0,
    100
  );

  const adjustedCostPerInteraction = Math.max(
    0,
    simulation.costPerEngagedUser *
      adjustments.cpmMultiplier /
      Math.max(adjustments.engagementMultiplier, 0.01)
  );

  const adjustedConfidence = clamp(
    simulation.confidenceScore + adjustments.confidenceDelta,
    0,
    100
  );

  const adjustedBacklashRisk = clamp(
    simulation.backlashRisk + adjustments.backlashDelta,
    0,
    100
  );

  const reachScale =
    simulation.expectedTotalReach > 0
      ? adjustedReach / simulation.expectedTotalReach
      : 1;

  return {
    ...simulation,
    expectedTotalReach: adjustedReach,
    reachConfidenceInterval: {
      min: Math.max(0, simulation.reachConfidenceInterval.min * reachScale),
      max: Math.max(0, simulation.reachConfidenceInterval.max * reachScale)
    },
    expectedCPM: adjustedCPM,
    estimatedROI: adjustedROI,
    engagementRate: {
      ...simulation.engagementRate,
      expected: adjustedEngagement
    },
    costPerEngagedUser: adjustedCostPerInteraction,
    confidenceScore: adjustedConfidence,
    backlashRisk: adjustedBacklashRisk
  };
}

/**
 * Runs a constrained LLM numeric-adjustment layer on top of the deterministic
 * simulation engine.
 *
 * Important:
 * - The deterministic engine always runs first.
 * - The LLM only supplies bounded multipliers/deltas.
 * - Successful adjustments are cached by a deterministic seed.
 * - Cache hits never call the network.
 * - Any missing key, API failure, invalid JSON, or cache error falls back
 *   to the untouched deterministic simulation.
 */
export async function adjustSimulationWithLLM(
  strategy: CandidateStrategy,
  simulation: SimulationResult
): Promise<SimulationResult> {
  const apiKey = getNvidiaApiKey();
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return simulation;
  }

  const seed = getAdjustmentSeed(strategy, simulation);
  const cache = readAdjustmentCache();
  const cached = cache[seed];

  if (cached) {
    return applyNumericAdjustments(simulation, cached);
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: 'https://integrate.api.nvidia.com/v1',
      dangerouslyAllowBrowser: true
    });

    const prompt = `
You are the numeric adjustment layer for the Mirror AI Simulation & Risk Engine for Unilever brand strategy.

A deterministic simulation has already calculated the baseline numbers below.
Your job is NOT to replace those calculations. Return only small, bounded adjustment factors
that account for campaign-specific creative fit, market context, channel mix, urgency and risk.

Campaign:
- Brand: ${strategy.brandId.toUpperCase()}
- Strategy: ${strategy.title} (${strategy.strategyType})
- Budget: $${strategy.budget.toLocaleString()} USD
- Target Markets: ${strategy.markets.join(', ')}
- Channels: ${strategy.channels.join(', ')}
- Urgency: ${strategy.timelineUrgency}
- Creative Angle: "${strategy.creativeAngle}"

Deterministic baseline:
- Expected Reach: ${simulation.expectedTotalReach}
- Expected CPM: ${simulation.expectedCPM}
- Estimated ROI: ${simulation.estimatedROI}
- Engagement Rate: ${simulation.engagementRate.expected}
- Cost per Interaction: ${simulation.costPerEngagedUser}
- Confidence Score: ${simulation.confidenceScore}
- Backlash Risk: ${simulation.backlashRisk}

Return ONLY valid JSON with exactly these numeric fields:
{
  "reachMultiplier": number,
  "engagementMultiplier": number,
  "roiMultiplier": number,
  "cpmMultiplier": number,
  "backlashDelta": number,
  "confidenceDelta": number
}

Strict bounds:
- reachMultiplier: 0.85 to 1.15
- engagementMultiplier: 0.85 to 1.15
- roiMultiplier: 0.85 to 1.15
- cpmMultiplier: 0.85 to 1.15
- backlashDelta: -10 to 10
- confidenceDelta: -10 to 10

Do not return markdown. Do not return explanations.
`;

    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      top_p: 1,
      max_tokens: 256,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return simulation;

    const adjustments = parseAdjustments(content);
    if (!adjustments) return simulation;

    cache[seed] = adjustments;
    writeAdjustmentCache(cache);

    return applyNumericAdjustments(simulation, adjustments);
  } catch (err) {
    console.warn(
      'NVIDIA AI numeric adjustment fallback to deterministic simulation:',
      err
    );
    return simulation;
  }
}

/**
 * NVIDIA API AI Enhancer using OpenAI SDK with meta/llama-3.3-70b-instruct:
 * Generates an executive strategic synthesis AND exact KPI mathematical logic breakdowns
 * for the 5 simulated KPI cards (Reach, CPM, ROI, Engagement, Cost per Interaction).
 *
 * If no key is set or in offline mode, it cleanly preserves our deterministic mathematical
 * explanations without interrupting user flow.
 */
export async function enhanceSimulationWithAI(
  strategy: CandidateStrategy,
  simulation: SimulationResult
): Promise<SimulationResult> {
  const apiKey = getNvidiaApiKey();

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return simulation;
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: 'https://integrate.api.nvidia.com/v1',
      dangerouslyAllowBrowser: true
    });

    const prompt = `
You are the Mirror AI Simulation & Risk Engine for Unilever brand strategy (Techtonic Season 8).
Analyze the candidate campaign and its simulated metrics, then output a JSON object with executive reasoning and detailed explanations for each of the 5 KPIs.

Campaign Details:
- Brand: ${strategy.brandId.toUpperCase()}
- Strategy: ${strategy.title} (${strategy.strategyType})
- Budget: $${strategy.budget.toLocaleString()} USD
- Target Markets: ${strategy.markets.join(', ')}
- Channels: ${strategy.channels.join(', ')}
- Urgency: ${strategy.timelineUrgency}
- Creative Angle: "${strategy.creativeAngle}"

Simulated KPI Numbers:
- Expected Reach: ${(simulation.expectedTotalReach / 1000000).toFixed(2)}M (Confidence Range: ${(simulation.reachConfidenceInterval.min / 1000000).toFixed(2)}M - ${(simulation.reachConfidenceInterval.max / 1000000).toFixed(2)}M)
- Expected CPM: $${simulation.expectedCPM}
- Est. Media ROI: ${simulation.estimatedROI}x
- Engagement Rate: ${simulation.engagementRate.expected}%
- Cost per Interaction: $${simulation.costPerEngagedUser}
- Confidence Score: ${simulation.confidenceScore}/100
- Launch Tier: ${simulation.launchTier.toUpperCase()}

Return ONLY a valid JSON object matching this exact structure:
{
  "executiveSummary": "2-3 crisp sentences summarizing why this strategy produces these numbers and key risks/opportunities for Unilever brand directors.",
  "kpiReasoning": {
    "reach": {
      "formula": "Reach = Baseline Priors * (Budget / HistBudget)^0.68 * Channel Synergy * Urgency",
      "explanation": "Why this specific reach number was computed based on channel mix, budget elasticity, and audience size.",
      "benchmark": "Comparison against Unilever category averages"
    },
    "cpm": {
      "formula": "CPM = (Budget / Expected Reach) * 1000",
      "explanation": "Why CPM is $${simulation.expectedCPM} (e.g. blend of organic viral social vs paid video placement costs).",
      "benchmark": "Industry standard benchmark for these channels"
    },
    "roi": {
      "formula": "Media ROI = Historical Baseline * (PosSentiment / 80) * Velocity Multiplier",
      "explanation": "Why estimated earned media multiplier is ${simulation.estimatedROI}x.",
      "benchmark": "Category ROI expectation"
    },
    "engagement": {
      "formula": "Engagement Rate = Historical Avg * Channel Synergy Multiplier",
      "explanation": "Why engagement is ${simulation.engagementRate.expected}% across chosen channels.",
      "benchmark": "Benchmark for vertical video / social feeds"
    },
    "costPerInteraction": {
      "formula": "Cost Per Interaction = Budget / (Expected Reach * Engagement Rate)",
      "explanation": "Why the brand pays $${simulation.costPerEngagedUser} per direct user interaction.",
      "benchmark": "Standard FMCG brand interaction efficiency"
    }
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;

    if (content) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        return {
          ...simulation,
          executiveSummary:
            parsed.executiveSummary || simulation.executiveSummary,
          kpiReasoning:
            parsed.kpiReasoning || simulation.kpiReasoning,
          isAiEnhanced: true
        };
      }
    }
  } catch (err) {
    console.warn(
      'NVIDIA AI Llama-3.3 enhancement fallback to deterministic reasoning:',
      err
    );
  }

  return simulation;
}
