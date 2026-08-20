import { useState, useEffect } from 'react';
import { useSimulation } from './hooks/useSimulation';
import { Header } from './components/common/Header';
import { LoadingOverlay } from './components/common/LoadingOverlay';
import { StrategyInputForm } from './components/studio/StrategyInputForm';
import { SimulationResults } from './components/studio/SimulationResults';
import { WhatIfArena } from './components/comparison/WhatIfArena';
import { CalibrationDashboard } from './components/calibration/CalibrationDashboard';
import { AuditTrail } from './components/audit/AuditTrail';
import { AboutModal } from './components/modals/AboutModal';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'comparison' | 'calibration' | 'audit'>('studio');
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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

  // Run initial simulation on mount to immediately wow the viewer with pre-computed Rexona referee candidate
  useEffect(() => {
    if (!currentResult) {
      runSim();
    }
  }, []);

  const handleInspectAuditEntry = (entry: any) => {
    setCurrentStrategy(entry.strategy);
    setActiveTab('studio');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
        historyCount={auditHistory.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Active Tab Views */}
        {activeTab === 'studio' && (
          <div className="space-y-8">
            {/* Strategy Input Configuration Panel */}
            <StrategyInputForm
              strategy={currentStrategy}
              onChange={setCurrentStrategy}
              onSimulate={() => runSim(currentStrategy)}
              isLoading={isLoading}
            />

            {/* Simulation Results View */}
            {currentResult && (
              <SimulationResults
                strategy={currentStrategy}
                simulation={currentResult}
                onAcknowledgeFlag={acknowledgeGuardrailFlag}
              />
            )}
          </div>
        )}

        {activeTab === 'comparison' && <WhatIfArena />}

        {activeTab === 'calibration' && <CalibrationDashboard />}

        {activeTab === 'audit' && (
          <AuditTrail
            auditLog={auditHistory}
            onSelectEntry={handleInspectAuditEntry}
            onClearHistory={clearHistory}
            onDeleteEntry={deleteAuditEntry}
          />
        )}
      </main>

      {/* Simulated Multi-Step AI Processing Screen */}
      {isLoading && (
        <LoadingOverlay
          stageText={simulationStageText}
          progress={stageProgress}
        />
      )}

      {/* About / Techtonic Context Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-[#070A11] py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Mirror</span>
            <span>•</span>
            <span>Unilever Techtonic Season 8 Innovation Prototype</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Zero-Cost Static Engine</span>
            <span>•</span>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="text-cyan-400 hover:underline"
            >
              Case Context & Model Math
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
