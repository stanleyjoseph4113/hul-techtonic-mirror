import React, { useState } from 'react';
import type { CandidateStrategy, SimulationResult } from '../../engine/types';
import { TierBadge } from '../common/Badge';
import { ReachVelocityChart } from './ReachVelocityChart';
import { SentimentDonut } from './SentimentDonut';
import { RiskGuardrailCard } from './RiskGuardrailCard';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { ActivationModal } from './ActivationModal';
import { KpiReasoningModal } from './KpiReasoningModal';
import { 
  Rocket, 
  Sparkles, 
  Lock,
  HelpCircle
} from 'lucide-react';

interface SimulationResultsProps {
  strategy: CandidateStrategy;
  simulation: SimulationResult;
  onAcknowledgeFlag: (flagId: string, justification: string, authorizedBy: string) => void;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toLocaleString();
};

export const SimulationResults: React.FC<SimulationResultsProps> = ({
  strategy,
  simulation,
  onAcknowledgeFlag
}) => {
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedKpiExplainer, setSelectedKpiExplainer] = useState<{
    key: 'reach' | 'cpm' | 'roi' | 'engagement' | 'costPerInteraction';
    title: string;
    value: string;
    formula: string;
    explanation: string;
    benchmark: string;
  } | null>(null);

  const hasHighUnacknowledgedRisk = simulation.guardrailFlags.some(
    f => f.severity === 'high' && !f.acknowledged
  );

  const openKpiExplainer = (key: 'reach' | 'cpm' | 'roi' | 'engagement' | 'costPerInteraction') => {
    const kpi = simulation.kpiReasoning?.[key];
    const titles = {
      reach: 'Expected Campaign Reach',
      cpm: 'Expected CPM (Cost Per Mille)',
      roi: 'Estimated Earned Media ROI',
      engagement: 'Expected Engagement Rate',
      costPerInteraction: 'Cost Per Active Interaction'
    };
    const values = {
      reach: `${formatNumber(simulation.expectedTotalReach)} Impressions`,
      cpm: `$${simulation.expectedCPM}`,
      roi: `${simulation.estimatedROI}x Multiplier`,
      engagement: `${simulation.engagementRate.expected}%`,
      costPerInteraction: `$${simulation.costPerEngagedUser} / user`
    };

    if (kpi) {
      setSelectedKpiExplainer({
        key,
        title: titles[key],
        value: values[key],
        formula: kpi.formula,
        explanation: kpi.explanation,
        benchmark: kpi.benchmark
      });
    }
  };

  return (
    <div className="space-y-7">
      {/* 1. HERO LAUNCH TIER & CONFIDENCE BANNER (Light Enterprise Theme) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-sky-50/60 border-2 border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Launch Tier Badge & One-line Rationale */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mirror Engine Recommendation:
              </span>
              <TierBadge tier={simulation.launchTier} size="lg" />
              {simulation.isAiEnhanced && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Gemini 2.5 Flash Grounded Analysis
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {simulation.launchTierRationale}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
              {simulation.executiveSummary}
            </p>
          </div>

          {/* Right: Confidence Score Meter & Activation CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 shrink-0">
            {/* Confidence Gauge Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 min-w-[220px] shadow-xs">
              {/* Circular score gauge */}
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-sky-50 border-2 border-sky-400 shadow-inner shrink-0">
                <span className="text-base font-black font-mono text-sky-800">
                  {simulation.confidenceScore}
                </span>
                <span className="text-[9px] text-slate-400 absolute bottom-1 font-mono font-bold">/100</span>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Model Confidence
                </div>
                <div className="text-xs font-black text-slate-900 mt-0.5">
                  {simulation.confidenceLabel}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Grounding: 45+ Campaigns
                </div>
              </div>
            </div>

            {/* Activate CTA */}
            <button
              type="button"
              onClick={() => setIsActivationModalOpen(true)}
              disabled={hasHighUnacknowledgedRisk}
              className={`w-full px-6 py-3.5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 ${
                hasHighUnacknowledgedRisk
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-gradient-to-r from-sky-600 via-teal-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white shadow-sky-200'
              }`}
            >
              {hasHighUnacknowledgedRisk ? (
                <>
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>Activation Blocked by Guardrail</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  <span>Proceed to Activation Stage Gate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI provenance stays visible during demos and makes fallback explicit. */}
      {simulation.aiTrace && (
        <details className={`rounded-2xl border p-4 ${
          simulation.aiTrace.mode === 'fallback'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${simulation.aiTrace.mode === 'fallback' ? 'text-amber-600' : 'text-purple-600'}`} />
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">AI Analysis Trace</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
              simulation.aiTrace.mode === 'fallback' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {simulation.aiTrace.mode === 'llm_first' ? 'LIVE GEMINI LLM RESULT' : simulation.aiTrace.mode === 'llm_cache' ? 'CACHED GEMINI LLM RESULT' : 'LOCAL FALLBACK — LLM NOT USED'}
            </span>
          </summary>
          <div className="mt-3 pt-3 border-t border-slate-200/70 grid gap-2 text-xs text-slate-700">
            <p><span className="font-bold">Model:</span> {simulation.aiTrace.model}</p>
            {simulation.aiTrace.sourceFiles.length > 0 && <p><span className="font-bold">Grounded sources:</span> {simulation.aiTrace.sourceFiles.join(', ')}</p>}
            {simulation.aiTrace.responseId && <p><span className="font-bold">Gemini response ID:</span> <span className="font-mono">{simulation.aiTrace.responseId}</span></p>}
            {simulation.aiTrace.failureReason && <p className="text-amber-800"><span className="font-bold">Why LLM was skipped:</span> {simulation.aiTrace.failureReason}</p>}
            <p className="text-slate-500">
              {simulation.aiTrace.mode === 'fallback'
                ? 'The displayed KPI explanations, guardrails, and launch recommendation came from the local deterministic fallback—not an LLM response.'
                : 'KPI explanations, guardrails, and the launch recommendation are parsed from this LLM response. Cached results preserve the original LLM output for repeatable demos.'}
            </p>
          </div>
        </details>
      )}

      {/* 2. CORE METRICS GRID WITH INTERACTIVE (?) REASONING BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Expected Reach */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Expected Reach</span>
              <button
                type="button"
                onClick={() => openKpiExplainer('reach')}
                className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title="Why this number? View mathematical formula & reasoning"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
              {formatNumber(simulation.expectedTotalReach)}
            </div>
          </div>
          <div className="text-[11px] text-sky-700 font-mono font-semibold mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>CI: [{formatNumber(simulation.reachConfidenceInterval.min)} – {formatNumber(simulation.reachConfidenceInterval.max)}]</span>
          </div>
        </div>

        {/* Metric 2: Est. CPM */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Expected CPM</span>
              <button
                type="button"
                onClick={() => openKpiExplainer('cpm')}
                className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Why $8.09? View mathematical formula & channel mix cost logic"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono mt-1">
              ${simulation.expectedCPM}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Cost per 1,000 Impressions
          </div>
        </div>

        {/* Metric 3: Estimated ROI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Est. Media ROI</span>
              <button
                type="button"
                onClick={() => openKpiExplainer('roi')}
                className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Why this multiplier? View earned media formula"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono mt-1">
              {simulation.estimatedROI}x
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Earned Media Multiple
          </div>
        </div>

        {/* Metric 4: Engagement Rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Engagement Rate</span>
              <button
                type="button"
                onClick={() => openKpiExplainer('engagement')}
                className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title="Why this engagement rate? View interaction formula"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-sky-800 font-mono mt-1">
              {simulation.engagementRate.expected}%
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Range: [{simulation.engagementRate.min}% – {simulation.engagementRate.max}%]
          </div>
        </div>

        {/* Metric 5: Cost per Engaged User */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-amber-300 transition-all col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Cost / Interaction</span>
              <button
                type="button"
                onClick={() => openKpiExplainer('costPerInteraction')}
                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                title="Why this cost per interaction? View formula"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 font-mono mt-1">
              ${simulation.costPerEngagedUser}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Cost per active user interaction
          </div>
        </div>
      </div>

      {/* 3. BIG MULTI-AGENT RISK & GUARDRAIL INSPECTOR */}
      <RiskGuardrailCard
        flags={simulation.guardrailFlags}
        onAcknowledgeFlag={onAcknowledgeFlag}
      />

      {/* 4. VISUAL CHARTS: REACH VELOCITY & SENTIMENT DONUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReachVelocityChart
            data={simulation.reachTrajectory}
            expectedTotal={simulation.expectedTotalReach}
            minTotal={simulation.reachConfidenceInterval.min}
            maxTotal={simulation.reachConfidenceInterval.max}
          />
        </div>
        <div>
          <SentimentDonut
            positive={simulation.sentimentBreakdown.positive}
            neutral={simulation.sentimentBreakdown.neutral}
            negative={simulation.sentimentBreakdown.negative}
            netScore={simulation.sentimentBreakdown.netSentimentScore}
            backlashProbability={simulation.backlashProbability}
            backlashRiskLevel={simulation.backlashRiskLevel}
          />
        </div>
      </div>

      {/* 5. EXPLAINABILITY & FACTOR ATTRIBUTION */}
      <ExplainabilityPanel
        topCampaigns={simulation.topInfluencingCampaigns}
        factorDrivers={simulation.factorDrivers}
        confidenceScore={simulation.confidenceScore}
      />

      {/* Activation Hand-off Dialog */}
      <ActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        strategy={strategy}
        simulation={simulation}
      />

      {/* KPI Reasoning Modal Explainer */}
      <KpiReasoningModal
        isOpen={!!selectedKpiExplainer}
        onClose={() => setSelectedKpiExplainer(null)}
        kpiKey={selectedKpiExplainer?.key || null}
        kpiTitle={selectedKpiExplainer?.title || ''}
        kpiValue={selectedKpiExplainer?.value || ''}
        formula={selectedKpiExplainer?.formula || ''}
        explanation={selectedKpiExplainer?.explanation || ''}
        benchmark={selectedKpiExplainer?.benchmark || ''}
        isAiEnhanced={simulation.isAiEnhanced}
      />
    </div>
  );
};
