import React from 'react';
import { Cpu, Sparkles, Activity } from 'lucide-react';

interface LoadingOverlayProps {
  stageText: string;
  progress: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ stageText, progress }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-cyan-500/40 rounded-2xl p-8 shadow-2xl overflow-hidden text-center">
        {/* Glowing background halo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 animate-spin opacity-40 blur-md" />
          <div className="relative w-16 h-16 rounded-xl bg-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-inner">
            <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-100 font-sans tracking-tight mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-bounce" />
          <span>Simulating Campaign Trajectory</span>
        </h3>

        {/* Stage Status */}
        <div className="min-h-[48px] flex items-center justify-center px-4 mb-6">
          <p className="text-sm font-medium text-cyan-300 font-mono transition-all duration-300">
            {stageText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 mb-3 overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-500 transition-all duration-300 ease-out rounded-full shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Deterministic Historical Engine
          </span>
          <span className="text-cyan-400 font-bold">{progress}%</span>
        </div>

        {/* Simulated computation metrics */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-800 text-left">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Historical Prior</div>
            <div className="text-xs font-semibold text-slate-200 mt-0.5">45 Campaigns</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Confidence Band</div>
            <div className="text-xs font-semibold text-cyan-400 mt-0.5">90% Empirical CI</div>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Multi-Agent</div>
            <div className="text-xs font-semibold text-purple-400 mt-0.5">3 Guardrails</div>
          </div>
        </div>
      </div>
    </div>
  );
};
