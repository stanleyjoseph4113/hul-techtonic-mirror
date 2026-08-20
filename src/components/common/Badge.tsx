import React from 'react';
import type { LaunchTier, RiskSeverity } from '../../engine/types';
import { CheckCircle2, AlertTriangle, XCircle, ShieldAlert, ShieldCheck } from 'lucide-react';

interface TierBadgeProps {
  tier: LaunchTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5 font-semibold'
  }[size];

  if (tier === 'full_scale') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${sizeClasses}`}>
        {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
        <span>Full-Scale Launch</span>
      </span>
    );
  }

  if (tier === 'regional_test') {
    return (
      <span className={`inline-flex items-center rounded-full font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
        {showIcon && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
        <span>Regional Test First</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 ${sizeClasses}`}>
      {showIcon && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
      <span>Micro-Test / Hold for Review</span>
    </span>
  );
};

interface RiskBadgeProps {
  severity: RiskSeverity;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ severity, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-2.5 py-1 gap-1.5';

  if (severity === 'high') {
    return (
      <span className={`inline-flex items-center rounded-md font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider ${sizeClasses}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        High Risk
      </span>
    );
  }

  if (severity === 'medium') {
    return (
      <span className={`inline-flex items-center rounded-md font-medium bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Medium Risk
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider ${sizeClasses}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
      Low Risk
    </span>
  );
};
