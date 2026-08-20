import type { CandidateStrategy, HistoricalCampaign, Brand } from './types';
import historicalCampaignsData from '../data/historical_campaigns.json';
import brandsData from '../data/brands.json';

const historicalCampaigns: HistoricalCampaign[] = historicalCampaignsData as HistoricalCampaign[];
const brands: Brand[] = brandsData as Brand[];

/**
 * Calculates a multi-dimensional similarity score between a candidate strategy
 * and a historical campaign using weighted attribute distances.
 */
export function calculateSimilarity(
  candidate: CandidateStrategy,
  historical: HistoricalCampaign
): number {
  // 1. Brand Affinity Weight: 0.25
  let brandScore = 0.2;
  if (candidate.brandId === historical.brandId) {
    brandScore = 1.0;
  } else {
    const candBrand = brands.find(b => b.id === candidate.brandId);
    const histBrand = brands.find(b => b.id === historical.brandId);
    if (candBrand && histBrand && candBrand.category === histBrand.category) {
      brandScore = 0.65;
    }
  }

  // 2. Strategy Type Match Weight: 0.30
  let typeScore = 0.1;
  if (candidate.strategyType === historical.strategyType) {
    typeScore = 1.0;
  } else if (
    (candidate.strategyType === 'organic_social_reactive' && historical.strategyType === 'influencer_partnership') ||
    (candidate.strategyType === 'influencer_partnership' && historical.strategyType === 'organic_social_reactive')
  ) {
    typeScore = 0.55;
  } else if (
    (candidate.strategyType === 'paid_amplification' && historical.strategyType === 'full_campaign_pivot') ||
    (candidate.strategyType === 'full_campaign_pivot' && historical.strategyType === 'paid_amplification')
  ) {
    typeScore = 0.6;
  }

  // 3. Market Match Weight: 0.20
  let marketScore = 0.2;
  if (candidate.markets.includes('Global') || historical.market === 'Global') {
    marketScore = 0.85;
  } else if (candidate.markets.includes(historical.market)) {
    marketScore = 1.0;
  }

  // 4. Channel Overlap (Jaccard Index) Weight: 0.15
  const candChannels = new Set(candidate.channels);
  const histChannels = new Set(historical.channels);
  let intersectionCount = 0;
  candChannels.forEach(ch => {
    if (histChannels.has(ch)) intersectionCount++;
  });
  const unionCount = new Set([...candidate.channels, ...historical.channels]).size;
  const channelScore = unionCount > 0 ? intersectionCount / unionCount : 0.5;

  // 5. Budget Scale Proximity (Logarithmic distance) Weight: 0.10
  const candLogBudget = Math.log10(Math.max(1000, candidate.budget));
  const histLogBudget = Math.log10(Math.max(1000, historical.budget));
  const logDiff = Math.abs(candLogBudget - histLogBudget);
  const budgetScore = Math.max(0, 1 - logDiff / 2.0);

  // Weighted Combination
  const totalScore = 
    brandScore * 0.25 +
    typeScore * 0.30 +
    marketScore * 0.20 +
    channelScore * 0.15 +
    budgetScore * 0.10;

  return Math.min(1.0, Math.max(0.05, totalScore));
}

/**
 * Retrieves the Top-K nearest historical campaigns for explainability and Bayesian priors.
 */
export function findNearestHistoricalCampaigns(
  candidate: CandidateStrategy,
  k: number = 3
): HistoricalCampaign[] {
  const scored = historicalCampaigns.map(hist => ({
    ...hist,
    similarityScore: Number(calculateSimilarity(candidate, hist).toFixed(3))
  }));

  scored.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));
  return scored.slice(0, k);
}

/**
 * Calculates the historical data density (0 - 100) representing how much evidence
 * exists in Unilever's knowledge base for this type of strategy.
 */
export function calculateDataDensityScore(candidate: CandidateStrategy): number {
  const topCampaigns = findNearestHistoricalCampaigns(candidate, 5);
  const averageTopSimilarity = topCampaigns.reduce((acc, c) => acc + (c.similarityScore || 0), 0) / topCampaigns.length;
  return Math.round(averageTopSimilarity * 100);
}
