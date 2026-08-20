import React, { useState } from 'react';
import type { HistoricalCampaign, FactorDriver } from '../../engine/types';
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  History
} from 'lucide-react';

interface ExplainabilityPanelProps {
  topCampaigns: HistoricalCampaign[];
  factorDrivers: FactorDriver[];
  confidenceScore: number;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  topCampaigns,
  factorDrivers,
  confidenceScore
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-lg overflow-hidden">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-850/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Why This Prediction?</span>
              <span className="text-[11px] font-mono font-normal normal-case text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Transparent Attribution Engine
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Deconstructed historical priors and algorithmic factor drivers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Confidence: {confidenceScore}/100
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 pt-0 border-t border-slate-800/60 space-y-5">
          {/* Factor Attribution Drivers */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Primary Factor Drivers (Score Attribution)
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {factorDrivers.map((driver, idx) => {
                const isPos = driver.impactType === 'positive';
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      isPos 
                        ? 'bg-emerald-950/20 border-emerald-800/40' 
                        : 'bg-rose-950/20 border-rose-800/40'
                    }`}
                  >
                    <div className={`p-1 rounded-md shrink-0 mt-0.5 ${
                      isPos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        <span className={isPos ? 'text-emerald-300' : 'text-rose-300'}>
                          {driver.factor}
                        </span>
                        <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          isPos ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {isPos ? `+${driver.impactPercentage}%` : `${driver.impactPercentage}%`}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
                        {driver.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nearest Historical Campaigns */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" />
              Influencing Historical Campaigns (Top {topCampaigns.length} Nearest Neighbors)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {camp.brandId}
                      </span>
                      <span className="text-[10px] text-purple-300 font-mono">
                        {camp.similarityScore ? `${Math.round(camp.similarityScore * 100)}% Match` : ''}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-200 line-clamp-1" title={camp.campaignName}>
                      {camp.campaignName}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                      <span>{camp.market}</span>
                      <span>•</span>
                      <span>${(camp.budget / 1000).toFixed(0)}k</span>
                      <span>•</span>
                      <span>{camp.year}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Actual Reach:</span>
                      <span className="font-bold text-emerald-400">{(camp.actualOutcome.reach / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Positive Sentiment:</span>
                      <span className="font-bold text-cyan-400">{Math.round(camp.actualOutcome.sentimentSplit.positive * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>ROI Multiple:</span>
                      <span className="font-bold text-purple-400">{camp.actualOutcome.roi}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
