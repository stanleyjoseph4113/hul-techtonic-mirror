import React from 'react';
import { Cpu, Sparkles, Activity } from 'lucide-react';

interface LoadingOverlayProps {
  stageText: string;
  progress: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ stageText, progress }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl overflow-hidden text-center">
        {/* Glow ambient */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 animate-spin opacity-30 blur-md" />
          <div className="relative w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-xs">
            <Cpu className="w-8 h-8 text-sky-600 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-900 font-sans tracking-tight mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-600 animate-bounce" />
          <span>Simulating Campaign Trajectory</span>
        </h3>

        {/* Stage Status */}
        <div className="min-h-[48px] flex items-center justify-center px-4 mb-6">
          <p className="text-sm font-semibold text-sky-700 font-mono transition-all duration-300">
            {stageText}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-sky-500 via-teal-500 to-purple-600 transition-all duration-300 ease-out rounded-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
          <span className="flex items-center gap-1.5 font-semibold">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            Deterministic Historical Engine
          </span>
          <span className="text-sky-700 font-black">{progress}%</span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100 text-left">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Historical Prior</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">45 Campaigns</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Confidence Band</div>
            <div className="text-xs font-bold text-sky-700 mt-0.5">90% Empirical CI</div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Multi-Agent</div>
            <div className="text-xs font-bold text-purple-700 mt-0.5">3 Guardrails</div>
          </div>
        </div>
      </div>
    </div>
  );
};
