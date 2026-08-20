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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-teal-500 to-purple-600 p-[1.5px] shadow-sm">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600 text-lg">M</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-slate-900 font-sans">
                  Mirror
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  Unilever Techtonic S8
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Simulation & Risk Engine for Brand Strategy
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'studio'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>What-If Arena</span>
            </button>

            <button
              onClick={() => setActiveTab('calibration')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calibration'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Log</span>
              {historyCount > 0 && (
                <span className="w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-mono font-bold border border-sky-200">
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAbout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-all"
              title="Techtonic Context & How Mirror Works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">Case & Architecture</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Simulate Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Closed AI Loop Breadcrumb Ribbon */}
      <div className="bg-slate-100/90 border-t border-slate-200/80 px-4 py-1 text-[11px] text-slate-600 flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="font-bold text-slate-700">Unilever AI Loop:</span>
        <span className="text-slate-500">Pulse (Sense)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-500">Compass (Strategize)</span>
        <ArrowRight className="w-3 h-3 text-sky-600 font-bold" />
        <span className="text-sky-800 font-bold bg-sky-100/90 px-2 py-0.5 rounded border border-sky-300">
          ▶ Mirror (Simulate & Risk)
        </span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-500">Activate (Tiered Rollout)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-500">Echo (Measure)</span>
        <ArrowRight className="w-3 h-3 text-slate-400" />
        <span className="text-slate-500">Learn (Recalibrate)</span>
      </div>
    </header>
  );
};
