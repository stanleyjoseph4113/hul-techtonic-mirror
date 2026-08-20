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
        <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="mb-3 flex justify-center">
            <TierBadge tier={simulation.launchTier} size="lg" />
          </div>

          <h3 className="text-lg font-bold text-white mb-1">
            Ready for Stage-Gated Deployment
          </h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
            {simulation.launchTierRationale}
          </p>
        </div>

        {/* Stage-Gating Playbook */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Downstream Activation Protocol & Stage Gates
          </h4>
          <div className="space-y-2">
            {simulation.gatingRecommendations.map((gate, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{gate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Hand-off Specs Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Authorized Media</div>
            <div className="font-extrabold text-emerald-400 mt-1 font-mono">
              ${simulation.launchTier === 'micro_test' ? '25,000' : strategy.budget.toLocaleString()}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Target Markets</div>
            <div className="font-bold text-slate-200 mt-1 truncate">
              {strategy.markets.join(', ')}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Active Channels</div>
            <div className="font-bold text-purple-400 mt-1 truncate">
              {strategy.channels.join(', ')}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Echo Sentinel</div>
            <div className="font-bold text-cyan-400 mt-1">Enabled (Real-Time)</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-teal-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
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
