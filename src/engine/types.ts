export type BrandId = 'rexona' | 'dove' | 'knorr' | 'magnum' | 'hellmanns' | 'lifebuoy';

export type StrategyType = 
  | 'organic_social_reactive' 
  | 'paid_amplification' 
  | 'influencer_partnership' 
  | 'full_campaign_pivot';

export type Channel = 'Instagram' | 'TikTok' | 'YouTube' | 'X' | 'OOH' | 'TV' | 'WhatsApp' | 'LinkedIn';

export type Market = 'UK' | 'US' | 'Germany' | 'India' | 'Brazil' | 'Indonesia' | 'Nigeria' | 'Global';

export type TimelineUrgency = 'immediate' | 'one_week' | 'one_month';

export type RiskSeverity = 'low' | 'medium' | 'high';

export type LaunchTier = 'full_scale' | 'regional_test' | 'micro_test';

export interface Brand {
  id: BrandId;
  name: string;
  alternateNames?: string[];
  tagline: string;
  category: string;
  brandTone: string[];
  primaryAudience: string;
  typicalBudgetRange: { min: number; max: number };
  color: string;
  riskTolerance: string;
  activePartnerships: string[];
}

export interface CandidateStrategy {
  id: string;
  title: string;
  source?: string;
  brandId: BrandId;
  strategyType: StrategyType;
  markets: Market[];
  budget: number;
  channels: Channel[];
  timelineUrgency: TimelineUrgency;
  creativeAngle: string;
  rationale?: string;
  createdAt?: string;
  // Calendar schedule attributes
  scheduledDate?: string; // YYYY-MM-DD
  timeWindow?: string;
  eventContext?: string;
  culturalEventName?: string;
}

export interface HistoricalCampaign {
  id: string;
  campaignName: string;
  brandId: BrandId;
  strategyType: StrategyType;
  market: Market;
  budget: number;
  channels: Channel[];
  timelineUrgency: TimelineUrgency;
  creativeAngle: string;
  actualOutcome: {
    reach: number;
    cpm: number;
    sentimentSplit: {
      positive: number;
      neutral: number;
      negative: number;
    };
    engagementRate: number;
    conversionRate: number;
    backlashOccurred: boolean;
    backlashSeverity: 'none' | 'low' | 'medium' | 'high';
    backlashReason?: string;
    roi: number;
  };
  year: number;
  keyLearnings: string;
  similarityScore?: number;
}

export interface DailyReachPoint {
  day: number;
  dateLabel: string;
  minReach: number;
  expectedReach: number;
  maxReach: number;
  dailyImpressions: number;
  velocityPercent: number;
}

export interface FactorDriver {
  factor: string;
  impactType: 'positive' | 'negative' | 'neutral';
  impactPercentage: number;
  description: string;
  category: 'budget' | 'channel' | 'urgency' | 'market' | 'brand_fit';
}

export interface GuardrailFlag {
  id: string;
  type: 'brand_safety' | 'cultural_sensitivity' | 'legal_ip';
  severity: RiskSeverity;
  title: string;
  matchedTrigger: string;
  explanation: string;
  remediationAdvice: string;
  acknowledged?: boolean;
  overrideJustification?: string;
}

export interface KpiReasoning {
  reach: {
    formula: string;
    explanation: string;
    benchmark: string;
  };
  cpm: {
    formula: string;
    explanation: string;
    benchmark: string;
  };
  roi: {
    formula: string;
    explanation: string;
    benchmark: string;
  };
  engagement: {
    formula: string;
    explanation: string;
    benchmark: string;
  };
  costPerInteraction: {
    formula: string;
    explanation: string;
    benchmark: string;
  };
}

export interface SimulationResult {
  strategyId: string;
  timestamp: string;
  confidenceScore: number; // 0 - 100
  confidenceLabel: 'High Confidence' | 'Moderate Confidence' | 'Low Confidence / High Volatility';
  expectedTotalReach: number;
  reachConfidenceInterval: {
    min: number;
    max: number;
  };
  expectedCPM: number;
  reachTrajectory: DailyReachPoint[];
  sentimentBreakdown: {
    positive: number; // 0 - 100
    neutral: number;
    negative: number;
    netSentimentScore: number; // -100 to +100
  };
  engagementRate: {
    expected: number;
    min: number;
    max: number;
  };
  conversionRate: {
    expected: number;
    min: number;
    max: number;
  };
  backlashProbability: number; // 0 - 100
  backlashRiskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  estimatedROI: number; // Multiplier e.g. 4.2x
  costPerEngagedUser: number;
  guardrailFlags: GuardrailFlag[];
  launchTier: LaunchTier;
  launchTierRationale: string;
  gatingRecommendations: string[];
  topInfluencingCampaigns: HistoricalCampaign[];
  factorDrivers: FactorDriver[];
  executiveSummary: string;
  kpiReasoning: KpiReasoning;
  isAiEnhanced?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  strategy: CandidateStrategy;
  simulation: SimulationResult;
  manualOverrides: {
    flagId: string;
    justification: string;
    authorizedBy: string;
    timestamp: string;
  }[];
  notes?: string;
}
