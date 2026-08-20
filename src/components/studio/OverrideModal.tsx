import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { GuardrailFlag } from '../../engine/types';
import { ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  flag: GuardrailFlag | null;
  onConfirmOverride: (flagId: string, justification: string, authorizedBy: string) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  flag,
  onConfirmOverride
}) => {
  const [justification, setJustification] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Brand Director (Global Media)');
  const [agreed, setAgreed] = useState(false);

  if (!flag) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || !agreed) return;
    onConfirmOverride(flag.id, justification, authorizedBy);
    setJustification('');
    setAgreed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Acknowledge & Override Risk Guardrail"
      subtitle="Unilever Governance & Brand Safety Compliance Protocol"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flag Summary Banner */}
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-200">{flag.title}</div>
            <p className="text-xs text-rose-300/80 mt-1">{flag.explanation}</p>
            <div className="mt-2 text-[11px] font-mono text-rose-400 bg-rose-950/80 px-2 py-1 rounded border border-rose-800/40 inline-block">
              Trigger Pattern: "{flag.matchedTrigger}"
            </div>
          </div>
        </div>

        {/* Remediation Advice */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-300">
          <span className="font-bold text-cyan-400 block mb-1">Recommended Remediation:</span>
          {flag.remediationAdvice}
        </div>

        {/* Authorized Signer */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            Authorizing Stakeholder / Role
          </label>
          <input
            type="text"
            value={authorizedBy}
            onChange={e => setAuthorizedBy(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Business Justification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Mandatory Business Justification & Risk Mitigation Note
          </label>
          <textarea
            rows={3}
            value={justification}
            onChange={e => setJustification(e.target.value)}
            placeholder="e.g. Legal clearance obtained under Fast-Track Referee Agreement ref #PL-2024-91. Independent lab test certificate attached."
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Compliance Confirmation Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="complianceCheck"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-slate-900"
          />
          <label htmlFor="complianceCheck" className="text-xs text-slate-300 leading-snug cursor-pointer">
            I confirm this override will be logged in the immutable Unilever Mirror Audit Trail and that legal/brand safety counsel has been notified.
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!justification.trim() || !agreed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sign & Authorize Override</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
