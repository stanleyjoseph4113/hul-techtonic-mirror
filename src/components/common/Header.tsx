import React from 'react';
import { 
  Layers, 
  GitCompare, 
  LineChart, 
  History, 
  HelpCircle, 
  ArrowRight
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'studio' | 'comparison' | 'calibration' | 'audit';
  setActiveTab: (tab: 'studio' | 'comparison' | 'calibration' | 'audit') => void;
  onOpenAbout: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAbout,
  historyCount
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-400 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 text-lg">M</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                  Mirror
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Unilever Techtonic S8
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Simulation & Risk Engine for Brand Strategy
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>What-If Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('calibration')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calibration'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span className="hidden md:inline">Echo Calibration</span>
              <span className="md:hidden">Calibration</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Log</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-cyan-500/30 text-cyan-300 font-mono">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
              title="Techtonic Context & How Mirror Works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Case & Architecture</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Simulate Phase Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Closed AI Loop Breadcrumb Ribbon */}
      <div className="bg-[#080C14] border-t border-slate-900 px-4 py-1 text-[11px] text-slate-400 flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="text-slate-400">Unilever AI Loop:</span>
        <span className="text-slate-400">Pulse (Sense)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">Compass (Strategize)</span>
        <ArrowRight className="w-3 h-3 text-cyan-400 font-bold" />
        <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
          ▶ Mirror (Simulate & Risk)
        </span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">Activate (Tiered Rollout)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">Echo (Measure)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-400">Learn (Recalibrate)</span>
      </div>
    </header>
  );
};
