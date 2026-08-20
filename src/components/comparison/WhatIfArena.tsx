import React, { useState, useEffect } from 'react';
import type { CandidateStrategy, SimulationResult } from '../../engine/types';
import { runSimulation } from '../../engine/simulationEngine';
import { TierBadge } from '../common/Badge';
import preloadedStrategiesData from '../../data/preloaded_strategies.json';
import { 
  GitCompare, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const preloadedStrategies = preloadedStrategiesData as CandidateStrategy[];

export const WhatIfArena: React.FC = () => {
  // Select 2 or 3 strategies to compare
  const [selectedStrategies, setSelectedStrategies] = useState<CandidateStrategy[]>([
    preloadedStrategies[0], // Rexona Referee Reactive
    {
      ...preloadedStrategies[0],
      id: 'variant-b-paid',
      title: 'Variant B: $250k Paid Video Blitz',
      strategyType: 'paid_amplification',
      budget: 250000,
      channels: ['TV', 'YouTube', 'Instagram', 'TikTok'],
      timelineUrgency: 'one_week',
      creativeAngle: 'Polished broadcast video ad with 72H sweat protection stamp running across sports matches.'
    },
    {
      ...preloadedStrategies[0],
      id: 'variant-c-creator',
      title: 'Variant C: $120k Creator Co-Creation',
      strategyType: 'influencer_partnership',
      budget: 120000,
      channels: ['TikTok', 'Instagram'],
      timelineUrgency: 'one_week',
      creativeAngle: 'Fitness creators and referees testing Rexona 72H durability during extreme football drills.'
    }
  ]);

  const [simResults, setSimResults] = useState<SimulationResult[]>([]);

  useEffect(() => {
    // Run simulations for all variants
    const results = selectedStrategies.map(strat => runSimulation(strat));
    setSimResults(results);
  }, [selectedStrategies]);

  const handleBudgetChange = (index: number, newBudget: number) => {
    const updated = [...selectedStrategies];
    updated[index] = { ...updated[index], budget: newBudget };
    setSelectedStrategies(updated);
  };

  const handleStrategyTypeChange = (index: number, type: any) => {
    const updated = [...selectedStrategies];
    updated[index] = { ...updated[index], strategyType: type };
    setSelectedStrategies(updated);
  };

  // Prepare comparison chart data
  const chartData = selectedStrategies.map((strat, idx) => {
    const sim = simResults[idx];
    return {
      name: strat.title.length > 20 ? strat.title.substring(0, 20) + '...' : strat.title,
      ReachMillions: sim ? Number((sim.expectedTotalReach / 1000000).toFixed(2)) : 0,
      ROI: sim ? sim.estimatedROI : 0,
      PositiveSentiment: sim ? sim.sentimentBreakdown.positive : 0,
      BacklashRisk: sim ? sim.backlashProbability : 0,
      Confidence: sim ? sim.confidenceScore : 0
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-sky-600" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                What-If Strategy Arena & Scenario Comparison
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Evaluate trade-offs between reactive agility, paid scale, and creator risk side-by-side to optimize ROI before budget deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              {selectedStrategies.length} Active Scenarios
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {selectedStrategies.map((strat, idx) => {
          const sim = simResults[idx];
          if (!sim) return null;

          return (
            <div
              key={strat.id || idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 hover:shadow-md transition-all"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-sky-800 font-mono border border-slate-200">
                    Scenario #{idx + 1}
                  </span>
                  <TierBadge tier={sim.launchTier} size="sm" />
                </div>

                <h3 className="text-sm font-black text-slate-900 line-clamp-1" title={strat.title}>
                  {strat.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {strat.creativeAngle}
                </p>
              </div>

              {/* Dynamic Sliders to tweak scenario */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-semibold">Budget:</span>
                    <span className="font-mono font-black text-emerald-700">
                      ${strat.budget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="1000000"
                    step="10000"
                    value={strat.budget}
                    onChange={e => handleBudgetChange(idx, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Strategy Archetype:
                  </label>
                  <select
                    value={strat.strategyType}
                    onChange={e => handleStrategyTypeChange(idx, e.target.value)}
                    className="w-full bg-white border border-slate-300 text-xs text-slate-900 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-500"
                  >
                    <option value="organic_social_reactive">⚡ Organic Reactive</option>
                    <option value="paid_amplification">📢 Paid Amplification</option>
                    <option value="influencer_partnership">🤝 Influencer Co-Creation</option>
                    <option value="full_campaign_pivot">🔄 Full Campaign Pivot</option>
                  </select>
                </div>
              </div>

              {/* Key Simulated Metrics */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="font-mono font-black text-sky-800">{sim.confidenceScore}/100</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Expected Reach:</span>
                  <span className="font-mono font-black text-slate-900">
                    {(sim.expectedTotalReach / 1000000).toFixed(2)}M
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Est. Media ROI:</span>
                  <span className="font-mono font-black text-purple-700">{sim.estimatedROI}x</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Positive Sentiment:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {sim.sentimentBreakdown.positive}%
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Backlash Risk:</span>
                  <span className={`font-mono font-bold ${
                    sim.backlashProbability < 15 ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {sim.backlashProbability}% ({sim.backlashRiskLevel})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Active Guardrails:</span>
                  <span className="font-mono text-slate-700">
                    {sim.guardrailFlags.length === 0 ? (
                      <span className="text-emerald-700 font-bold">0 Flags</span>
                    ) : (
                      <span className="text-amber-800 font-bold">{sim.guardrailFlags.length} Flag(s)</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed font-medium">
                {sim.launchTierRationale}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach & ROI Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            Projected Reach (Millions) vs Expected Media ROI
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A' }} 
                  itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="ReachMillions" name="Reach (M)" fill="#0284C7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ROI" name="ROI Multiple (x)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment & Risk Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-purple-600" />
            Positive Sentiment % vs Backlash Probability %
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '0.75rem', color: '#0F172A' }} 
                  itemStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="PositiveSentiment" name="Positive Sentiment %" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="BacklashRisk" name="Backlash Risk %" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
