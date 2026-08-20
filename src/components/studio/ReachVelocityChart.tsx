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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              14-Day Reach Velocity & 90% Confidence Interval
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical Bayesian projection with shaded lower/upper uncertainty bands
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-sky-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
            <span>Expected: {formatNumber(expectedTotal)}</span>
          </div>
          <div className="text-slate-500 font-medium">
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
                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="expectedLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            
            <XAxis 
              dataKey="dateLabel" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />
            
            <YAxis 
              stroke="#64748B" 
              fontSize={11} 
              tickFormatter={formatNumber}
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
            />

            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const pData = payload[0].payload as DailyReachPoint;
                  return (
                    <div className="bg-white border border-slate-300 p-3.5 rounded-xl shadow-xl text-xs font-mono space-y-1 z-50">
                      <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between gap-4">
                        <span>{label}</span>
                        <span className="text-sky-700">{pData.velocityPercent}% of total</span>
                      </div>
                      <div className="text-sky-800 font-bold flex justify-between gap-4 pt-1">
                        <span>Expected Reach:</span>
                        <span>{formatNumber(pData.expectedReach)}</span>
                      </div>
                      <div className="text-slate-600 flex justify-between gap-4 text-[11px]">
                        <span>Optimistic Max:</span>
                        <span className="text-emerald-600 font-bold">{formatNumber(pData.maxReach)}</span>
                      </div>
                      <div className="text-slate-600 flex justify-between gap-4 text-[11px]">
                        <span>Conservative Min:</span>
                        <span className="text-amber-600 font-bold">{formatNumber(pData.minReach)}</span>
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
              stroke="#0284C7"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
              fill="url(#reachBandGrad)"
              name="Max CI (90%)"
            />

            {/* Shaded Confidence Interval Lower Bound */}
            <Area
              type="monotone"
              dataKey="minReach"
              stroke="#0284C7"
              strokeDasharray="2 2"
              strokeOpacity={0.5}
              fill="#FFFFFF"
              name="Min CI (90%)"
            />

            {/* Expected Reach Curve */}
            <Line
              type="monotone"
              dataKey="expectedReach"
              stroke="url(#expectedLineGrad)"
              strokeWidth={3}
              dot={{ r: 3, fill: '#0284C7' }}
              activeDot={{ r: 5, fill: '#7C3AED', stroke: '#fff', strokeWidth: 2 }}
              name="Expected Cumulative Reach"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Day 3 Velocity</div>
          <div className="font-extrabold text-slate-800 mt-0.5">
            {data[2] ? `${data[2].velocityPercent}% of Total` : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Day 7 Midpoint</div>
          <div className="font-extrabold text-sky-700 mt-0.5 font-mono">
            {data[6] ? formatNumber(data[6].expectedReach) : 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Uncertainty Spread</div>
          <div className="font-extrabold text-purple-700 mt-0.5 font-mono">
            ±{Math.round(((maxTotal - minTotal) / (expectedTotal * 2)) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
