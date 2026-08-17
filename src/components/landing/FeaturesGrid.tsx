'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, ShieldCheck, Zap, BookOpen, MessageSquare, Flame, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Adaptive AI Study Architecture',
    description: 'Autonomous extraction of student weakness topics from quiz telemetry. Generates personalized micro-revision paths using Claude Sonnet.',
    badge: 'Cognitive Engine',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
  },
  {
    icon: Camera,
    title: 'Computer Vision Attendance',
    description: 'Browser-side facial descriptor generation with face-api.js. Real-time confidence verification with institution privacy consent protections.',
    badge: 'Biometric AI',
    color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
  },
  {
    icon: ShieldCheck,
    title: 'Institutional Control Tower',
    description: 'Command center for Deans and Vice-Chancellors with live class grids, cross-department trends, and dynamic institutional WOW insight cards.',
    badge: 'Campus 360',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
  },
  {
    icon: Flame,
    title: 'Streak & Habit Mechanics',
    description: 'Motivational micro-rewards, animated streak flame milestones, and gamified badges proven to increase student retention by 34%.',
    badge: 'Gamified Growth',
    color: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400',
  },
  {
    icon: BookOpen,
    title: 'Smart MCQ Assessment Engine',
    description: 'Time-boxed interactive assessments with zero client-side answer leakage, server-side score calculation, and topic gap mapping.',
    badge: 'Zero Leakage',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    icon: MessageSquare,
    title: 'Anonymized Sentiment Intelligence',
    description: 'Safe student-to-faculty feedback loop with sentiment aggregation, protecting student identities while providing actionable teaching insights.',
    badge: 'Privacy Shield',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3.5 h-3.5" />
            Next-Generation Architectural Pillars
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
          >
            Engineered for High-Scale Institutional Intelligence
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-slate-400 text-sm sm:text-base"
          >
            Eliminating disconnected spreadsheets and legacy LMS silos with a unified real-time telemetry stack.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-panel rounded-2xl p-6 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
