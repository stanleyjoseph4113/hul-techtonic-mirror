import React from 'react';
import { Modal } from '../common/Modal';
import { Calculator, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

interface KpiReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiKey: 'reach' | 'cpm' | 'roi' | 'engagement' | 'costPerInteraction' | null;
  kpiTitle: string;
  kpiValue: string;
  formula: string;
  explanation: string;
  benchmark: string;
  isAiEnhanced?: boolean;
}

export const KpiReasoningModal: React.FC<KpiReasoningModalProps> = ({
  isOpen,
  onClose,
  kpiTitle,
  kpiValue,
  formula,
  explanation,
  benchmark,
  isAiEnhanced
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Metric Logic & Attribution: ${kpiTitle}`}
      subtitle="Defensible Mathematical & AI Reasoning Breakdown"
      maxWidth="lg"
    >
      <div className="space-y-4 text-slate-800 text-xs sm:text-sm">
        {/* KPI Value Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Computed Simulated Output
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-0.5">
              {kpiValue}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 border border-sky-200 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAiEnhanced ? 'Llama-3.3 Reasoning' : 'Deterministic Prior'}</span>
          </div>
        </div>

        {/* 1. Exact Mathematical Formula */}
        <div className="bg-slate-900 text-white rounded-xl p-4 font-mono text-xs space-y-1 shadow-inner">
          <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>Mathematical Formula Applied</span>
          </div>
          <div className="text-sky-200 font-semibold pt-1 break-words">
            {formula}
          </div>
        </div>

        {/* 2. Step-by-Step Rationale */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 shadow-2xs">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Why This Number Was Generated</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {explanation}
          </p>
        </div>

        {/* 3. Industry & Category Benchmark */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-emerald-900">Unilever & FMCG Benchmark:</div>
            <div className="text-xs text-emerald-700 mt-0.5">{benchmark}</div>
          </div>
        </div>

        {/* Close */}
        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Close Explainer
          </button>
        </div>
      </div>
    </Modal>
  );
};
