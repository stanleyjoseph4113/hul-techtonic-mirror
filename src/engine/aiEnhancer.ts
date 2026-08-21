import type { CandidateStrategy, DailyReachPoint, FactorDriver, GuardrailFlag, HistoricalCampaign, KpiReasoning, LaunchTier, SimulationResult } from './types';
import brands from '../data/brands.json';
import historicalCampaigns from '../data/historical_campaigns.json';
import blocklist from '../data/blocklist.json';
import culturalFlags from '../data/cultural_flags.json';
import partnerships from '../data/partnerships.json';
import preloadedStrategies from '../data/preloaded_strategies.json';

const CACHE_KEY = 'mirror_llm_first_results_v1';
const MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 30_000;
const SOURCE_FILES = ['brands.json', 'historical_campaigns.json', 'blocklist.json', 'cultural_flags.json', 'partnerships.json', 'preloaded_strategies.json'];
// Gemini structured output prevents the model from returning prose or malformed JSON.
const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    expectedTotalReach: { type: 'INTEGER' }, reachMin: { type: 'INTEGER' }, reachMax: { type: 'INTEGER' },
    expectedCPM: { type: 'NUMBER' }, estimatedROI: { type: 'NUMBER' }, engagementRate: { type: 'NUMBER' }, conversionRate: { type: 'NUMBER' },
    confidenceScore: { type: 'NUMBER' }, backlashProbability: { type: 'NUMBER' }, launchTier: { type: 'STRING' },
    launchTierRationale: { type: 'STRING' }, executiveSummary: { type: 'STRING' },
    sentiment: { type: 'OBJECT', properties: { positive: { type: 'NUMBER' }, negative: { type: 'NUMBER' } } },
    gatingRecommendations: { type: 'ARRAY', items: { type: 'STRING' } },
    topInfluencingCampaignIds: { type: 'ARRAY', items: { type: 'STRING' } },
    reachCurve: { type: 'ARRAY', items: { type: 'NUMBER' } },
    factorDrivers: { type: 'ARRAY', items: { type: 'OBJECT', properties: { factor: { type: 'STRING' }, impactType: { type: 'STRING' }, impactPercentage: { type: 'NUMBER' }, description: { type: 'STRING' }, category: { type: 'STRING' } } } },
    guardrailFlags: { type: 'ARRAY', items: { type: 'OBJECT', properties: { type: { type: 'STRING' }, severity: { type: 'STRING' }, title: { type: 'STRING' }, matchedTrigger: { type: 'STRING' }, explanation: { type: 'STRING' }, remediationAdvice: { type: 'STRING' } } } },
    kpiReasoning: { type: 'OBJECT', properties: {
      reach: { type: 'OBJECT', properties: { formula: { type: 'STRING' }, explanation: { type: 'STRING' }, benchmark: { type: 'STRING' } } },
      cpm: { type: 'OBJECT', properties: { formula: { type: 'STRING' }, explanation: { type: 'STRING' }, benchmark: { type: 'STRING' } } },
      roi: { type: 'OBJECT', properties: { formula: { type: 'STRING' }, explanation: { type: 'STRING' }, benchmark: { type: 'STRING' } } },
      engagement: { type: 'OBJECT', properties: { formula: { type: 'STRING' }, explanation: { type: 'STRING' }, benchmark: { type: 'STRING' } } },
      costPerInteraction: { type: 'OBJECT', properties: { formula: { type: 'STRING' }, explanation: { type: 'STRING' }, benchmark: { type: 'STRING' } } }
    } }
  }
};

export interface LLMRunAttempt {
  simulation: SimulationResult | null;
  failureReason?: string;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map(key => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

function hash(input: string): string {
  let value = 2166136261;
  for (let i = 0; i < input.length; i++) { value ^= input.charCodeAt(i); value = Math.imul(value, 16777619); }
  return (value >>> 0).toString(16);
}

function cacheKey(strategy: CandidateStrategy): string {
  // A cache makes repeat analysis of one brief stable, without making the first
  // result a rule-based calculation.
  return hash(stableStringify({ strategy, knowledgeVersion: 'data-v1', model: MODEL }));
}

function readCache(): Record<string, SimulationResult> {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
}
function writeCache(cache: Record<string, SimulationResult>) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* non-critical */ }
}
function numberIn(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
function stringIn(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function makeTrajectory(total: number, lower: number, upper: number, curve: unknown): DailyReachPoint[] {
  const supplied = Array.isArray(curve) ? curve.slice(0, 14).map(Number) : [];
  const raw = supplied.length === 14 && supplied.every(value => Number.isFinite(value) && value >= 0)
    ? supplied : Array.from({ length: 14 }, (_, index) => Math.exp(-0.28 * index));
  const sum = raw.reduce((acc, value) => acc + value, 0) || 1;
  let expected = 0; let min = 0; let max = 0;
  return raw.map((weight, index) => {
    expected += total * weight / sum; min += lower * weight / sum; max += upper * weight / sum;
    return { day: index + 1, dateLabel: `Day ${index + 1}`,
      expectedReach: Math.round(index === 13 ? total : expected), minReach: Math.round(index === 13 ? lower : min), maxReach: Math.round(index === 13 ? upper : max),
      dailyImpressions: Math.round(total * weight / sum), velocityPercent: Math.round(((index === 13 ? total : expected) / total) * 100) };
  });
}

function normalizeFlags(value: unknown): GuardrailFlag[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((flag, index) => {
    const item = (flag || {}) as Record<string, unknown>;
    const severity = ['low', 'medium', 'high'].includes(String(item.severity)) ? item.severity as GuardrailFlag['severity'] : 'medium';
    const type = ['brand_safety', 'cultural_sensitivity', 'legal_ip'].includes(String(item.type)) ? item.type as GuardrailFlag['type'] : 'brand_safety';
    return { id: `llm-guardrail-${index}`, type, severity,
      title: stringIn(item.title, 'Campaign review required'), matchedTrigger: stringIn(item.matchedTrigger, 'Model-detected risk'),
      explanation: stringIn(item.explanation, 'Review this campaign element before launch.'), remediationAdvice: stringIn(item.remediationAdvice, 'Obtain brand-safety review.') };
  });
}

function normalizeKpi(value: unknown): KpiReasoning {
  const source = (value || {}) as Record<string, any>;
  const entry = (key: keyof KpiReasoning) => ({ formula: stringIn(source[key]?.formula, 'LLM-grounded estimate using supplied campaign evidence.'), explanation: stringIn(source[key]?.explanation, 'Generated from the supplied campaign brief and data files.'), benchmark: stringIn(source[key]?.benchmark, 'Grounded against the supplied historical campaign data.') });
  return { reach: entry('reach'), cpm: entry('cpm'), roi: entry('roi'), engagement: entry('engagement'), costPerInteraction: entry('costPerInteraction') };
}

function buildResult(strategy: CandidateStrategy, raw: Record<string, any>): SimulationResult | null {
  const reach = numberIn(raw.expectedTotalReach, 100_000, 500_000_000, 0);
  if (!reach) return null;
  const reachMin = numberIn(raw.reachMin, 0, reach, Math.round(reach * .75));
  const reachMax = numberIn(raw.reachMax, reach, 600_000_000, Math.round(reach * 1.3));
  const positive = numberIn(raw.sentiment?.positive, 0, 100, 60);
  const negative = numberIn(raw.sentiment?.negative, 0, 100 - positive, 15);
  const neutral = Math.max(0, 100 - positive - negative);
  const backlashProbability = numberIn(raw.backlashProbability, 0, 100, negative);
  const confidenceScore = numberIn(raw.confidenceScore, 0, 100, 50);
  const engagement = numberIn(raw.engagementRate, .1, 100, 3);
  const conversion = numberIn(raw.conversionRate, .01, 100, 1);
  const tier: LaunchTier = ['full_scale', 'regional_test', 'micro_test'].includes(raw.launchTier) ? raw.launchTier : 'regional_test';
  const campaignIds = Array.isArray(raw.topInfluencingCampaignIds) ? raw.topInfluencingCampaignIds : [];
  const topInfluencingCampaigns = campaignIds.map((id: string) => (historicalCampaigns as HistoricalCampaign[]).find(campaign => campaign.id === id)).filter(Boolean) as HistoricalCampaign[];
  const drivers = Array.isArray(raw.factorDrivers) ? raw.factorDrivers.slice(0, 5).map((driver: any): FactorDriver => ({
    factor: stringIn(driver?.factor, 'Model-assessed campaign factor'), impactType: ['positive', 'negative', 'neutral'].includes(driver?.impactType) ? driver.impactType : 'neutral',
    impactPercentage: numberIn(driver?.impactPercentage, -100, 100, 0), description: stringIn(driver?.description, 'Model-generated assessment.'),
    category: ['budget', 'channel', 'urgency', 'market', 'brand_fit'].includes(driver?.category) ? driver.category : 'brand_fit' })) : [];
  return { strategyId: strategy.id, timestamp: new Date().toISOString(), confidenceScore: Math.round(confidenceScore),
    confidenceLabel: confidenceScore >= 75 ? 'High Confidence' : confidenceScore >= 50 ? 'Moderate Confidence' : 'Low Confidence / High Volatility',
    expectedTotalReach: Math.round(reach), reachConfidenceInterval: { min: Math.round(reachMin), max: Math.round(reachMax) },
    expectedCPM: Number(numberIn(raw.expectedCPM, .01, 10_000, strategy.budget / (reach / 1000)).toFixed(2)), reachTrajectory: makeTrajectory(reach, reachMin, reachMax, raw.reachCurve),
    sentimentBreakdown: { positive: Math.round(positive), neutral: Math.round(neutral), negative: Math.round(negative), netSentimentScore: Math.round(positive - negative) },
    engagementRate: { expected: engagement, min: Number((engagement * .7).toFixed(1)), max: Number((engagement * 1.3).toFixed(1)) },
    conversionRate: { expected: conversion, min: Number((conversion * .7).toFixed(1)), max: Number((conversion * 1.3).toFixed(1)) },
    backlashRisk: backlashProbability, backlashProbability, backlashRiskLevel: backlashProbability < 10 ? 'Low' : backlashProbability < 25 ? 'Medium' : backlashProbability < 50 ? 'High' : 'Critical',
    estimatedROI: Number(numberIn(raw.estimatedROI, .1, 100, 2).toFixed(1)), costPerEngagedUser: Number(numberIn(raw.costPerEngagedUser, .001, 10_000, strategy.budget / Math.max(1, reach * engagement / 100)).toFixed(2)),
    guardrailFlags: normalizeFlags(raw.guardrailFlags), launchTier: tier, launchTierRationale: stringIn(raw.launchTierRationale, 'LLM recommends a staged validation before budget deployment.'),
    gatingRecommendations: Array.isArray(raw.gatingRecommendations) ? raw.gatingRecommendations.slice(0, 5).map((item: unknown) => stringIn(item, '')).filter(Boolean) : [],
    topInfluencingCampaigns, factorDrivers: drivers, executiveSummary: stringIn(raw.executiveSummary, 'LLM-generated campaign assessment based on the supplied Mirror data.'),
    kpiReasoning: normalizeKpi(raw.kpiReasoning), isAiEnhanced: true };
}

/** LLM-first primary engine. The deterministic simulator is not called here. */
export async function runLLMFirstSimulation(strategy: CandidateStrategy): Promise<LLMRunAttempt> {
  const key = cacheKey(strategy);
  const cached = readCache()[key];
  if (cached) return { simulation: { ...cached, timestamp: new Date().toISOString(), isAiEnhanced: true, aiTrace: { mode: 'llm_cache', model: MODEL, sourceFiles: SOURCE_FILES, responseId: cached.aiTrace?.responseId } } };
  const knowledgeBase = JSON.stringify({ brands, historicalCampaigns, blocklist, culturalFlags, partnerships, preloadedStrategies });
  const prompt = `You are Mirror, an LLM-first campaign simulation and risk engine for Unilever. Your judgment, grounded only in the supplied JSON knowledge base, is the primary source of the assessment.\n\nCAMPAIGN BRIEF:\n${JSON.stringify(strategy)}\n\nKNOWLEDGE BASE (all src/data JSON files):\n${knowledgeBase}\n\nReturn the JSON shape in the response schema. Be concise: executiveSummary <= 70 words; each KPI formula, explanation, and benchmark <= 20 words; drivers and flags <= 3 each; recommendations <= 3. Use only exact historical campaign IDs. Keep figures plausible and reconcile CPM and cost per engaged user with budget, reach and engagement.`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const upstream = await fetch('/api/mirror/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Gemini generateContent API shape.
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: .2, topP: .7, maxOutputTokens: 16384, responseMimeType: 'application/json', responseSchema: GEMINI_RESPONSE_SCHEMA }
      }),
      signal: controller.signal
    });
    const rawText = await upstream.text();
    let payload: { responseId?: string; candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } | string } | null = null;

    if (rawText.trim()) {
      const looksLikeHtml = rawText.trim().startsWith('<');
      if (looksLikeHtml) {
        payload = { error: 'Gemini endpoint returned HTML instead of JSON. This usually means the app is being served without the production proxy.' };
      } else {
        try {
          payload = JSON.parse(rawText) as typeof payload;
        } catch {
          payload = { error: rawText.slice(0, 200) || 'Gemini returned a non-JSON response.' };
        }
      }
    }

    const errorMessage = typeof payload?.error === 'string' ? payload.error : payload?.error?.message;
    if (!upstream.ok) return { simulation: null, failureReason: `Gemini API ${upstream.status}: ${errorMessage || 'Request failed.'}` };
    const finishReason = payload?.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS') return { simulation: null, failureReason: 'Gemini response was truncated at its output limit.' };
    const content = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('');
    if (!content) return { simulation: null, failureReason: 'Gemini returned an empty completion.' };
    const result = buildResult(strategy, JSON.parse(content));
    if (!result) return { simulation: null, failureReason: 'Gemini completion did not contain a valid campaign result.' };
    result.aiTrace = { mode: 'llm_first', model: MODEL, sourceFiles: SOURCE_FILES, responseId: payload?.responseId };
    const cache = readCache(); cache[key] = result; writeCache(cache);
    return { simulation: result };
  } catch (error) {
    console.warn('Gemini LLM-first simulation unavailable; using local fallback.', error);
    const failureReason = error instanceof DOMException && error.name === 'AbortError'
      ? `Gemini request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`
      : error instanceof Error ? error.message : 'Unknown Gemini API error.';
    return { simulation: null, failureReason };
  } finally {
    window.clearTimeout(timeout);
  }
}
