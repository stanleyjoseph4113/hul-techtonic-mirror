import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { StrategyInputForm } from './components/studio/StrategyInputForm';
import { SimulationResults } from './components/studio/SimulationResults';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { CampaignCalendar } from './components/studio/CampaignCalendar';
import { WhatIfArena } from './components/comparison/WhatIfArena';
import { CalibrationDashboard } from './components/calibration/CalibrationDashboard';
import { AuditTrail } from './components/audit/AuditTrail';
import { AboutModal } from './components/modals/AboutModal';
import { useSimulation } from './hooks/useSimulation';
import type { AuditLogEntry } from './engine/types';
import { Calendar, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'comparison' | 'calibration' | 'audit'>('studio');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(true);

  const {
    currentStrategy,
    setCurrentStrategy,
    currentResult,
    isLoading,
    simulationStageText,
    stageProgress,
    auditHistory,
    runSim,
    acknowledgeGuardrailFlag,
    clearHistory,
    deleteAuditEntry
  } = useSimulation();

  const handleSelectAuditEntry = (entry: AuditLogEntry) => {
    setCurrentStrategy(entry.strategy);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500/20 selection:text-sky-900 font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
        historyCount={auditHistory.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {activeTab === 'studio' && (
          <div className="space-y-7">
            {/* Cultural Calendar & Pulse Schedule Toggle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 font-mono">
                    Cultural Moment Radar & Strategy Builder
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all shadow-2xs"
                >
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{showCalendar ? 'Hide Cultural Schedule' : 'Show Cultural Schedule'}</span>
                </button>
              </div>

              {showCalendar && (
                <CampaignCalendar
                  onSelectStrategy={setCurrentStrategy}
                  currentStrategyId={currentStrategy.id}
                />
              )}
            </div>

            {/* Strategy Input Form (Top Half) */}
            <StrategyInputForm
              strategy={currentStrategy}
              onChange={setCurrentStrategy}
              onSimulate={() => { runSim(); }}
              isLoading={isLoading}
            />

            {/* Simulation Results (Bottom Half) */}
            {currentResult && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 font-mono">
                    Live Simulation & Risk Analysis Output
                  </h3>
                </div>
                <SimulationResults
                  strategy={currentStrategy}
                  simulation={currentResult}
                  onAcknowledgeFlag={acknowledgeGuardrailFlag}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && <WhatIfArena />}

        {activeTab === 'calibration' && <CalibrationDashboard />}

        {activeTab === 'audit' && (
          <AuditTrail
            auditLog={auditHistory}
            onSelectEntry={handleSelectAuditEntry}
            onClearHistory={clearHistory}
            onDeleteEntry={deleteAuditEntry}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">Unilever Techtonic S8</span>
            <span>•</span>
            <span>Mirror: AI Simulation & Risk Engine</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Zero-Cost Client-Side Architecture • Deterministic Prior Engine
          </div>
        </div>
      </footer>

      {/* Animated Loading Overlay */}
      {isLoading && (
        <LoadingOverlay
          stageText={simulationStageText}
          progress={stageProgress}
        />
      )}

      {/* About / Context Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
};

export default App;
