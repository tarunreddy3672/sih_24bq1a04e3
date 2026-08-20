'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, ShieldCheck, TrendingUp, Award, Lock, Lightbulb, Filter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import Badge from '@/components/shared/Badge';
import LoadingState from '@/components/shared/LoadingState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface FeedbackData {
  averageRating: number;
  totalFeedback: number;
  breakdown: { rating: number; count: number }[];
  recentComments: { rating: number; comment: string; subjectOrFacultyId: string; createdAt: string }[];
}

export default function FacultyFeedbackReviewPage() {
  const { data: session } = useSession();
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    averageRating: 0,
    totalFeedback: 0,
    breakdown: [1,2,3,4,5].map(r => ({ rating: r, count: 0 })),
    recentComments: [],
  });
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load faculty's subjects
  useEffect(() => {
    const user = session?.user as any;
    if (!user) return;
    // Faculty subjects are stored in classOrSubject or subjects array
    const subs: string[] = user.subjects?.length ? user.subjects : (user.classOrSubject ? [user.classOrSubject] : []);
    setSubjects(subs);
  }, [session]);

  useEffect(() => {
    async function loadFeedback() {
      setLoading(true);
      try {
        // Fetch feedback for this faculty (by facultyId) or by subject filter
        const params = filterSubject
          ? `?target=${encodeURIComponent(filterSubject)}`
          : '?mine=1';
        const res = await fetch(`/api/feedback${params}`);
        const data = await res.json();
        if (data.feedback) setFeedbackData(data.feedback);
      } catch { /* keep defaults */ }
      finally { setLoading(false); }
    }
    loadFeedback();
  }, [filterSubject]);

  const satisfactionRate = feedbackData.totalFeedback > 0
    ? Math.round(
        (feedbackData.breakdown.filter(b => b.rating >= 4).reduce((s, b) => s + b.count, 0) / feedbackData.totalFeedback) * 100
      )
    : 0;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Student Sentiment & Feedback" roleBadge="FACULTY" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Anonymized Student Feedback
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Sentiment & Feedback</h1>
            </div>
            <Badge variant="emerald" size="md" dot>Privacy Shield Active</Badge>
          </div>

          {/* Subject filter */}
          {subjects.length > 0 && (
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-medium text-slate-700 rounded-xl px-3 py-2 outline-none"
              >
                <option value="">All My Subjects</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {loading ? <LoadingState message="Loading feedback..." /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Average Rating"
                  value={`${feedbackData.averageRating} / 5.0`}
                  subtitle="Student satisfaction score"
                  icon={Star}
                  accentColor="amber"
                />
                <StatCard
                  title="Total Reviews"
                  value={feedbackData.totalFeedback}
                  subtitle={filterSubject || 'All subjects'}
                  icon={MessageSquare}
                  accentColor="cyan"
                />
                <StatCard
                  title="Satisfaction Rate"
                  value={`${satisfactionRate}%`}
                  subtitle="4-Star and 5-Star ratings"
                  icon={TrendingUp}
                  accentColor="emerald"
                />
                <StatCard
                  title="Subject Filter"
                  value={filterSubject || 'All'}
                  subtitle="Use dropdown to filter"
                  icon={Award}
                  accentColor="indigo"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-6 study-card p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Rating Star Breakdown</h3>
                  {feedbackData.totalFeedback === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">No feedback received yet.</p>
                  ) : (
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={feedbackData.breakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="rating" stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${val} ★`} />
                          <YAxis stroke="#94A3B8" fontSize={11} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px' }} />
                          <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Student Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 study-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Qualitative Sentiment Summary</h3>
                    </div>
                    <div className="space-y-3 text-xs text-slate-700">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="font-semibold text-indigo-900 mb-1">Feedback Overview:</p>
                        <p>• {feedbackData.totalFeedback} total responses received.</p>
                        <p>• Average rating: {feedbackData.averageRating}/5.0</p>
                        <p>• {satisfactionRate}% of students rated 4 stars or above.</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /> Student identities scrubbed
                    </span>
                    <span>Updated in real time</span>
                  </div>
                </div>
              </div>

              {feedbackData.recentComments.length > 0 && (
                <div className="study-card p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Student Feedback</h3>
                  <div className="space-y-3">
                    {feedbackData.recentComments.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(item.rating)].map((_, starI) => (
                              <Star key={starI} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            {item.subjectOrFacultyId}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 italic">"{item.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
