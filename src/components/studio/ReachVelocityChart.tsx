import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line
} from 'recharts';
import type { DailyReachPoint } from '../../engine/types';
import { TrendingUp } from 'lucide-react';

interface ReachVelocityChartProps {
  data: DailyReachPoint[];
  expectedTotal: number;
  minTotal: number;
  maxTotal: number;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
};

export const ReachVelocityChart: React.FC<ReachVelocityChartProps> = ({
  data,
  expectedTotal,
  minTotal,
  maxTotal
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              14-Day Reach Velocity & 90% Confidence Interval
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Empirical Bayesian projection with shaded lower/upper uncertainty bands
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Expected: {formatNumber(expectedTotal)}</span>
          </div>
          <div className="text-slate-400">
            Range: [{formatNumber(minTotal)} – {formatNumber(maxTotal)}]
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="reachBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expectedLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            
            <XAxis 
              dataKey="dateLabel" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            
            <YAxis 
              stroke="#64748B" 
              fontSize={11} 
              tickFormatter={formatNumber}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pData = payload[0].payload as DailyReachPoint;
                  return (
                    <div className="bg-[#0B0F19] border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1 z-50">
                      <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                        <span>{label}</span>
                        <span className="text-cyan-400">{pData.velocityPercent}% of total</span>
                      </div>
                      <div className="text-cyan-300 font-semibold flex justify-between gap-4">
                        <span>Expected Reach:</span>
                        <span>{formatNumber(pData.expectedReach)}</span>
                      </div>
                      <div className="text-slate-400 flex justify-between gap-4 text-[11px]">
                        <span>Optimistic Max:</span>
                        <span className="text-emerald-400">{formatNumber(pData.maxReach)}</span>
                      </div>
                      <div className="text-slate-400 flex justify-between gap-4 text-[11px]">
                        <span>Conservative Min:</span>
                        <span className="text-amber-400">{formatNumber(pData.minReach)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Shaded Confidence Interval Upper Bound */}
            <Area
              type="monotone"
              dataKey="maxReach"
              stroke="#06B6D4"
              strokeDasharray="2 2"
              strokeOpacity={0.4}
              fill="url(#reachBandGrad)"
              name="Max CI (90%)"
            />

            {/* Shaded Confidence Interval Lower Bound */}
            <Area
              type="monotone"
              dataKey="minReach"
              stroke="#06B6D4"
              strokeDasharray="2 2"
              strokeOpacity={0.4}
              fill="#0F172A"
              name="Min CI (90%)"
            />

            {/* Expected Reach Curve */}
            <Line
              type="monotone"
              dataKey="expectedReach"
              stroke="url(#expectedLineGrad)"
              strokeWidth={3}
              dot={{ r: 2, fill: '#06B6D4' }}
              activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
              name="Expected Cumulative Reach"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center text-xs">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Day 3 Velocity</div>
          <div className="font-bold text-slate-200 mt-0.5">
            {data[2] ? `${data[2].velocityPercent}% of Reach` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Day 7 Midpoint</div>
          <div className="font-bold text-cyan-400 mt-0.5">
            {data[6] ? formatNumber(data[6].expectedReach) : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Uncertainty Spread</div>
          <div className="font-bold text-purple-400 mt-0.5">
            ±{Math.round(((maxTotal - minTotal) / (expectedTotal * 2)) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
