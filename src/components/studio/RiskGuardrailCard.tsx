import React, { useState } from 'react';
import type { GuardrailFlag } from '../../engine/types';
import { RiskBadge } from '../common/Badge';
import { OverrideModal } from './OverrideModal';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Scale, 
  FileCheck, 
  Globe2, 
  Info
} from 'lucide-react';

interface RiskGuardrailCardProps {
  flags: GuardrailFlag[];
  onAcknowledgeFlag: (flagId: string, justification: string, authorizedBy: string) => void;
}

export const RiskGuardrailCard: React.FC<RiskGuardrailCardProps> = ({
  flags,
  onAcknowledgeFlag
}) => {
  const [selectedFlagForOverride, setSelectedFlagForOverride] = useState<GuardrailFlag | null>(null);

  const highSeverityCount = flags.filter(f => f.severity === 'high' && !f.acknowledged).length;
  const mediumSeverityCount = flags.filter(f => f.severity === 'medium' && !f.acknowledged).length;
  const acknowledgedCount = flags.filter(f => f.acknowledged).length;

  const brandSafetyFlags = flags.filter(f => f.type === 'brand_safety');
  const culturalFlags = flags.filter(f => f.type === 'cultural_sensitivity');
  const legalIpFlags = flags.filter(f => f.type === 'legal_ip');

  return (
    <div className="bg-white border-2 border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-md">
      {/* Big Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Risk & Multi-Agent Guardrail Screening System
                </h3>
                <span className="text-[11px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  Autonomous Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Automated multi-agent screening across Unilever Brand Safety, Regional Cultural Laws & Active IP Exclusivity
              </p>
            </div>
          </div>
        </div>

        {/* Global Screening Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {highSeverityCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 shadow-xs">
              <Lock className="w-4 h-4 text-rose-600 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                {highSeverityCount} Critical Blocking Violation{highSeverityCount > 1 ? 's' : ''}
              </span>
            </div>
          ) : mediumSeverityCount > 0 ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                {mediumSeverityCount} Advisory Flag{mediumSeverityCount > 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                All Guardrails Cleared (100% Pass)
              </span>
            </div>
          )}

          {acknowledgedCount > 0 && (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              {acknowledgedCount} Override Logged
            </span>
          )}
        </div>
      </div>

      {/* 3 Pillar Multi-Agent Scanner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {/* Pillar 1: Brand Safety */}
        <div className={`p-4 rounded-xl border transition-all ${
          brandSafetyFlags.length > 0
            ? 'bg-rose-50/70 border-rose-300'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-rose-600" />
              1. Brand Safety
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              brandSafetyFlags.length > 0 ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {brandSafetyFlags.length > 0 ? `${brandSafetyFlags.length} Flag(s)` : 'Passed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Scans competitor brand names, unsubstantiated efficacy claims, and brand tone compliance.
          </p>
        </div>

        {/* Pillar 2: Cultural Sensitivity */}
        <div className={`p-4 rounded-xl border transition-all ${
          culturalFlags.length > 0
            ? 'bg-amber-50/70 border-amber-300'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-amber-600" />
              2. Cultural Matrix
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              culturalFlags.length > 0 ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {culturalFlags.length > 0 ? `${culturalFlags.length} Flag(s)` : 'Passed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Evaluates regional advertising laws (German UWG §6, UK Green Claims, Indonesian Halal norms).
          </p>
        </div>

        {/* Pillar 3: Active IP & Partnerships */}
        <div className={`p-4 rounded-xl border transition-all ${
          legalIpFlags.length > 0
            ? 'bg-purple-50/70 border-purple-300'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-600" />
              3. Legal & Exclusivity
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              legalIpFlags.length > 0 ? 'bg-purple-200 text-purple-900' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {legalIpFlags.length > 0 ? `${legalIpFlags.length} Flag(s)` : 'Passed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Checks active contract covenants (e.g. Dove No Digital Distortion Pledge, Premier League kit rights).
          </p>
        </div>
      </div>

      {/* Flagged Item Cards */}
      {flags.length === 0 ? (
        <div className="py-8 px-4 text-center bg-slate-50 rounded-xl border border-slate-200">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-90" />
          <div className="text-sm font-bold text-slate-800">Clean Campaign Brief — Zero Flags Raised</div>
          <p className="text-xs text-slate-500 max-w-lg mx-auto mt-1">
            This creative strategy complies with all Unilever global advertising standards, category exclusivity pledges, and regional cultural sensitivity matrices.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Detected Policy Alerts & Recommended Actions ({flags.length})
          </div>

          {flags.map((flag) => {
            const isHigh = flag.severity === 'high';
            const isAcknowledged = flag.acknowledged;

            return (
              <div
                key={flag.id}
                className={`p-5 rounded-2xl border-2 transition-all shadow-xs ${
                  isAcknowledged
                    ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-90'
                    : isHigh
                    ? 'bg-rose-50/90 border-rose-300 shadow-rose-100'
                    : 'bg-amber-50/90 border-amber-300 shadow-amber-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Badge Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskBadge severity={flag.severity} size="md" />
                      <span className="text-sm font-extrabold text-slate-900">{flag.title}</span>
                      <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-300">
                        {flag.type.replace('_', ' ')}
                      </span>
                      {isHigh && !isAcknowledged && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white shadow-xs">
                          Deployment Blocked
                        </span>
                      )}
                    </div>

                    {/* Policy Explanation */}
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {flag.explanation}
                    </p>

                    {/* Matched Pattern */}
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-700 bg-white/90 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span className="text-slate-400 font-bold">Trigger Match:</span>
                      <span className="font-bold text-rose-700">"{flag.matchedTrigger}"</span>
                    </div>

                    {/* Actionable Remediation Box */}
                    <div className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-slate-200 mt-2 shadow-2xs">
                      <div className="font-bold text-sky-800 flex items-center gap-1.5 mb-0.5">
                        <Info className="w-3.5 h-3.5 text-sky-600" />
                        <span>Actionable Remediation Protocol:</span>
                      </div>
                      <p className="text-slate-600">{flag.remediationAdvice}</p>
                    </div>

                    {/* Acknowledged Banner */}
                    {isAcknowledged && flag.overrideJustification && (
                      <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Authorized Override Logged: </span>
                          <span>"{flag.overrideJustification}"</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Override Button */}
                  {!isAcknowledged && (
                    <div className="shrink-0 pt-1 lg:pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedFlagForOverride(flag)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
                          isHigh
                            ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-rose-200'
                            : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                        }`}
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Acknowledge & Sign Justification</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Override Dialog Modal */}
      <OverrideModal
        isOpen={!!selectedFlagForOverride}
        onClose={() => setSelectedFlagForOverride(null)}
        flag={selectedFlagForOverride}
        onConfirmOverride={onAcknowledgeFlag}
      />
    </div>
  );
};
