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
    lg: 'text-base px-4 py-2 gap-2.5 font-bold'
  }[size];

  if (tier === 'full_scale') {
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs ${sizeClasses}`}>
        {showIcon && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
        <span>Full-Scale Launch</span>
      </span>
    );
  }

  if (tier === 'regional_test') {
    return (
      <span className={`inline-flex items-center rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses}`}>
        {showIcon && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
        <span>Regional Test First</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs ${sizeClasses}`}>
      {showIcon && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
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
      <span className={`inline-flex items-center rounded-md font-extrabold bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wider ${sizeClasses}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
        High Risk
      </span>
    );
  }

  if (severity === 'medium') {
    return (
      <span className={`inline-flex items-center rounded-md font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider ${sizeClasses}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        Medium Risk
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md font-bold bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-wider ${sizeClasses}`}>
      <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
      Low Risk
    </span>
  );
};
