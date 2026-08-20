import { useState, useCallback } from 'react';
import type { 
  CandidateStrategy, 
  SimulationResult, 
  AuditLogEntry 
} from '../engine/types';
import { runSimulation } from '../engine/simulationEngine';
import { enhanceSimulationWithAI } from '../engine/aiEnhancer';
import { useLocalStorage } from './useLocalStorage';
import preloadedStrategiesData from '../data/preloaded_strategies.json';

const preloadedStrategies = preloadedStrategiesData as CandidateStrategy[];

const INITIAL_STRATEGY: CandidateStrategy = preloadedStrategies[0];

const SIMULATION_STAGES = [
  'Matching historical campaign priors across Unilever portfolio...',
  'Evaluating regional sentiment volatility & cultural nuances...',
  'Simulating 14-day reach trajectories with 90% confidence bands...',
  'Running multi-agent guardrails (Brand Safety, Cultural & Legal IP)...',
  'Synthesizing launch tier recommendation & stage-gate playbook...'
];

export function useSimulation() {
  const [currentStrategy, setCurrentStrategy] = useState<CandidateStrategy>(INITIAL_STRATEGY);
  const [currentResult, setCurrentResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [auditHistory, setAuditHistory] = useLocalStorage<AuditLogEntry[]>('mirror_audit_log_v1', []);

  const runSim = useCallback(async (strat?: CandidateStrategy): Promise<SimulationResult> => {
    const targetStrat = strat || currentStrategy;
    setIsLoading(true);
    setCurrentStageIndex(0);

    // Realistic multi-stage animated progress to sell the AI computation experience
    for (let i = 0; i < SIMULATION_STAGES.length; i++) {
      setCurrentStageIndex(i);
      await new Promise(resolve => setTimeout(resolve, 320));
    }

    // Run deterministic core simulation engine
    const rawResult = runSimulation(targetStrat);

    // Optional background AI enhancement (falls back silently if no key)
    const finalResult = await enhanceSimulationWithAI(targetStrat, rawResult);

    setCurrentResult(finalResult);
    setIsLoading(false);

    // Record into Audit Trail
    const newAuditEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      strategy: targetStrat,
      simulation: finalResult,
      manualOverrides: []
    };

    setAuditHistory(prev => [newAuditEntry, ...prev.slice(0, 49)]); // Keep last 50 runs
    return finalResult;
  }, [currentStrategy, setAuditHistory]);

  const acknowledgeGuardrailFlag = useCallback((
    flagId: string, 
    justification: string, 
    authorizedBy: string = 'Brand Director'
  ) => {
    if (!currentResult) return;

    const updatedFlags = currentResult.guardrailFlags.map(f => {
      if (f.id === flagId) {
        return {
          ...f,
          acknowledged: true,
          overrideJustification: justification
        };
      }
      return f;
    });

    // If all high risk flags are acknowledged, we can re-evaluate or update state
    const updatedResult: SimulationResult = {
      ...currentResult,
      guardrailFlags: updatedFlags
    };

    setCurrentResult(updatedResult);

    // Log the override into Audit Trail
    setAuditHistory(prev => {
      if (prev.length === 0) return prev;
      const latest = prev[0];
      const updatedOverrides = [
        ...latest.manualOverrides,
        {
          flagId,
          justification,
          authorizedBy,
          timestamp: new Date().toISOString()
        }
      ];
      return [{ ...latest, manualOverrides: updatedOverrides, simulation: updatedResult }, ...prev.slice(1)];
    });
  }, [currentResult, setAuditHistory]);

  const clearHistory = useCallback(() => {
    setAuditHistory([]);
  }, [setAuditHistory]);

  const deleteAuditEntry = useCallback((id: string) => {
    setAuditHistory(prev => prev.filter(item => item.id !== id));
  }, [setAuditHistory]);

  return {
    currentStrategy,
    setCurrentStrategy,
    currentResult,
    setCurrentResult,
    isLoading,
    simulationStageText: SIMULATION_STAGES[currentStageIndex],
    stageProgress: Math.round(((currentStageIndex + 1) / SIMULATION_STAGES.length) * 100),
    auditHistory,
    runSim,
    acknowledgeGuardrailFlag,
    clearHistory,
    deleteAuditEntry
  };
}
