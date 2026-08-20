import React, { useState } from 'react';
import type { CandidateStrategy, Brand } from '../../engine/types';
import preloadedStrategiesData from '../../data/preloaded_strategies.json';
import brandsData from '../../data/brands.json';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ArrowRight, 
  Flame, 
  ChevronRight, 
  Globe2, 
  LayoutGrid, 
  ListOrdered
} from 'lucide-react';

const preloadedStrategies: CandidateStrategy[] = preloadedStrategiesData as CandidateStrategy[];
const brands: Brand[] = brandsData as Brand[];

interface CampaignCalendarProps {
  onSelectStrategy: (strategy: CandidateStrategy) => void;
  currentStrategyId: string;
}

export const CampaignCalendar: React.FC<CampaignCalendarProps> = ({
  onSelectStrategy,
  currentStrategyId
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  // Sort strategies by scheduledDate
  const sortedStrategies = [...preloadedStrategies].sort((a, b) => {
    return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Cultural Pulse Schedule & Upcoming Scenario Calendar
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upstream Pulse events detected by AI with scheduled go-live windows across Unilever brand teams
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-white text-sky-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' ? (
        <div className="space-y-3">
          {sortedStrategies.map((strat, idx) => {
            const brand = brands.find(b => b.id === strat.brandId) || brands[0];
            const isSelected = currentStrategyId === strat.id;
            const dateObj = strat.scheduledDate ? new Date(strat.scheduledDate) : new Date();
            const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayStr = dateObj.getDate();

            return (
              <div
                key={strat.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-md'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {/* Date Chip & Info */}
                <div className="flex items-start gap-4">
                  {/* Calendar Date Block */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center shrink-0 text-center">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">{monthStr}</span>
                    <span className="text-lg font-black text-slate-900 leading-none">{dayStr}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span 
                        className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded text-white shadow-xs"
                        style={{ backgroundColor: brand.color || '#0284C7' }}
                      >
                        {brand.name}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {strat.culturalEventName}
                      </span>
                      {idx === 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                          <Flame className="w-3 h-3 text-rose-500" />
                          Imminent Pulse (48H)
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {strat.title}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1 font-mono text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {strat.timeWindow}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        ${(strat.budget / 1000).toFixed(0)}k Budget
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe2 className="w-3.5 h-3.5 text-slate-400" />
                        {strat.markets.join(', ')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 pt-0.5 line-clamp-1">
                      {strat.eventContext}
                    </p>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => onSelectStrategy(strat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      isSelected
                        ? 'bg-sky-600 text-white shadow-sky-200'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 hover:border-sky-300'
                    }`}
                  >
                    <span>{isSelected ? 'Currently Loaded' : 'Load Scenario'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedStrategies.map((strat) => {
            const brand = brands.find(b => b.id === strat.brandId) || brands[0];
            const isSelected = currentStrategyId === strat.id;

            return (
              <div
                key={strat.id}
                onClick={() => onSelectStrategy(strat)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-400/30 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span 
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: brand.color }}
                    >
                      {brand.name}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded">
                      {strat.scheduledDate}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {strat.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {strat.eventContext}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-emerald-600">${(strat.budget / 1000).toFixed(0)}k</span>
                  <span className="text-sky-600 font-semibold flex items-center gap-1 text-[11px]">
                    Select <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
