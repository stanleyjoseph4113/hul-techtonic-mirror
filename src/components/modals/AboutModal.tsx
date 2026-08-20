import React from 'react';
import { Modal } from '../common/Modal';
import { 
  Layers, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Code2
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mirror: Simulation & Risk Engine"
      subtitle="Unilever Techtonic Season 8 Innovation Challenge Prototype"
      maxWidth="3xl"
    >
      <div className="space-y-6 text-slate-700 text-xs sm:text-sm">
        {/* 1. Problem Statement & Business Opportunity */}
        <div className="bg-gradient-to-br from-sky-50 via-white to-purple-50 border border-sky-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center gap-2 text-sky-800 font-bold uppercase text-xs tracking-wider mb-2">
            <Zap className="w-4 h-4 text-sky-600" />
            <span>The Business Challenge</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            Closing the Speed Gap from Cultural Moment to Live Brand Action
          </h3>
          <p className="leading-relaxed text-slate-600 text-xs font-medium">
            Unilever brand teams frequently discover viral cultural opportunities too late (e.g. an organic Rexona logo visibility on a Premier League referee's armband during a televised match). By the time multi-tiered approvals, legal reviews, and media plans pass traditional gates, the 24-hour cultural moment has evaporated.
          </p>
        </div>

        {/* 2. Closed AI Loop Diagram */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            Unilever's 6-Stage Autonomous AI Brand Loop
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase">1. Sense (Pulse)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Real-time agent detects trending cultural moments and scores brand relevance.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase">2. Strategize (Compass)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Agent generates 3-5 candidate response strategies across channels.
              </p>
            </div>

            <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-300 ring-1 ring-sky-300 shadow-2xs">
              <div className="text-[11px] font-bold text-sky-950 uppercase flex items-center gap-1">
                <span>3. Simulate (Mirror)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
              </div>
              <p className="text-[11px] text-sky-900 mt-1 font-semibold">
                Predicts reach, sentiment & backlash; gates launch tier before real spend.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase">4. Activate</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Automated stage-gated micro-testing and media execution.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase">5. Measure (Echo)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Continuous live tracking of social sentiment and conversion lift.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase">6. Learn</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Actuals feed back into Mirror to recalibrate historical priors.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Mathematical & Simulation Defensibility */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-2xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            Simulation Engine Mathematical Foundations
          </h4>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Multi-Attribute k-NN Similarity:</strong> Matches candidate strategies with 45+ synthetic Unilever campaigns across Brand ($w=0.25$), Strategy Type ($w=0.30$), Market ($w=0.20$), Channels ($w=0.15$), and Budget ($w=0.10$).
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Sub-Linear Budget Elasticity:</strong> Projects reach using empirical diminishing returns exponent (BudgetRatio)^0.68.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">14-Day Velocity & 90% Confidence Bands:</strong> Models daily reach accumulation with channel-specific Weibull decay curves (e.g. TikTok front-load vs TV sustained build).
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Multi-Agent Guardrails:</strong> Screens content against competitor blocklists, regional cultural laws (German UWG §6, UK Green Claims, Indonesian Halal protocol), and active IP contracts.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Zero-Cost & Static Hosting Transparency */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Cost Client-Side Architecture</span>
          </div>
          <p>
            This prototype runs 100% in the browser with zero external server dependencies. Powered by NVIDIA API / Llama-3.3-70B model with full deterministic client-side fallbacks.
          </p>
        </div>

        {/* Close Button */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Close & Explore Prototype
          </button>
        </div>
      </div>
    </Modal>
  );
};
