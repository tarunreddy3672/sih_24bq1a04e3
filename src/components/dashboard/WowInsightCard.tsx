'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

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
    title: 'Academic Attendance Pattern Detected',
    description: 'Section CSE-B has experienced a 12% attendance decline over the last three weeks.',
    details: 'The drop is concentrated in morning 09:00 AM theory sessions, while practical laboratory performance remains steady.',
    recommendation: 'Review morning-session engagement and identify students requiring academic advisory support.',
    severity: 'warning',
    impactMetric: '-12% Morning Session Attendance',
  },
  onTriggerAction,
}: WowInsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-slate-50 border border-indigo-200 shadow-sm overflow-hidden"
    >
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold uppercase tracking-wider shadow-xs">
              <Lightbulb className="w-3.5 h-3.5" />
              Institutional Academic Insight
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" />
              {insight.impactMetric}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {insight.description}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {insight.details}
          </p>

          <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100 shadow-2xs text-xs text-slate-700 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block mb-0.5">Recommended Pedagogical Action:</strong>
              {insight.recommendation}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onTriggerAction}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all group"
          >
            <span>Initiate Advisory Action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
