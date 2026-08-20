import React from 'react';
import { Modal } from '../common/Modal';
import type { CandidateStrategy, SimulationResult } from '../../engine/types';
import { TierBadge } from '../common/Badge';
import confetti from 'canvas-confetti';
import { Rocket, Layers } from 'lucide-react';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: CandidateStrategy;
  simulation: SimulationResult;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onClose,
  strategy,
  simulation
}) => {
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Strategy Hand-off: Downstream Activation"
      subtitle="Connecting Mirror Simulation to Live Media & Community Activation"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Tier Announcement Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="mb-3 flex justify-center">
            <TierBadge tier={simulation.launchTier} size="lg" />
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-1">
            Ready for Stage-Gated Deployment
          </h3>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed font-medium">
            {simulation.launchTierRationale}
          </p>
        </div>

        {/* Stage-Gating Playbook */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            Downstream Activation Protocol & Stage Gates
          </h4>
          <div className="space-y-2">
            {simulation.gatingRecommendations.map((gate, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs flex items-start gap-3 shadow-2xs"
              >
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-slate-700 leading-relaxed font-medium">{gate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Hand-off Specs Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Authorized Media</div>
            <div className="font-black text-emerald-700 mt-1 font-mono">
              ${simulation.launchTier === 'micro_test' ? '25,000' : strategy.budget.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Target Markets</div>
            <div className="font-bold text-slate-800 mt-1 truncate">
              {strategy.markets.join(', ')}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Active Channels</div>
            <div className="font-bold text-purple-700 mt-1 truncate">
              {strategy.channels.join(', ')}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Echo Sentinel</div>
            <div className="font-bold text-sky-700 mt-1">Enabled (Real-Time)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Return to Simulator
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerConfetti();
                alert(`Strategy "${strategy.title}" successfully dispatched to Unilever Activate & Echo Sentinel.`);
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 via-teal-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white shadow-sm flex items-center gap-2 transition-all"
            >
              <Rocket className="w-4 h-4" />
              <span>Dispatch to Activation Loop</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
