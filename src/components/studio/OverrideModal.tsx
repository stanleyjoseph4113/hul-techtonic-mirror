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
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-rose-900">{flag.title}</div>
            <p className="text-xs text-rose-700 mt-1">{flag.explanation}</p>
            <div className="mt-2 text-[11px] font-mono font-bold text-rose-800 bg-white px-2 py-1 rounded border border-rose-200 inline-block">
              Trigger Pattern: "{flag.matchedTrigger}"
            </div>
          </div>
        </div>

        {/* Remediation Advice */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
          <span className="font-bold text-sky-800 block mb-1">Recommended Remediation:</span>
          {flag.remediationAdvice}
        </div>

        {/* Authorized Signer */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            Authorizing Stakeholder / Role
          </label>
          <input
            type="text"
            value={authorizedBy}
            onChange={e => setAuthorizedBy(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Business Justification */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Mandatory Business Justification & Risk Mitigation Note
          </label>
          <textarea
            rows={3}
            value={justification}
            onChange={e => setJustification(e.target.value)}
            placeholder="e.g. Legal clearance obtained under Fast-Track Referee Agreement ref #PL-2024-91. Independent lab test certificate attached."
            required
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>

        {/* Compliance Confirmation Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="complianceCheck"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <label htmlFor="complianceCheck" className="text-xs text-slate-600 leading-snug cursor-pointer font-medium">
            I confirm this override will be logged in the immutable Unilever Mirror Audit Trail and that legal/brand safety counsel has been notified.
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!justification.trim() || !agreed}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sign & Authorize Override</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
