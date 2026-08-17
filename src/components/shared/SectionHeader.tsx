import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({
  title,
  subtitle,
  badge,
  action,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h2>
          {badge && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}
