'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; isPositive: boolean };
  accentColor?: 'cyan' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'blue' | 'green' | 'red' | 'slate';
}

const accent: Record<string, { gradient: string; iconBg: string; iconColor: string; glow: string }> = {
  blue:    { gradient: 'from-indigo-500 to-violet-500',  iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  glow: 'shadow-indigo-100' },
  indigo:  { gradient: 'from-indigo-500 to-violet-500',  iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  glow: 'shadow-indigo-100' },
  purple:  { gradient: 'from-violet-500 to-purple-600',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  glow: 'shadow-violet-100' },
  green:   { gradient: 'from-emerald-500 to-teal-500',   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', glow: 'shadow-emerald-100' },
  emerald: { gradient: 'from-emerald-500 to-teal-500',   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', glow: 'shadow-emerald-100' },
  amber:   { gradient: 'from-amber-400 to-orange-500',   iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   glow: 'shadow-amber-100' },
  red:     { gradient: 'from-rose-500 to-red-500',       iconBg: 'bg-rose-50',    iconColor: 'text-rose-600',    glow: 'shadow-rose-100' },
  cyan:    { gradient: 'from-sky-400 to-cyan-500',       iconBg: 'bg-sky-50',     iconColor: 'text-sky-600',     glow: 'shadow-sky-100' },
  slate:   { gradient: 'from-slate-400 to-slate-500',    iconBg: 'bg-slate-100',  iconColor: 'text-slate-500',   glow: 'shadow-slate-100' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, accentColor = 'blue' }: StatCardProps) {
  const a = accent[accentColor];
  return (
    <div className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-md ${a.glow} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group`}>
      {/* Gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.gradient} rounded-t-2xl`} />

      {/* Subtle bg orb */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${a.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />

      <div className="flex items-start justify-between gap-2 mb-4">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider leading-tight">{title}</p>
        <div className={`w-9 h-9 rounded-xl ${a.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${a.iconColor} w-5 h-5`} />
        </div>
      </div>

      <p className="text-[28px] font-bold text-slate-900 tabular-nums leading-none mb-2">{value}</p>

      <div className="flex items-center justify-between gap-2 mt-1">
        {subtitle && <p className="text-[11px] text-slate-400 truncate leading-tight">{subtitle}</p>}
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
            trend.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
