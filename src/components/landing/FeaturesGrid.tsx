'use client';

import React from 'react';
import { motion } from 'framer-motion';
import BookOpen      from 'lucide-react/dist/esm/icons/book-open';
import Camera        from 'lucide-react/dist/esm/icons/camera';
import ShieldCheck   from 'lucide-react/dist/esm/icons/shield-check';
import Flame         from 'lucide-react/dist/esm/icons/flame';
import HelpCircle    from 'lucide-react/dist/esm/icons/help-circle';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';

const features = [
  {
    icon: BookOpen,
    title: 'AI Study Plans',
    description: 'Personalized revision paths powered by Claude AI.',
    badge: 'Cognitive Engine',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    borderHover: '#818CF8',
    glowColor: 'rgba(99,102,241,0.15)',
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    accentBar: 'accent-bar-indigo',
  },
  {
    icon: Camera,
    title: 'Smart Attendance',
    description: 'Contactless facial recognition in the browser.',
    badge: 'Vision AI',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    borderHover: '#34D399',
    glowColor: 'rgba(16,185,129,0.15)',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    accentBar: 'accent-bar-emerald',
  },
  {
    icon: ShieldCheck,
    title: 'Control Tower',
    description: 'Real-time institutional command center.',
    badge: 'Campus 360',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    borderHover: '#FCD34D',
    glowColor: 'rgba(245,158,11,0.15)',
    badgeBg: 'bg-amber-50 text-amber-600 border-amber-200',
    accentBar: 'accent-bar-amber',
  },
  {
    icon: Flame,
    title: 'Streak Tracking',
    description: 'Daily habits with rewards that stick.',
    badge: 'Consistency',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    borderHover: '#FB923C',
    glowColor: 'rgba(249,115,22,0.15)',
    badgeBg: 'bg-orange-50 text-orange-600 border-orange-200',
    accentBar: 'accent-bar-amber',
  },
  {
    icon: HelpCircle,
    title: 'Smart Quizzes',
    description: 'Diagnostic MCQs with zero answer leakage.',
    badge: 'Assessments',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    borderHover: '#38BDF8',
    glowColor: 'rgba(56,189,248,0.15)',
    badgeBg: 'bg-sky-50 text-sky-600 border-sky-200',
    accentBar: 'accent-bar-sky',
  },
  {
    icon: MessageSquare,
    title: 'Safe Feedback',
    description: 'Anonymized sentiment straight to faculty.',
    badge: 'Privacy-First',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    borderHover: '#A78BFA',
    glowColor: 'rgba(167,139,250,0.15)',
    badgeBg: 'bg-purple-50 text-purple-600 border-purple-200',
    accentBar: 'accent-bar-indigo',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FeaturesGrid() {
  return (
    <section className="py-20 relative bg-gradient-to-b from-white to-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-base font-bold uppercase tracking-wider mb-5"
          >
            <GraduationCap className="w-5 h-5" />
            Core Capabilities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900"
          >
            Everything You Need in{' '}
            <span className="text-gradient-academic">One Platform</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 text-slate-500 text-lg sm:text-xl leading-relaxed"
          >
            Built for students, faculty, and administrators.
          </motion.p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={item}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                  boxShadow: `0 20px 50px ${feat.glowColor}, 0 4px 12px rgba(0,0,0,0.06)`,
                  borderColor: feat.borderHover,
                }}
                className="study-card card-shine p-8 flex flex-col gap-5 cursor-default group transition-all duration-300"
              >
                {/* Accent bar */}
                <div className={`w-full ${feat.accentBar}`} />

                <div className="flex items-center justify-between">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feat.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <Icon className={`w-8 h-8 ${feat.iconColor}`} />
                  </div>
                  <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border ${feat.badgeBg}`}>
                    {feat.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors">{feat.title}</h3>
                  <p className="text-base text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}