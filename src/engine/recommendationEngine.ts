import type { 
  LaunchTier, 
  GuardrailFlag, 
  CandidateStrategy 
} from './types';

export interface RecommendationOutput {
  launchTier: LaunchTier;
  launchTierRationale: string;
  gatingRecommendations: string[];
}

/**
 * Synthesizes the overall risk, model confidence, and guardrails into a definitive
 * Unilever Launch Tier recommendation and actionable stage-gating playbook.
 */
export function synthesizeRecommendation(
  confidenceScore: number,
  backlashProbability: number,
  guardrailFlags: GuardrailFlag[],
  strategy: CandidateStrategy
): RecommendationOutput {
  const hasHighRiskFlag = guardrailFlags.some(f => f.severity === 'high');
  const hasMediumRiskFlag = guardrailFlags.some(f => f.severity === 'medium');

  // Case 1: RED TIER - Micro-Test Only / Hold for Review
  if (hasHighRiskFlag || confidenceScore < 50 || backlashProbability >= 28) {
    let primaryReason = '';
    if (hasHighRiskFlag) {
      const highFlag = guardrailFlags.find(f => f.severity === 'high');
      primaryReason = `High-severity guardrail flag triggered (${highFlag?.title}).`;
    } else if (backlashProbability >= 28) {
      primaryReason = `Elevated backlash risk (${backlashProbability}%) exceeds Unilever safe operating threshold.`;
    } else {
      primaryReason = `Low model confidence (${confidenceScore}/100) due to limited prior campaign precedent.`;
    }

    return {
      launchTier: 'micro_test',
      launchTierRationale: `HOLD / MICRO-TEST ONLY: ${primaryReason} Do not release full $${strategy.budget.toLocaleString()} budget without compliance clearance.`,
      gatingRecommendations: [
        `Cap initial digital spend at $${Math.min(25000, Math.round(strategy.budget * 0.1)).toLocaleString()} in a single low-risk test sandbox.`,
        'Obtain Brand Safety & Legal Counsel sign-off for flagged triggers.',
        'Establish automated Echo live-sentiment kill-switch if negative sentiment exceeds 8% in first 6 hours.',
        'Review creative copy to eliminate competitor and absolute efficacy claims.'
      ]
    };
  }

  // Case 2: YELLOW TIER - Regional Test First
  if (hasMediumRiskFlag || confidenceScore < 75 || backlashProbability >= 15) {
    const testMarket = strategy.markets[0] || 'UK';
    const pilotBudget = Math.round(strategy.budget * 0.20);

    return {
      launchTier: 'regional_test',
      launchTierRationale: `REGIONAL TEST FIRST: Moderate confidence (${confidenceScore}/100) with manageable risk profile. Recommended 2-stage phased activation.`,
      gatingRecommendations: [
        `Phase 1 Pilot: Deploy $${pilotBudget.toLocaleString()} (20% budget) exclusively in ${testMarket}.`,
        'Gate 1 Checkpoint (72 Hours): Proceed to full rollout only if engagement rate >= 3.8% and negative sentiment < 6%.',
        'Verify regional creator disclosure compliance prior to expanding to secondary markets.',
        'Monitor comment sections for early meme distortion or competitor counter-narratives.'
      ]
    };
  }

  // Case 3: GREEN TIER - Full-Scale Launch
  return {
    launchTier: 'full_scale',
    launchTierRationale: `FULL-SCALE LAUNCH APPROVED: High model confidence (${confidenceScore}/100), zero critical guardrail violations, and low predicted backlash (${backlashProbability}%).`,
    gatingRecommendations: [
      `Authorize immediate simultaneous deployment across ${strategy.markets.join(', ')} with full $${strategy.budget.toLocaleString()} allocation.`,
      'Activate upstream Echo agent for real-time brand lift and social conversion tracking.',
      'Synchronize retail partner inventory and e-commerce hero banners with social media launch pulse.',
      'Empower community managers with pre-approved rapid reply playbooks for viral moments.'
    ]
  };
}
