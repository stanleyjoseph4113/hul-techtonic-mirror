import React, { useState } from 'react';
import type { GuardrailFlag } from '../../engine/types';
import { RiskBadge } from '../common/Badge';
import { OverrideModal } from './OverrideModal';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2,
  Lock,
  Unlock
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

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Risk & Guardrail Screening Agent
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated screening across Brand Safety, Cultural Matrix & Legal Exclusivity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {highSeverityCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono">
              <Lock className="w-3.5 h-3.5" />
              {highSeverityCount} Blocking Flag{highSeverityCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-medium font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Guardrails Cleared
            </span>
          )}
        </div>
      </div>

      {/* Flag List */}
      {flags.length === 0 ? (
        <div className="py-6 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <div className="text-sm font-bold text-slate-200">Zero Guardrail Violations Detected</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            The creative brief passed all brand safety keyword filters, regional cultural checks, and active partner exclusivity matrices.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => {
            const isHigh = flag.severity === 'high';
            const isAcknowledged = flag.acknowledged;

            return (
              <div
                key={flag.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAcknowledged
                    ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                    : isHigh
                    ? 'bg-rose-950/20 border-rose-800/60 shadow-lg shadow-rose-950/20'
                    : 'bg-amber-950/20 border-amber-800/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <RiskBadge severity={flag.severity} />
                      <span className="text-xs font-bold text-slate-200">{flag.title}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {flag.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {flag.explanation}
                    </p>

                    <div className="text-xs text-cyan-400 bg-cyan-950/30 p-2 rounded-lg border border-cyan-900/40 mt-2">
                      <span className="font-semibold text-cyan-300">Remediation: </span>
                      {flag.remediationAdvice}
                    </div>

                    {isAcknowledged && flag.overrideJustification && (
                      <div className="mt-2 text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/50 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Override Authorized: </span>
                          <span>"{flag.overrideJustification}"</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Override Button for High & Medium severity flags */}
                  {!isAcknowledged && (
                    <div className="shrink-0 pt-1 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedFlagForOverride(flag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isHigh
                            ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-900/30'
                            : 'bg-amber-600/80 hover:bg-amber-500 text-white border-amber-500'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Acknowledge & Justify</span>
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
