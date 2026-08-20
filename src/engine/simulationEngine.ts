import type { 
  CandidateStrategy, 
  SimulationResult, 
  DailyReachPoint, 
  FactorDriver, 
  HistoricalCampaign,
  KpiReasoning
} from './types';
import { findNearestHistoricalCampaigns, calculateDataDensityScore } from './similarityEngine';
import { runGuardrailScreening } from './guardrailEngine';
import { synthesizeRecommendation } from './recommendationEngine';

/**
 * Seeded pseudo-random generator to ensure deterministic yet organic simulation results
 * for identical strategy input configurations.
 */
function createPseudoRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    const char = seedStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  let seed = Math.abs(hash);

  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Main simulation engine that projects campaign performance, reach confidence intervals,
 * sentiment distributions, and backlash probability based on historical campaign priors.
 */
export function runSimulation(strategy: CandidateStrategy): SimulationResult {
  const seedString = `${strategy.id}-${strategy.brandId}-${strategy.strategyType}-${strategy.budget}-${strategy.channels.sort().join(',')}-${strategy.markets.sort().join(',')}-${strategy.creativeAngle}`;
  const random = createPseudoRandom(seedString);

  // 1. Fetch nearest historical neighbors
  const nearestCampaigns: HistoricalCampaign[] = findNearestHistoricalCampaigns(strategy, 3);
  const dataDensityScore = calculateDataDensityScore(strategy);

  // Calculate weighted historical baseline outcomes
  const totalSimilarity = nearestCampaigns.reduce((sum, c) => sum + (c.similarityScore || 0.5), 0);
  let baselineReach = 0;
  let baselineBudget = 0;
  let baselinePosSentiment = 0;
  let baselineNeuSentiment = 0;
  let baselineNegSentiment = 0;
  let baselineEngagement = 0;
  let baselineConversion = 0;
  let baselineROI = 0;

  nearestCampaigns.forEach(c => {
    const weight = (c.similarityScore || 0.5) / (totalSimilarity || 1);
    baselineReach += c.actualOutcome.reach * weight;
    baselineBudget += c.budget * weight;
    baselinePosSentiment += c.actualOutcome.sentimentSplit.positive * weight;
    baselineNeuSentiment += c.actualOutcome.sentimentSplit.neutral * weight;
    baselineNegSentiment += c.actualOutcome.sentimentSplit.negative * weight;
    baselineEngagement += c.actualOutcome.engagementRate * weight;
    baselineConversion += c.actualOutcome.conversionRate * weight;
    baselineROI += c.actualOutcome.roi * weight;
  });

  // Factor Attribution Tracking
  const factorDrivers: FactorDriver[] = [];

  // 2. Budget Elasticity & Diminishing Marginal Returns Formula:
  // Reach scales sub-linearly with power 0.68 relative to historical spend
  const safeHistBudget = Math.max(10000, baselineBudget);
  const budgetRatio = strategy.budget / safeHistBudget;
  const elasticityExponent = strategy.strategyType === 'organic_social_reactive' ? 0.45 : 0.68;
  const budgetMultiplier = Math.pow(Math.max(0.1, budgetRatio), elasticityExponent);

  if (strategy.budget > 500000) {
    factorDrivers.push({
      factor: 'High-Budget Media Penetration',
      impactType: 'positive',
      impactPercentage: 22,
      description: 'Significant paid budget ensures guaranteed high baseline impressions across digital feeds.',
      category: 'budget'
    });
  } else if (strategy.budget < 50000 && strategy.strategyType === 'organic_social_reactive') {
    factorDrivers.push({
      factor: 'High Capital Efficiency (Earned Media)',
      impactType: 'positive',
      impactPercentage: 28,
      description: 'Low-spend organic reactive plays historically yield exceptional earned-media ROI multiples.',
      category: 'budget'
    });
  }

  // 3. Channel Synergy & Multipliers
  let channelReachMultiplier = 1.0;
  let channelEngagementMultiplier = 1.0;

  const hasTikTok = strategy.channels.includes('TikTok');
  const hasInstagram = strategy.channels.includes('Instagram');
  const hasX = strategy.channels.includes('X');
  const hasTV = strategy.channels.includes('TV');
  const hasOOH = strategy.channels.includes('OOH');

  if (hasTikTok && hasInstagram) {
    channelReachMultiplier += 0.12;
    channelEngagementMultiplier += 0.18;
    factorDrivers.push({
      factor: 'Vertical Video Viral Loop (TikTok + IG)',
      impactType: 'positive',
      impactPercentage: 18,
      description: 'Cross-posting short-form video maximizes youth demographic engagement and sharing velocity.',
      category: 'channel'
    });
  }

  if (hasX && strategy.timelineUrgency === 'immediate') {
    channelReachMultiplier += 0.20;
    channelEngagementMultiplier += 0.15;
    factorDrivers.push({
      factor: 'Real-Time News-Cycle Leverage (X Platform)',
      impactType: 'positive',
      impactPercentage: 20,
      description: 'Deploying on X within hours of trending moment captures live broadcast chatter and meme cycles.',
      category: 'urgency'
    });
  }

  if (hasTV || hasOOH) {
    channelReachMultiplier += 0.35;
    channelEngagementMultiplier -= 0.08; // Mass broadcast reach has lower direct digital engagement %
    factorDrivers.push({
      factor: 'Mass Broadcast Anchor (TV / OOH)',
      impactType: 'positive',
      impactPercentage: 35,
      description: 'Physical billboards and TV integration establish broad national awareness and household credibility.',
      category: 'channel'
    });
  }

  // 4. Urgency Modifiers
  let urgencyReachMod = 1.0;
  if (strategy.timelineUrgency === 'immediate') {
    urgencyReachMod = strategy.strategyType === 'organic_social_reactive' ? 1.25 : 1.05;
  } else if (strategy.timelineUrgency === 'one_month') {
    urgencyReachMod = strategy.strategyType === 'organic_social_reactive' ? 0.75 : 1.10;
  }

  // 5. Compute Final Expected Reach & Confidence Intervals
  // Natural variation range around expected reach (+/- 18% to 32%)
  const reachVariance = 0.22 + (1 - totalSimilarity / 3) * 0.15;
  let rawExpectedReach = baselineReach * budgetMultiplier * channelReachMultiplier * urgencyReachMod;
  
  // Guard against unrealistic bounds
  rawExpectedReach = Math.max(250000, Math.round(rawExpectedReach * (0.95 + random() * 0.1)));
  const minReach = Math.round(rawExpectedReach * (1 - reachVariance));
  const maxReach = Math.round(rawExpectedReach * (1 + reachVariance * 1.35));

  // Expected CPM
  const expectedCPM = Number(((strategy.budget / (rawExpectedReach / 1000))).toFixed(2));

  // 6. 14-Day Trajectory Generation
  const reachTrajectory: DailyReachPoint[] = [];
  const totalDays = 14;
  let cumulativeExpected = 0;
  let cumulativeMin = 0;
  let cumulativeMax = 0;

  for (let day = 1; day <= totalDays; day++) {
    // Determine daily increment curve: front-loaded for social/reactive, progressive for paid
    let dayFraction: number;
    if (strategy.strategyType === 'organic_social_reactive') {
      // Rapid peak on days 1-3
      dayFraction = Math.exp(-0.35 * day) * 0.42;
    } else if (strategy.strategyType === 'influencer_partnership') {
      // Staggered roll out peak around day 3-5
      dayFraction = (Math.pow(day, 1.8) * Math.exp(-0.45 * day)) * 0.35;
    } else {
      // Sustained campaign bell/S-curve
      dayFraction = (Math.pow(day, 2.2) * Math.exp(-0.4 * day)) * 0.28;
    }

    // Normalize daily increment to sum to ~1 over 14 days
    if (day === totalDays) {
      cumulativeExpected = rawExpectedReach;
      cumulativeMin = minReach;
      cumulativeMax = maxReach;
    } else {
      const dailyExpectedInc = rawExpectedReach * Math.max(0.015, dayFraction);
      cumulativeExpected = Math.min(rawExpectedReach, cumulativeExpected + dailyExpectedInc);
      cumulativeMin = Math.min(minReach, cumulativeMin + dailyExpectedInc * (1 - reachVariance));
      cumulativeMax = Math.min(maxReach, cumulativeMax + dailyExpectedInc * (1 + reachVariance * 1.2));
    }

    reachTrajectory.push({
      day,
      dateLabel: `Day ${day}`,
      minReach: Math.round(cumulativeMin),
      expectedReach: Math.round(cumulativeExpected),
      maxReach: Math.round(cumulativeMax),
      dailyImpressions: Math.round(cumulativeExpected / day),
      velocityPercent: Math.round((cumulativeExpected / rawExpectedReach) * 100)
    });
  }

  // 7. Run Guardrail Engine
  const guardrailFlags = runGuardrailScreening(strategy);

  // 8. Backlash Probability Formulation
  let backlashBase = 4.0; // 4% base
  if (strategy.strategyType === 'influencer_partnership') backlashBase += 5.0;
  if (strategy.strategyType === 'full_campaign_pivot') backlashBase += 6.0;
  if (strategy.markets.includes('Germany') || strategy.markets.includes('US')) backlashBase += 3.0;

  // Add penalties for guardrail flags
  guardrailFlags.forEach(flag => {
    if (flag.severity === 'high') {
      backlashBase += 18.0;
      factorDrivers.push({
        factor: `Guardrail Risk: ${flag.title}`,
        impactType: 'negative',
        impactPercentage: -25,
        description: flag.explanation,
        category: 'brand_fit'
      });
    } else if (flag.severity === 'medium') {
      backlashBase += 8.0;
      factorDrivers.push({
        factor: `Compliance Watch: ${flag.title}`,
        impactType: 'negative',
        impactPercentage: -12,
        description: flag.explanation,
        category: 'market'
      });
    } else {
      backlashBase += 3.0;
    }
  });

  const backlashProbability = Math.min(95, Math.max(2, Math.round(backlashBase + (random() * 4 - 2))));
  const backlashRiskLevel =
    backlashProbability < 10 ? 'Low' :
      backlashProbability < 25 ? 'Medium' :
        backlashProbability < 50 ? 'High' : 'Critical';

  // 9. Sentiment Distribution
  let posSent = Math.round(baselinePosSentiment * 100);
  let negSent = Math.round(baselineNegSentiment * 100 + (backlashProbability > 20 ? (backlashProbability - 20) * 0.4 : 0));
  
  if (guardrailFlags.some(f => f.severity === 'high')) {
    posSent = Math.max(30, posSent - 18);
    negSent = Math.min(55, negSent + 16);
  }

  const neuSent = Math.max(5, 100 - posSent - negSent);
  // Rebalance to exactly 100%
  const totalSent = posSent + neuSent + negSent;
  const normPos = Math.round((posSent / totalSent) * 100);
  const normNeg = Math.round((negSent / totalSent) * 100);
  const normNeu = 100 - normPos - normNeg;

  // 10. Engagement & Conversion Rate
  const expectedEngagement = Number((Math.max(1.2, baselineEngagement * channelEngagementMultiplier * (0.95 + random() * 0.1))).toFixed(1));
  const expectedConversion = Number((Math.max(0.6, baselineConversion * (0.95 + random() * 0.1))).toFixed(1));

  // 11. Confidence Score (0 - 100)
  // Combines data density, risk penalty, and input specificity
  let confidenceScore = Math.round(
    dataDensityScore * 0.50 +
    (100 - backlashProbability) * 0.30 +
    (strategy.channels.length >= 2 ? 15 : 8) +
    (strategy.creativeAngle.length > 30 ? 5 : 0)
  );
  confidenceScore = Math.min(96, Math.max(28, confidenceScore));

  const confidenceLabel =
    confidenceScore >= 75 ? 'High Confidence' :
      confidenceScore >= 50 ? 'Moderate Confidence' :
        'Low Confidence / High Volatility';

  // 12. Estimated ROI & Cost Per Engaged User
  const estimatedROI = Number((Math.max(1.1, baselineROI * (normPos / 80) * (urgencyReachMod))).toFixed(1));
  const engagedUsers = Math.max(1, Math.round(rawExpectedReach * (expectedEngagement / 100)));
  const costPerEngagedUser = Number((strategy.budget / engagedUsers).toFixed(2));

  // 13. Synthesize Launch Tier Recommendation
  const { launchTier, launchTierRationale, gatingRecommendations } = synthesizeRecommendation(
    confidenceScore,
    backlashProbability,
    guardrailFlags,
    strategy
  );

  // Executive Summary text
  const executiveSummary = `Predicted reach of ${(rawExpectedReach / 1000000).toFixed(1)}M users across ${strategy.markets.join(', ')} with ${normPos}% positive sentiment and ${confidenceScore}/100 model confidence. ${launchTierRationale}`;

  // 14. Deterministic KPI Reasoning Breakdown
  const kpiReasoning: KpiReasoning = {
    reach: {
      formula: `Reach = Baseline Priors (${(baselineReach / 1000000).toFixed(1)}M) × (Budget Ratio)^${elasticityExponent} × Channel Synergy (${channelReachMultiplier.toFixed(2)}x) × Urgency (${urgencyReachMod.toFixed(2)}x)`,
      explanation: `Calculated from ${nearestCampaigns.length} nearest historical campaigns (${nearestCampaigns.map(c => c.campaignName.slice(0, 20) + '...').join(', ')}). Budget of $${strategy.budget.toLocaleString()} was scaled with diminishing returns exponent (${elasticityExponent}) and enhanced by ${strategy.channels.join(', ')} channel synergies.`,
      benchmark: `Category benchmark for ${strategy.brandId.toUpperCase()}: 5M–30M reach depending on media mix.`
    },
    cpm: {
      formula: `CPM = ($${strategy.budget.toLocaleString()} / ${(rawExpectedReach / 1000).toLocaleString()} k-impressions) = $${expectedCPM}`,
      explanation: `Expected cost per thousand impressions. Blends selected channels (${strategy.channels.join(', ')}) where short-form organic video yields low unit CPMs ($2–$6), while broadcast/OOH anchors lift the blended rate to $${expectedCPM}.`,
      benchmark: `Unilever Global Digital average: $6.50 – $14.00 CPM.`
    },
    roi: {
      formula: `Media ROI = Historical Baseline (${baselineROI.toFixed(1)}x) × (Positive Sentiment ${normPos}% / 80%) × Urgency Velocity (${urgencyReachMod.toFixed(2)}x)`,
      explanation: `Represents expected earned media value multiplier (${estimatedROI}x) generated from high positive social sentiment (${normPos}%) and organic virality relative to paid budget.`,
      benchmark: `Unilever Reactive Benchmark: 3.5x – 6.0x earned media return.`
    },
    engagement: {
      formula: `Engagement Rate = Historical Baseline (${baselineEngagement.toFixed(1)}%) × Channel Format Multiplier (${channelEngagementMultiplier.toFixed(2)}x)`,
      explanation: `Expected interaction rate (${expectedEngagement}%) across likes, comments, shares, and saves. Vertical video formats on ${strategy.channels.filter(c => c === 'TikTok' || c === 'Instagram').join(' & ') || 'social feeds'} deliver a +18% engagement lift.`,
      benchmark: `Industry average: 3.0% – 5.5% for creator and reactive video.`
    },
    costPerInteraction: {
      formula: `Cost / Interaction = $${strategy.budget.toLocaleString()} / (${(rawExpectedReach / 1000000).toFixed(2)}M × ${expectedEngagement}%) = $${costPerEngagedUser}`,
      explanation: `Direct media spend required to produce one active user engagement (${(engagedUsers / 1000).toFixed(0)}k total engaged users). Lower cost indicates high capital efficiency.`,
      benchmark: `Top-quartile FMCG benchmark: < $0.25 per interaction.`
    }
  };

  return {
    strategyId: strategy.id,
    timestamp: new Date().toISOString(),
    confidenceScore,
    confidenceLabel,
    expectedTotalReach: rawExpectedReach,
    reachConfidenceInterval: {
      min: minReach,
      max: maxReach
    },
    expectedCPM,
    reachTrajectory,
    sentimentBreakdown: {
      positive: normPos,
      neutral: normNeu,
      negative: normNeg,
      netSentimentScore: normPos - normNeg
    },
    engagementRate: {
      expected: expectedEngagement,
      min: Number((expectedEngagement * 0.75).toFixed(1)),
      max: Number((expectedEngagement * 1.35).toFixed(1))
    },
    conversionRate: {
      expected: expectedConversion,
      min: Number((expectedConversion * 0.7).toFixed(1)),
      max: Number((expectedConversion * 1.3).toFixed(1))
    },
    backlashRisk: backlashProbability,
    backlashProbability,
    backlashRiskLevel,
    estimatedROI,
    costPerEngagedUser,
    guardrailFlags,
    launchTier,
    launchTierRationale,
    gatingRecommendations,
    topInfluencingCampaigns: nearestCampaigns,
    factorDrivers,
    executiveSummary,
    kpiReasoning,
    isAiEnhanced: false
  };
}
