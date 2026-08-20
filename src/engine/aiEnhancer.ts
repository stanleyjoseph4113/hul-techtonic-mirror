import type { CandidateStrategy, SimulationResult, KpiReasoning } from './types';
import OpenAI from 'openai';

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
  const apiKey =
    (import.meta as any).env?.VITE_NVIDIA_API_KEY ||
    (import.meta as any).env?.NVIDIA_API_KEY ||
    (window as any)?.__MIRROR_NVIDIA_KEY__ ||
    (window as any)?.__NVIDIA_API_KEY__ ||
    '';

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    // Graceful client-side fallback with pre-calculated mathematical explanations
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
      model: "meta/llama-3.3-70b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 1024,
      stream: false
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...simulation,
          executiveSummary: parsed.executiveSummary || simulation.executiveSummary,
          kpiReasoning: parsed.kpiReasoning || simulation.kpiReasoning,
          isAiEnhanced: true
        };
      }
    }
  } catch (err) {
    console.warn('NVIDIA AI Llama-3.3 enhancement fallback to deterministic reasoning:', err);
  }

  return simulation;
}
