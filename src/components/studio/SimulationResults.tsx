import React, { useState } from 'react';
import type { CandidateStrategy, SimulationResult } from '../../engine/types';
import { TierBadge } from '../common/Badge';
import { ReachVelocityChart } from './ReachVelocityChart';
import { SentimentDonut } from './SentimentDonut';
import { RiskGuardrailCard } from './RiskGuardrailCard';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { ActivationModal } from './ActivationModal';
import { 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity, 
  Lock
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

  const hasHighUnacknowledgedRisk = simulation.guardrailFlags.some(
    f => f.severity === 'high' && !f.acknowledged
  );

  return (
    <div className="space-y-6">
      {/* 1. HERO LAUNCH TIER & CONFIDENCE BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#101827] to-slate-950 border border-slate-700/80 rounded-2xl p-6 shadow-2xl">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Launch Tier Badge & One-line Rationale */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mirror Engine Recommendation:
              </span>
              <TierBadge tier={simulation.launchTier} size="lg" />
              {simulation.isAiEnhanced && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Gemini Enhanced
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {simulation.launchTierRationale}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {simulation.executiveSummary}
            </p>
          </div>

          {/* Right: Confidence Score Meter & Activation CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-4 shrink-0">
            {/* Confidence Gauge Card */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center gap-4 min-w-[220px]">
              {/* Circular score gauge */}
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-slate-900 border-2 border-cyan-400/40 shadow-inner shrink-0">
                <span className="text-base font-extrabold font-mono text-cyan-300">
                  {simulation.confidenceScore}
                </span>
                <span className="text-[9px] text-slate-400 absolute bottom-1.5 font-mono">/100</span>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Model Confidence
                </div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">
                  {simulation.confidenceLabel}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Grounding: 45+ Campaigns
                </div>
              </div>
            </div>

            {/* Activate CTA */}
            <button
              type="button"
              onClick={() => setIsActivationModalOpen(true)}
              disabled={hasHighUnacknowledgedRisk}
              className={`w-full px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                hasHighUnacknowledgedRisk
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/25'
              }`}
            >
              {hasHighUnacknowledgedRisk ? (
                <>
                  <Lock className="w-4 h-4 text-rose-400" />
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

      {/* 2. CORE METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Expected Reach */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expected Reach</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
            {formatNumber(simulation.expectedTotalReach)}
          </div>
          <div className="text-[11px] text-cyan-400/90 font-mono mt-1">
            90% CI: [{formatNumber(simulation.reachConfidenceInterval.min)} – {formatNumber(simulation.reachConfidenceInterval.max)}]
          </div>
        </div>

        {/* Metric 2: Est. CPM */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Expected CPM</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            ${simulation.expectedCPM}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cost per 1,000 Impressions
          </div>
        </div>

        {/* Metric 3: Estimated ROI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Est. Media ROI</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono mt-1">
            {simulation.estimatedROI}x
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Earned Media Multiple
          </div>
        </div>

        {/* Metric 4: Engagement Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Engagement Rate</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-cyan-300 font-mono mt-1">
            {simulation.engagementRate.expected}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Range: [{simulation.engagementRate.min}% – {simulation.engagementRate.max}%]
          </div>
        </div>

        {/* Metric 5: Cost per Engaged User */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cost / Interaction</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono mt-1">
            ${simulation.costPerEngagedUser}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Cost per active interaction
          </div>
        </div>
      </div>

      {/* 3. VISUAL CHARTS: REACH VELOCITY & SENTIMENT DONUT */}
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

      {/* 4. RISK & GUARDRAIL INSPECTOR */}
      <RiskGuardrailCard
        flags={simulation.guardrailFlags}
        onAcknowledgeFlag={onAcknowledgeFlag}
      />

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
    </div>
  );
};
