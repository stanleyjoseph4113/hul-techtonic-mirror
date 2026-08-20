import type { CandidateStrategy, SimulationResult } from './types';
import { GoogleGenAI } from '@google/genai';

/**
 * Seamless AI Enhancer:
 * If an optional VITE_GEMINI_API_KEY is configured in the build/demo environment,
 * this can generate an extra layer of executive reasoning.
 * If no key is configured, it cleanly falls back to our deterministic algorithmic
 * executive summary with zero errors and without asking the user.
 */
export async function enhanceSimulationWithAI(
  strategy: CandidateStrategy,
  simulation: SimulationResult
): Promise<SimulationResult> {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any)?.__MIRROR_GEMINI_KEY__;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    // Graceful zero-cost client-side fallback
    return simulation;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the Mirror AI Simulation Engine for Unilever brand strategy (Techtonic Season 8).
Generate a concise, high-level executive strategic synthesis for Unilever brand leaders.

Brand: ${strategy.brandId.toUpperCase()}
Strategy: ${strategy.title} (${strategy.strategyType})
Budget: $${strategy.budget.toLocaleString()} USD
Target Markets: ${strategy.markets.join(', ')}
Channels: ${strategy.channels.join(', ')}
Creative Angle: "${strategy.creativeAngle}"

Simulation Predictions:
- Expected Reach: ${(simulation.expectedTotalReach / 1000000).toFixed(1)}M (${(simulation.reachConfidenceInterval.min / 1000000).toFixed(1)}M - ${(simulation.reachConfidenceInterval.max / 1000000).toFixed(1)}M 90% CI)
- Sentiment: ${simulation.sentimentBreakdown.positive}% Pos / ${simulation.sentimentBreakdown.neutral}% Neu / ${simulation.sentimentBreakdown.negative}% Neg
- Confidence Score: ${simulation.confidenceScore}/100
- Backlash Risk: ${simulation.backlashProbability}% (${simulation.backlashRiskLevel})
- Launch Recommendation: ${simulation.launchTier.toUpperCase()}
- Active Guardrails: ${simulation.guardrailFlags.map(f => f.title).join('; ') || 'None'}

Provide 2-3 sentences explaining why this strategy produces these numbers, highlighting key brand risks or viral opportunities for Unilever brand directors. Keep it professional, crisp, and direct.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    if (response && response.text) {
      return {
        ...simulation,
        executiveSummary: response.text.trim(),
        isAiEnhanced: true
      };
    }
  } catch (err) {
    console.warn('AI enhancement fallback to deterministic reasoning:', err);
  }

  return simulation;
}
