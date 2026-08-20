import React from 'react';
import type { 
  CandidateStrategy, 
  Brand, 
  BrandId, 
  StrategyType, 
  Market, 
  Channel, 
  TimelineUrgency 
} from '../../engine/types';
import brandsData from '../../data/brands.json';
import preloadedStrategiesData from '../../data/preloaded_strategies.json';
import { 
  Sparkles, 
  DollarSign, 
  Globe2, 
  Radio, 
  Clock, 
  FileText, 
  Bookmark
} from 'lucide-react';

const brands: Brand[] = brandsData as Brand[];
const preloadedStrategies: CandidateStrategy[] = preloadedStrategiesData as CandidateStrategy[];

const STRATEGY_TYPES: { id: StrategyType; label: string; desc: string; icon: string }[] = [
  { id: 'organic_social_reactive', label: 'Organic Reactive', desc: 'Real-time meme/cultural newsjacking (Fast, High ROI)', icon: '⚡' },
  { id: 'paid_amplification', label: 'Paid Amplification', desc: 'Targeted media budget across core digital channels', icon: '📢' },
  { id: 'influencer_partnership', label: 'Influencer Co-Creation', desc: 'Creator partnerships and UGC challenges', icon: '🤝' },
  { id: 'full_campaign_pivot', label: 'Full Campaign Pivot', desc: 'Mass 360 multi-channel brand launch (TV, OOH, Digital)', icon: '🔄' }
];

const AVAILABLE_MARKETS: Market[] = ['UK', 'US', 'Germany', 'India', 'Brazil', 'Indonesia', 'Nigeria', 'Global'];
const AVAILABLE_CHANNELS: Channel[] = ['Instagram', 'TikTok', 'YouTube', 'X', 'OOH', 'TV', 'WhatsApp', 'LinkedIn'];

const URGENCY_OPTIONS: { id: TimelineUrgency; label: string; sub: string }[] = [
  { id: 'immediate', label: 'Immediate (< 4 Hours)', sub: 'Rapid reactive response' },
  { id: 'one_week', label: '1 Week Sprint', sub: 'Tactical creator push' },
  { id: 'one_month', label: '1 Month Planned', sub: 'Polished mass production' }
];

interface StrategyInputFormProps {
  strategy: CandidateStrategy;
  onChange: (strategy: CandidateStrategy) => void;
  onSimulate: () => void;
  isLoading: boolean;
}

export const StrategyInputForm: React.FC<StrategyInputFormProps> = ({
  strategy,
  onChange,
  onSimulate,
  isLoading
}) => {
  const handleBrandChange = (brandId: BrandId) => {
    const selected = brands.find(b => b.id === brandId);
    onChange({
      ...strategy,
      brandId,
      budget: selected ? Math.round((selected.typicalBudgetRange.min + selected.typicalBudgetRange.max) / 2) : strategy.budget
    });
  };

  const handleMarketToggle = (market: Market) => {
    let updated: Market[];
    if (market === 'Global') {
      updated = strategy.markets.includes('Global') ? ['UK'] : ['Global'];
    } else {
      const withoutGlobal = strategy.markets.filter(m => m !== 'Global');
      if (withoutGlobal.includes(market)) {
        updated = withoutGlobal.filter(m => m !== market);
        if (updated.length === 0) updated = ['UK'];
      } else {
        updated = [...withoutGlobal, market];
      }
    }
    onChange({ ...strategy, markets: updated });
  };

  const handleChannelToggle = (channel: Channel) => {
    let updated: Channel[];
    if (strategy.channels.includes(channel)) {
      updated = strategy.channels.filter(c => c !== channel);
      if (updated.length === 0) updated = ['Instagram'];
    } else {
      updated = [...strategy.channels, channel];
    }
    onChange({ ...strategy, channels: updated });
  };

  const loadPreloaded = (preloaded: CandidateStrategy) => {
    onChange({ ...preloaded });
  };

  return (
    <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Upstream Compass Candidate Strategies Selector */}
      <div className="mb-6 pb-5 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Candidate Strategies from Upstream Compass Agent
            </span>
          </div>
          <span className="text-[11px] text-cyan-400/90 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
            5 Pre-loaded Scenarios
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {preloadedStrategies.map(pStrat => {
            const isSelected = strategy.id === pStrat.id;
            return (
              <button
                key={pStrat.id}
                onClick={() => loadPreloaded(pStrat)}
                className={`text-left px-3 py-2 rounded-xl border text-xs font-medium shrink-0 transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 text-slate-100">
                  <span className="text-cyan-400">●</span>
                  <span>{pStrat.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span className="uppercase text-slate-400 font-semibold">{pStrat.brandId}</span>
                  <span>•</span>
                  <span>${(pStrat.budget / 1000).toFixed(0)}k</span>
                  <span>•</span>
                  <span>{pStrat.markets.join(', ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Form */}
      <div className="space-y-5">
        {/* Brand Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Unilever Brand Portfolio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {brands.map(b => {
              const isSelected = strategy.brandId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleBrandChange(b.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{b.name}</span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: b.color }} 
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{b.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategy Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Strategy Campaign Title
          </label>
          <input
            type="text"
            value={strategy.title}
            onChange={e => onChange({ ...strategy, title: e.target.value })}
            placeholder="e.g. Rexona Referee Armband Viral Reactive"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Strategy Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Strategy Archetype
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STRATEGY_TYPES.map(st => {
              const isSelected = strategy.strategyType === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onChange({ ...strategy, strategyType: st.id })}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/50 to-slate-900 border-cyan-400 ring-1 ring-cyan-500/30 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-lg shrink-0 mt-0.5">{st.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-white">{st.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Markets & Channel Mix in 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Target Markets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                Target Market(s)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Multi-select</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_MARKETS.map(market => {
                const isSelected = strategy.markets.includes(market);
                return (
                  <button
                    key={market}
                    type="button"
                    onClick={() => handleMarketToggle(market)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-semibold'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {market}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Channel Mix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-purple-400" />
                Channel Mix
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Multi-select</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_CHANNELS.map(channel => {
                const isSelected = strategy.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => handleChannelToggle(channel)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-400/60 font-semibold'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Budget Slider & Timeline Urgency in 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
          {/* Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Allocated Budget (USD)
              </label>
              <span className="text-sm font-extrabold text-emerald-400 font-mono">
                ${strategy.budget.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="2000000"
              step="5000"
              value={strategy.budget}
              onChange={e => onChange({ ...strategy, budget: Number(e.target.value) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between items-center gap-1 mt-2">
              {[25000, 75000, 250000, 750000, 1500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => onChange({ ...strategy, budget: val })}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    strategy.budget === val 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  ${val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Urgency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Timeline Urgency
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {URGENCY_OPTIONS.map(opt => {
                const isSelected = strategy.timelineUrgency === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange({ ...strategy, timelineUrgency: opt.id })}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{opt.label}</div>
                    <div className="text-[9px] text-slate-400 truncate mt-0.5">{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tone / Creative Angle Copy */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              Creative Angle & Tone of Voice Prompt
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {strategy.creativeAngle.length} chars (Live Guardrail Screen)
            </span>
          </div>
          <textarea
            rows={3}
            value={strategy.creativeAngle}
            onChange={e => onChange({ ...strategy, creativeAngle: e.target.value })}
            placeholder="Describe the campaign angle, key copy, hashtags, or creator brief. Example: 'Humorous reactive matchday video reacting to sweaty referee moments...'"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Primary Simulate CTA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSimulate}
            disabled={isLoading}
            className="w-full relative group overflow-hidden rounded-xl p-[1.5px] font-semibold text-white transition-all duration-300 disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-purple-600 rounded-xl group-hover:opacity-100 transition-opacity" />
            <div className="relative px-6 py-3.5 bg-slate-950 rounded-[10px] flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-90">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-base font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">
                {isLoading ? 'Running Mirror Simulation...' : 'Simulate Strategy & Screen Risks'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 font-mono">
                Monte Carlo Prior
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
