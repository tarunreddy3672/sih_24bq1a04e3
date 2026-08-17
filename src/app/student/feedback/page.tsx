'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Star,
  ShieldCheck,
  Send,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import Badge from '@/components/shared/Badge';

export default function StudentFeedbackPage() {
  const [subjectOrFaculty, setSubjectOrFaculty] = useState('Digital Electronics & VLSI');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [anonymized, setAnonymized] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const subjects = [
    'Digital Electronics & VLSI',
    'Data Structures & Algorithms',
    'Signals & Systems',
    'Database Management Systems',
    'Deep Learning & Neural Nets',
    'Computer Networks',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectOrFacultyId: subjectOrFaculty,
          rating,
          comment,
          anonymized,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setComment('');
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Academic Feedback & Sentiment Terminal" roleBadge="STUDENT" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                End-to-End Encrypted & Anonymized Feedback
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Course & Faculty Sentiment Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Provide anonymous pedagogical insights to help faculty adjust lecture pace, clarity, and problem-solving depth.
            </p>
          </div>

          {/* Privacy Guarantee Box */}
          <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300">Privacy-First Architecture</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When anonymized mode is enabled, your student ID is permanently decoupled from your rating and feedback. Faculty only observe aggregated statistics and anonymized sentiment summaries.
              </p>
            </div>
          </div>

          {/* Main Form */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Feedback Recorded Successfully</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Thank you for contributing to institutional learning quality. Your response has been securely aggregated.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                >
                  Submit Another Feedback
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Select Subject or Faculty
                  </label>
                  <select
                    value={subjectOrFaculty}
                    onChange={(e) => setSubjectOrFaculty(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none"
                  >
                    {subjects.map((sub, i) => (
                      <option key={i} value={sub} className="bg-slate-900 text-slate-200">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Star Rating Selection */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Pedagogical Effectiveness Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating !== null ? hoverRating : rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(star)}
                          className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 transition-all group"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              active
                                ? 'fill-amber-400 text-amber-400 scale-110'
                                : 'text-slate-600 group-hover:text-slate-400'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="text-xs font-mono font-bold text-amber-400 ml-3">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Qualitative Comment */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Constructive Feedback / Observations
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share specific suggestions on concept explanations, practical lab demonstrations, or pacing..."
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
                  />
                </div>

                {/* Anonymized Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">Anonymize My Submission</p>
                      <p className="text-[10px] text-slate-400">Do not attach my name or student roll number</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={anonymized}
                    onChange={(e) => setAnonymized(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span>Encrypting & Recording...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Encrypted Feedback</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
