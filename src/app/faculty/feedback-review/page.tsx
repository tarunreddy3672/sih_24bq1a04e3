'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Lock,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import Badge from '@/components/shared/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function FacultyFeedbackReviewPage() {
  const [feedbackData, setFeedbackData] = useState({
    averageRating: 4.8,
    totalFeedback: 42,
    breakdown: [
      { rating: 5, count: 32 },
      { rating: 4, count: 8 },
      { rating: 3, count: 2 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 },
    ],
    recentComments: [
      {
        rating: 5,
        comment: 'The circuit simulation diagrams on MOSFET transconductance were crystal clear! Appreciated the extra numerical examples.',
        subjectOrFacultyId: 'Digital Electronics & VLSI',
        createdAt: new Date().toISOString(),
      },
      {
        rating: 5,
        comment: 'Great pace in class. Would love 5 minutes of rapid Q&A at the end of each session.',
        subjectOrFacultyId: 'Digital Electronics & VLSI',
        createdAt: new Date().toISOString(),
      },
      {
        rating: 4,
        comment: 'CMOS propagation delay derivations were helpful. Please upload the slide annotations to portal.',
        subjectOrFacultyId: 'Digital Electronics & VLSI',
        createdAt: new Date().toISOString(),
      },
    ],
  });

  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await fetch('/api/feedback?target=Digital%20Electronics%20%26%20VLSI');
        const data = await res.json();
        if (data.feedback && data.feedback.totalFeedback > 0) {
          setFeedbackData(data.feedback);
        }
      } catch (err) {
        console.warn('Using local feedback state');
      }
    }
    loadFeedback();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="faculty" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Student Sentiment & Feedback Analytics" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                  Anonymized Student Feedback Telemetry
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Pedagogical Sentiment Intelligence
              </h1>
            </div>

            <Badge variant="emerald" size="md" dot>
              Privacy Shield Active (Student IDs Decoupled)
            </Badge>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Average Satisfaction"
              value={`${feedbackData.averageRating} / 5.0`}
              subtitle="Top 3% faculty rating across campus"
              icon={Star}
              trend={{ value: '0.2', isPositive: true }}
              accentColor="amber"
            />
            <StatCard
              title="Total Student Reviews"
              value={feedbackData.totalFeedback}
              subtitle="Section CSE-A Semester 4"
              icon={MessageSquare}
              accentColor="cyan"
            />
            <StatCard
              title="Positive Sentiment Rate"
              value="95.2%"
              subtitle="4-Star and 5-Star ratings"
              icon={TrendingUp}
              accentColor="emerald"
            />
            <StatCard
              title="Pedagogical Index"
              value="Exemplary"
              subtitle="VLSI & Digital Logic Domain"
              icon={Award}
              accentColor="indigo"
            />
          </div>

          {/* Rating Distribution & AI Sentiment Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Distribution chart */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-4">Rating Star Breakdown</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedbackData.breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="rating" stroke="#64748B" fontSize={11} tickFormatter={(val) => `${val} ★`} />
                    <YAxis stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Student Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Sentiment Analysis Card */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">AI Qualitative Sentiment Analysis</h3>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <p className="font-semibold text-cyan-300 mb-1">Key Strengths Noted by Students:</p>
                    <p>• High clarity on physical semiconductor derivations (MOSFET inversion layers).</p>
                    <p>• Interactive pacing and visual circuit simulations are highly rated.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <p className="font-semibold text-amber-300 mb-1">Student Suggestions / Action Items:</p>
                    <p>• Provide 5 minutes for open doubt resolution at the end of Friday sessions.</p>
                    <p>• Share annotated digital blackboard sketches as PDF resources.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Student identities scrubbed
                </span>
                <span>Updated in real time</span>
              </div>
            </div>
          </div>

          {/* Anonymized Qualitative Feedback Comments */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white">Recent Anonymized Student Comments</h3>
            <div className="space-y-3">
              {feedbackData.recentComments.map((commentItem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(commentItem.rating)].map((_, starI) => (
                        <Star key={starI} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Verified Student • Digital Electronics & VLSI
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{commentItem.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
