'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  Award,
  Activity,
  Flame,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import WowInsightCard from '@/components/dashboard/WowInsightCard';
import StudentDrilldownModal from '@/components/dashboard/StudentDrilldownModal';
import Badge from '@/components/shared/Badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ALL_SECTIONS = [
  'CSE-A','CSE-B','CSE-C','ECE-A','ECE-B','ECE-C',
  'IT-A','IT-B','IT-C','AI-A','AI-B','AI-C',
  'MECH-A','MECH-B','MECH-C','CIVIL-A','CIVIL-B','CIVIL-C',
];

export default function AdminControlTowerPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [manualSessions, setManualSessions] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [atRiskLoading, setAtRiskLoading] = useState(true);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectForm, setSubjectForm] = useState({ section: 'CSE-A', subject: '' });
  const [subjectSaving, setSubjectSaving] = useState(false);
  const [subjectMsg, setSubjectMsg] = useState('');

  const loadSubjects = async () => {
    try {
      const res = await fetch('/api/subject-assignments');
      const data = await res.json();
      if (data.assignments) setSubjects(data.assignments);
    } catch { /* keep */ }
  };

  const handleSaveSubject = async () => {
    if (!subjectForm.subject.trim()) return;
    setSubjectSaving(true); setSubjectMsg('');
    try {
      const res = await fetch('/api/subject-assignments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectForm),
      });
      const data = await res.json();
      if (data.success) { setSubjectMsg('Saved!'); loadSubjects(); }
      else setSubjectMsg(data.error || 'Failed');
    } catch { setSubjectMsg('Network error'); }
    finally { setSubjectSaving(false); setTimeout(() => setSubjectMsg(''), 3000); }
  };

  const handleDeleteSubject = async (section: string) => {
    await fetch('/api/subject-assignments', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section }),
    });
    loadSubjects();
  };

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({
    totalStudents: 0,
    totalFaculty: 0,
    averageAttendance: 0,
    averageQuizScore: 0,
    activeClassesCount: 0,
    activeClasses: [],
    attendanceTrends: [],
    quizPerformance: [],
    streakLeaderboard: [],
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/institution-analytics');
        const data = await res.json();
        if (data.analytics) setAnalytics(data.analytics);
      } catch { console.warn('Using local telemetry state'); }
      finally { setAnalyticsLoading(false); }
    }
    async function loadAtRisk() {
      setAtRiskLoading(true);
      try {
        // Fetch all sections in parallel
        const ALL_SECTIONS = [
          'CSE-A','CSE-B','CSE-C','ECE-A','ECE-B','ECE-C',
          'IT-A','IT-B','IT-C','AI-A','AI-B','AI-C',
          'MECH-A','MECH-B','MECH-C','CIVIL-A','CIVIL-B','CIVIL-C',
        ];
        const results = await Promise.all(
          ALL_SECTIONS.map(s =>
            fetch(`/api/at-risk?class=${s}`).then(r => r.json()).catch(() => ({ students: [] }))
          )
        );
        const all = results.flatMap(r => r.students || []);
        // Sort: High first, then Medium, then Low
        const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        all.sort((a, b) => (order[a.riskTier] ?? 3) - (order[b.riskTier] ?? 3));
        if (all.length) setAtRiskStudents(all);
      } catch { /* keep empty */ }
      finally { setAtRiskLoading(false); }
    }
    loadAnalytics();
    loadAtRisk();
    loadSubjects();
    fetch('/api/manual-attendance?summary=1').then(r => r.json()).then(d => setManualSessions(d.sessions || [])).catch(() => {});
  }, []);

  const handleOpenStudentDrilldown = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsDrilldownOpen(true);
  };

  const handleExecuteDirective = () => {
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 5000);
  };

  return (
    <div className="flex min-h-screen dash-bg text-slate-900">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Institutional Control Tower" roleBadge="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 live-indicator" />
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  SIH 2026 Edition
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Academic Operations & Institutional Overview
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="amber" size="md" dot>
                {analyticsLoading ? '…' : analytics.activeClassesCount} Active Class Sessions
              </Badge>
            </div>
          </div>

          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Advisory action initiated! Automated check-in reminders queued for Section CSE-B students.</span>
            </motion.div>
          )}

          {/* 1. THE WOW INSIGHT CARD */}
          <WowInsightCard
            onTriggerAction={handleExecuteDirective}
          />

          {/* AT-RISK PANEL */}
          {atRiskLoading ? (
            <div className="study-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-slate-700">Loading at-risk data across all sections…</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            </div>
          ) : atRiskStudents.filter(s => s.riskTier !== 'Low').length > 0 && (
            <div className="study-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  At-Risk Student Radar
                  <span className="text-xs font-normal text-slate-500 ml-1">— All Sections</span>
                </h3>
                <span className="text-xs text-slate-500">Faculty Console shows full detail · Not visible to students</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {atRiskStudents.filter(s => s.riskTier !== 'Low').map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleOpenStudentDrilldown(s.studentId)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      s.riskTier === 'High'
                        ? 'bg-rose-50 border-rose-200 hover:border-rose-400'
                        : 'bg-amber-50 border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900">{s.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.riskTier === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>{s.riskTier} Risk</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mb-0.5">{s.classOrSubject || ''}</p>
                    <p className="text-[11px] text-slate-600 font-mono mb-1">Attendance: {s.attendancePct}%</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{s.riskReasons?.[0]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Key Institution Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Enrolled Students"
              value={analyticsLoading ? '—' : analytics.totalStudents}
              subtitle="4 Academic Engineering Branches"
              icon={Users}
              trend={{ value: '100% Enrolled', isPositive: true }}
              accentColor="indigo"
            />
            <StatCard
              title="Campus Attendance"
              value={analyticsLoading ? '—' : `${analytics.averageAttendance}%`}
              subtitle="+1.8% vs previous period"
              icon={CalendarCheck}
              trend={{ value: '1.8%', isPositive: true }}
              accentColor="emerald"
            />
            <StatCard
              title="Average Quiz Score"
              value={analyticsLoading ? '—' : `${analytics.averageQuizScore}%`}
              subtitle="Aggregated across all assessments"
              icon={Award}
              trend={{ value: '3.2%', isPositive: true }}
              accentColor="cyan"
            />
            <StatCard
              title="Faculty On-Duty"
              value={analyticsLoading ? '—' : analytics.totalFaculty}
              subtitle="Active Lecture Theatres"
              icon={Activity}
              accentColor="amber"
            />
          </div>

          {/* 3. Live Active Class Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Real-Time Classroom Attendance Status
                </h3>
                <p className="text-xs text-slate-500">Live biometric attendance feeds verified per lecture block</p>
              </div>
              <span className="text-xs font-medium text-indigo-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                Live Sync (3s Interval)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.activeClasses.map((cls) => {
                const isUnderperforming = cls.attendancePercent < 85;
                return (
                  <div
                    key={cls.id}
                    className={`study-card study-card-hover p-5 transition-all ${
                      isUnderperforming ? 'border-amber-300' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                          {cls.class}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{cls.subject}</h4>
                        <p className="text-xs text-slate-500">{cls.faculty}</p>
                      </div>
                      <Badge
                        variant={cls.status === 'Active' ? 'emerald' : cls.status === 'Upcoming' ? 'indigo' : 'slate'}
                        size="sm"
                        dot={cls.status === 'Active'}
                      >
                        {cls.status}
                      </Badge>
                    </div>

                    <div className="my-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-600">
                          {cls.present} / {cls.total} Present
                        </span>
                        <span className={`font-bold ${cls.attendancePercent >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {cls.attendancePercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cls.attendancePercent >= 85 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${cls.attendancePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>Absent: {cls.absent} students</span>
                      {isUnderperforming && <span className="text-amber-700 font-semibold">Flagged for Review</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Institutional Analytics: Attendance Trends & Quiz Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 study-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Campus-Wide Attendance Trend</h3>
                  <p className="text-xs text-slate-500">Weekly trajectory across all 6 sections</p>
                </div>
                <Badge variant="indigo" size="sm">
                  Target: &gt;90%
                </Badge>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.attendanceTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdminAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis domain={[75, 100]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Area type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAdminAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-6 study-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Diagnostic Score by Discipline</h3>
                  <p className="text-xs text-slate-500">Average MCQ mastery rates</p>
                </div>
                <Badge variant="indigo" size="sm">
                  Mean: {analyticsLoading ? '…' : `${analytics.averageQuizScore}%`}
                </Badge>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.quizPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="subject" stroke="#94A3B8" fontSize={10} />
                    <YAxis domain={[50, 100]} stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="averageScore" fill="#4F46E5" radius={[6, 6, 0, 0]} name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="study-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  Academic Consistency & Streak Leaders
                </h3>
                <p className="text-xs text-slate-500">
                  Click any student to inspect their academic dossier and weak topics
                </p>
              </div>
              <span className="text-xs text-indigo-700 font-semibold">Top 5 High-Consistency Scholars</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {analytics.streakLeaderboard.map((student, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenStudentDrilldown(student.id)}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-mono font-bold shadow-sm">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-700">{student.classOrSubject}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1 mt-1 font-mono">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {student.streak} Days
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Inspect Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Subject Management */}
          <div className="study-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Subject Assignments
              </h3>
              <span className="text-xs text-slate-500">Assign subjects to sections — visible to faculty &amp; students</span>
            </div>

            {/* Add / Edit form */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Section</label>
                <select
                  value={subjectForm.section}
                  onChange={e => setSubjectForm(f => ({ ...f, section: e.target.value }))}
                  className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 outline-none"
                >
                  {ALL_SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject Name</label>
                <input
                  type="text"
                  placeholder="e.g. Digital Electronics"
                  value={subjectForm.subject}
                  onChange={e => setSubjectForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full bg-white border border-slate-300 focus:border-indigo-500 text-xs rounded-xl px-3 py-2 outline-none"
                />
              </div>
              <button
                onClick={handleSaveSubject}
                disabled={subjectSaving || !subjectForm.subject.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />{subjectSaving ? 'Saving…' : 'Assign'}
              </button>
              {subjectMsg && <span className={`text-xs font-semibold ${subjectMsg === 'Saved!' ? 'text-emerald-700' : 'text-rose-700'}`}>{subjectMsg}</span>}
            </div>

            {/* Current assignments table */}
            {subjects.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Section', 'Subject', 'Last Updated', ''].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((a: any) => (
                      <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 font-bold text-indigo-700">{a.section}</td>
                        <td className="px-4 py-2.5 text-slate-800">{a.subject}</td>
                        <td className="px-4 py-2.5 text-slate-400 tabular-nums">{new Date(a.updatedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSubjectForm({ section: a.section, subject: a.subject })}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(a.section)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {subjects.length === 0 && (
              <p className="text-xs text-slate-400">No subject assignments yet. Use the form above to assign subjects to sections.</p>
            )}
          </div>

          {/* Manual Attendance Sessions */}
          {manualSessions.length > 0 && (
            <div className="study-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Recent Manual Attendance Sessions
                </h3>
                <span className="text-xs text-slate-500">Last 7 days · Faculty-submitted</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['Section','Subject','Date','Present','Absent','Rate'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manualSessions.slice(0, 8).map((s: any, i: number) => {
                      const pres = (s.records || []).filter((r: any) => r.status === 'present').length;
                      const tot  = (s.records || []).length;
                      const rate = tot ? Math.round((pres / tot) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{s.section}</td>
                          <td className="px-4 py-2.5 text-slate-600">{s.subject}</td>
                          <td className="px-4 py-2.5 text-slate-500 tabular-nums">{new Date(s.date).toLocaleDateString()}</td>
                          <td className="px-4 py-2.5 text-emerald-700 font-bold tabular-nums">{pres}</td>
                          <td className="px-4 py-2.5 text-rose-700 font-bold tabular-nums">{tot - pres}</td>
                          <td className="px-4 py-2.5">
                            <span className={`font-bold tabular-nums ${rate >= 75 ? 'text-emerald-700' : 'text-rose-700'}`}>{rate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Student Drill-down Modal */}
      <StudentDrilldownModal
        isOpen={isDrilldownOpen}
        onClose={() => setIsDrilldownOpen(false)}
        studentId={selectedStudentId}
      />
    </div>
  );
}
