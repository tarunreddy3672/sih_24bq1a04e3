'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, ArrowRight, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface WowInsightCardProps {
  insight?: {
    title: string;
    description: string;
    details: string;
    recommendation: string;
    severity: 'critical' | 'warning' | 'positive';
    impactMetric: string;
  };
  onTriggerAction?: () => void;
}

export default function WowInsightCard({
  insight = {
    title: 'Institutional Biometric Anomaly Detected',
    description: 'Class CSE-B has experienced a 12% attendance decline over the last three weeks.',
    details: 'The drop is concentrated specifically in morning 09:00 AM sessions, while laboratory quiz performance remains stable.',
    recommendation: 'Initiate targeted morning-session attendance check-ins and dispatch automated WhatsApp alerts to at-risk students.',
    severity: 'warning',
    impactMetric: '-12% CSE-B Cohort Attendance',
  },
  onTriggerAction,
}: WowInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 shadow-2xl overflow-hidden"
    >
      {/* Decorative background glow & pulse */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              ⚡ Institutional Intelligence Core
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {insight.impactMetric}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {insight.description}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {insight.details}
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/10 text-xs text-slate-200 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-300 block mb-0.5">Recommended Executive Action:</strong>
              {insight.recommendation}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onTriggerAction}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all group"
          >
            <span>Execute Remediation Directive</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
