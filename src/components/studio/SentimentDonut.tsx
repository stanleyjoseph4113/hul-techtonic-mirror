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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Audience Sentiment Split
            </h4>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            netScore >= 50 
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : netScore >= 20
              ? 'bg-sky-100 text-sky-800 border-sky-300'
              : 'bg-rose-100 text-rose-800 border-rose-300'
          }`}>
            Net: {netScore >= 0 ? `+${netScore}` : netScore}
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200 mb-4 shadow-inner">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            style={{ width: `${positive}%` }}
            title={`Positive: ${positive}%`}
          >
            {positive > 12 && `${positive}%`}
          </div>
          <div 
            className="bg-slate-400 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: `${neutral}%` }}
            title={`Neutral: ${neutral}%`}
          >
            {neutral > 12 && `${neutral}%`}
          </div>
          <div 
            className="bg-rose-500 h-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
            style={{ width: `${negative}%` }}
            title={`Negative: ${negative}%`}
          >
            {negative > 8 && `${negative}%`}
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-3 gap-2">
          {/* Positive */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-700 mb-1">
              <SmilePlus className="w-4 h-4" />
              <span className="text-xs font-bold">Positive</span>
            </div>
            <div className="text-lg font-black text-emerald-800 font-mono">{positive}%</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">High Affinity</div>
          </div>

          {/* Neutral */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
              <Meh className="w-4 h-4" />
              <span className="text-xs font-bold">Neutral</span>
            </div>
            <div className="text-lg font-black text-slate-700 font-mono">{neutral}%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Passive Read</div>
          </div>

          {/* Negative */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-700 mb-1">
              <Frown className="w-4 h-4" />
              <span className="text-xs font-bold">Negative</span>
            </div>
            <div className="text-lg font-black text-rose-800 font-mono">{negative}%</div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">Critique / Noise</div>
          </div>
        </div>
      </div>

      {/* Backlash Risk Footer Widget */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-4 h-4 ${
            backlashRiskLevel === 'Low' ? 'text-emerald-600' :
            backlashRiskLevel === 'Medium' ? 'text-amber-600' : 'text-rose-600'
          }`} />
          <div>
            <div className="text-xs font-bold text-slate-800">Backlash Probability</div>
            <div className="text-[10px] text-slate-500">Risk of public PR controversy</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-sm font-black font-mono ${
            backlashRiskLevel === 'Low' ? 'text-emerald-700' :
            backlashRiskLevel === 'Medium' ? 'text-amber-700' : 'text-rose-700'
          }`}>
            {backlashProbability}% ({backlashRiskLevel})
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Safe threshold &lt; 15%</div>
        </div>
      </div>
    </div>
  );
};
