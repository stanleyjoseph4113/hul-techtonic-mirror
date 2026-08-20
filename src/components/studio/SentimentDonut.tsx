import React from 'react';
import { 
  SmilePlus, 
  Meh, 
  Frown, 
  HeartHandshake, 
  AlertCircle 
} from 'lucide-react';

interface SentimentBreakdownProps {
  positive: number;
  neutral: number;
  negative: number;
  netScore: number;
  backlashProbability: number;
  backlashRiskLevel: string;
}

export const SentimentDonut: React.FC<SentimentBreakdownProps> = ({
  positive,
  neutral,
  negative,
  netScore,
  backlashProbability,
  backlashRiskLevel
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Audience Sentiment & Reaction Split
            </h4>
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
            netScore >= 50 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : netScore >= 20
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            Net: {netScore >= 0 ? `+${netScore}` : netScore}
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800 border border-slate-700/80 mb-4">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-950"
            style={{ width: `${positive}%` }}
            title={`Positive: ${positive}%`}
          >
            {positive > 12 && `${positive}%`}
          </div>
          <div 
            className="bg-slate-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-950"
            style={{ width: `${neutral}%` }}
            title={`Neutral: ${neutral}%`}
          >
            {neutral > 12 && `${neutral}%`}
          </div>
          <div 
            className="bg-rose-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-950"
            style={{ width: `${negative}%` }}
            title={`Negative: ${negative}%`}
          >
            {negative > 8 && `${negative}%`}
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-3 gap-2">
          {/* Positive */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <SmilePlus className="w-4 h-4" />
              <span className="text-xs font-semibold">Positive</span>
            </div>
            <div className="text-lg font-extrabold text-emerald-300 font-mono">{positive}%</div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">High Affinity</div>
          </div>

          {/* Neutral */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
              <Meh className="w-4 h-4" />
              <span className="text-xs font-semibold">Neutral</span>
            </div>
            <div className="text-lg font-extrabold text-slate-200 font-mono">{neutral}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Passive Read</div>
          </div>

          {/* Negative */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-400 mb-1">
              <Frown className="w-4 h-4" />
              <span className="text-xs font-semibold">Negative</span>
            </div>
            <div className="text-lg font-extrabold text-rose-300 font-mono">{negative}%</div>
            <div className="text-[10px] text-rose-500/80 mt-0.5">Critique / Noise</div>
          </div>
        </div>
      </div>

      {/* Backlash Risk Footer Widget */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${
            backlashRiskLevel === 'Low' ? 'text-emerald-400' :
            backlashRiskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'
          }`} />
          <div>
            <div className="text-xs font-bold text-slate-200">Backlash Probability</div>
            <div className="text-[10px] text-slate-400">Risk of public PR controversy</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-sm font-extrabold font-mono ${
            backlashRiskLevel === 'Low' ? 'text-emerald-400' :
            backlashRiskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {backlashProbability}% ({backlashRiskLevel})
          </div>
          <div className="text-[10px] text-slate-400">Safe threshold &lt; 15%</div>
        </div>
      </div>
    </div>
  );
};
