'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Camera, ShieldCheck, Flame, HelpCircle, MessageSquare, GraduationCap } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Adaptive Study Architecture',
    description: 'Autonomous extraction of student weakness topics from quiz telemetry. Generates personalized micro-revision paths using academic AI synthesis.',
    badge: 'Cognitive Engine',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    icon: Camera,
    title: 'Biometric Attendance Verification',
    description: 'Local browser-side facial descriptor generation with face-api.js. Real-time verification with ethical student consent protections.',
    badge: 'Vision AI',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Institutional Control Tower',
    description: 'Command center for Department Deans with live class grids, cross-cohort attendance trends, and dynamic academic advisory insights.',
    badge: 'Campus 360',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    icon: Flame,
    title: 'Daily Streak & Habit Mechanics',
    description: 'Motivational micro-rewards, animated streak milestones, and achievement badges to foster continuous daily study habits.',
    badge: 'Consistency',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
  },
  {
    icon: HelpCircle,
    title: 'Diagnostic MCQ Assessment Engine',
    description: 'Timed interactive assessments with zero client-side answer leakage, server-side score calculation, and topic gap mapping.',
    badge: 'Assessments',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    icon: MessageSquare,
    title: 'Anonymized Course Sentiment',
    description: 'Safe student-to-faculty feedback loop with sentiment aggregation, protecting student identities while providing actionable teaching insights.',
    badge: 'Privacy-First',
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Core Academic Capabilities
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Engineered for Modern Higher Education
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed"
          >
            Unifying student daily learning habits, classroom biometric telemetry, and executive administrative insights into one calm, cohesive workspace.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="study-card p-6 study-card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
