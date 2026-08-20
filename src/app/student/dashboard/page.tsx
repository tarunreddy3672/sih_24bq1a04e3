'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  CalendarCheck, Flame, BookOpen, GraduationCap,
  RefreshCw, ArrowRight, ChevronUp, ChevronDown,
  CheckCircle2, Clock, AlertCircle, Brain, Library,
  FileText, Link as LinkIcon, Megaphone,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar  from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import { useLang } from '@/lib/i18n';

/* Lazy-load chart — avoids blocking initial paint */
const AttendanceChart = dynamic(() => import('@/components/dashboard/AttendanceChart'), {
  ssr: false,
  loading: () => <div className="h-40 bg-[#F7F8FA] rounded animate-pulse" />,
});

/* ── Attendance record type ── */
interface AttendanceRow {
  _id?: string;
  date: string;
  subject: string;
  status: 'Present' | 'Absent' | 'Late';
  time: string;
  faculty: string;
}

/* Normalise a raw AttendanceRecord from the API into a display row */
function normaliseRecord(r: any): AttendanceRow {
  const d       = new Date(r.date);
  const dateStr = isNaN(d.getTime()) ? '—' : d.toISOString().slice(0, 10);
  const timeStr = isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const rawStatus = (r.status || 'present') as string;
  const status    = (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)) as AttendanceRow['status'];
  const facultyName = typeof r.facultyId === 'object' ? (r.facultyId?.name || 'Faculty') : 'Faculty';
  const subject     = typeof r.facultyId === 'object' ? (r.facultyId?.classOrSubject || 'Class') : 'Class';
  return { _id: r._id, date: dateStr, subject, status, time: timeStr, faculty: facultyName };
}

type SortKey = 'date' | 'subject' | 'status' | 'time';


/* ── Status chip — small, functional ── */
const StatusChip = memo(function StatusChip({ status }: { status: AttendanceRow['status'] }) {
  const { t } = useLang();
  const map = {
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Absent:  'bg-red-50 text-red-700 border-red-200',
    Late:    'bg-amber-50 text-amber-700 border-amber-200',
  };
  const dot = { Present: 'bg-emerald-500', Absent: 'bg-red-500', Late: 'bg-amber-500' };
  const label = status === 'Present' ? t('present') : status === 'Absent' ? t('absent') : t('late');
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot[status]}`} />
      {label}
    </span>
  );
});

/* ── Sync timestamp — isolated to prevent parent re-render ── */
const SyncStamp = memo(function SyncStamp({ date, spinning }: { date: Date | null; spinning: boolean }) {
  const { t } = useLang();
  if (!date) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
      <RefreshCw className={`w-3 h-3 ${spinning ? 'animate-spin' : ''}`} />
      {t('synced_at', date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}
    </span>
  );
});

/* ── Pending tasks ── */
const tasks = [
  { id: 1, title: 'Digital Electronics — Practice Quiz',  href: '/student/quizzes',   due: 'Due today',   icon: BookOpen,     urgent: true  },
  { id: 2, title: 'AI Study Plan — MOSFET Biasing',       href: '/student/learning',  due: 'Recommended', icon: Brain,        urgent: false },
  { id: 3, title: 'Submit Lecture Feedback',              href: '/student/feedback',  due: 'Anonymous',   icon: CheckCircle2, urgent: false },
];

export default function StudentDashboardPage() {
  const { data: session, status } = useSession();
  const { t } = useLang();
  const studentName    = session?.user?.name    || 'Student';
  const studentId      = (session?.user as any)?.id || '';
  const studentSection = (session?.user as any)?.classOrSubject || '';

  const [streakData, setStreakData]    = useState({ currentStreak: 0, longestStreak: 0 });
  const [stats, setStats]              = useState({ percentage: 0, presentCount: 0, absentCount: 0, totalClasses: 0 });
  const [records, setRecords]          = useState<AttendanceRow[]>([]);
  const [weakTopic, setWeakTopic]      = useState('');
  const [avgQuizScore, setAvgQuizScore] = useState<number | null>(null);
  const [activeSubject, setActiveSubject] = useState('');
  const [courses, setCourses]          = useState<any[]>([]);
  const [trend, setTrend]              = useState<{ day: string; v: number }[]>([]);
  const [quizzes, setQuizzes]          = useState<any[]>([]);
  const [quizHistory, setQuizHistory]  = useState<any[]>([]);
  const [notes, setNotes]              = useState<any[]>([]);
  const [notices, setNotices]          = useState<any[]>([]);
  const [subjects, setSubjects]        = useState<string[]>([]);
  const [labs, setLabs]                = useState<string[]>([]);
  const [lastUpdated, setLastUpdated]  = useState<Date | null>(null);
  const [refreshing, setRefreshing]    = useState(false);
  const [sortKey, setSortKey]          = useState<SortKey>('date');
  const [sortAsc, setSortAsc]          = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      // ── Phase 1: fast critical data (renders stats immediately) ──
      const [attRes, streakRes, profileRes] = await Promise.all([
        fetch('/api/attendance',               { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
        fetch('/api/streaks',                  { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
        studentId ? fetch(`/api/students?studentId=${studentId}`, { cache: 'no-store' }).then(r => r.json()).catch(() => null) : Promise.resolve(null),
      ]);

      const pct  = attRes.percentage  ?? 0;
      const pres = attRes.presentCount ?? 0;
      const abs  = attRes.absentCount  ?? 0;
      setStats({ percentage: pct, presentCount: pres, absentCount: abs, totalClasses: pres + abs });
      if (Array.isArray(attRes.records)) setRecords(attRes.records.map(normaliseRecord));
      if (streakRes.streak) setStreakData(streakRes.streak);

      if (Array.isArray(attRes.records) && attRes.records.length > 0) {
        const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const byDay: Record<string, { present: number; total: number }> = {};
        attRes.records.forEach((r: any) => {
          const d = new Date(r.date);
          if (isNaN(d.getTime())) return;
          const key = DAY_LABELS[d.getDay()];
          if (!byDay[key]) byDay[key] = { present: 0, total: 0 };
          byDay[key].total++;
          if ((r.status || '').toLowerCase() === 'present') byDay[key].present++;
        });
        setTrend(Object.entries(byDay).map(([day, v]) => ({ day, v: Math.round((v.present / v.total) * 100) })));
      }

      if (profileRes?.student) {
        setSubjects(profileRes.student.subjects || []);
        setLabs(profileRes.student.labs || []);
      }

      setLastUpdated(new Date());
    } catch { /* keep defaults */ }
    finally { setRefreshing(false); }

    // ── Phase 2: deferred non-critical data ──
    try {
      const [planRes, lmsRes, quizRes, histRes] = await Promise.all([
        fetch('/api/study-plan',   { cache: 'no-store' }).then(r => r.json()).catch(() => ({})),
        fetch('/api/lms-sync',     { cache: 'no-store' }).then(r => r.json()).catch(() => ({ courses: [] })),
        fetch(`/api/quizzes${studentSection ? `?section=${encodeURIComponent(studentSection)}` : ''}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ quizzes: [] })),
        fetch('/api/quizzes?history=1', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ history: [] })),
      ]);

      const topWeak = planRes?.weakTopics?.[0]?.topic;
      if (topWeak) setWeakTopic(topWeak);
      if (Array.isArray(lmsRes.courses)) setCourses(lmsRes.courses);
      if (Array.isArray(quizRes.quizzes)) setQuizzes(quizRes.quizzes);

      if (Array.isArray(histRes.history) && histRes.history.length > 0) {
        setQuizHistory(histRes.history);
        const scores = histRes.history.map((h: any) => h.score ?? 0);
        setAvgQuizScore(Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length));
        if (!topWeak) {
          const allWeak = histRes.history.flatMap((h: any) => h.weakTopics || []);
          if (allWeak.length > 0) setWeakTopic(allWeak[0]);
        }
      }

      const [secNotes, noticesRes] = await Promise.all([
        fetch(`/api/notes?section=${encodeURIComponent(studentSection)}`, { cache: 'no-store' }).then(r => r.json()).catch(() => ({ notes: [] })),
        fetch('/api/notices',  { cache: 'no-store' }).then(r => r.json()).catch(() => ({ notices: [] })),
      ]);
      const notesList = secNotes.notes ?? [];
      notesList.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotes(notesList);
      if (Array.isArray(noticesRes.notices)) setNotices(noticesRes.notices);
    } catch { /* keep defaults */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentSection]);

  /* 60-second polling — reduced from 30s for performance */
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  /* Sortable table — uses live records, falls back to empty array */
  const sorted = [...records].sort((a, b) => {
    const va = a[sortKey], vb = b[sortKey];
    return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
      : <ChevronDown className="w-3 h-3 opacity-30" />;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={t('attendanceOverview')} subtitle={`${t('currentSemester')} — ${studentSection}`} />

        <main className="flex-1 p-5 lg:p-7 space-y-5 overflow-y-auto">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900">{studentName}</h2>
              <p className="text-[13px] text-slate-400 mt-0.5">{studentSection} · {t('btech')}</p>
            </div>
            <SyncStamp date={lastUpdated} spinning={refreshing} />
          </div>

          {/* ── Stat row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title={t('attendanceSemester')}
              value={`${stats.percentage}%`}
              subtitle={t('presentAbsentOf', stats.presentCount, stats.absentCount, stats.totalClasses)}
              icon={CalendarCheck}
              trend={{ value: t('vsLastMonth'), isPositive: true }}
              accentColor="blue"
            />
            <StatCard
              title={t('studyStreak')}
              value={`${streakData.currentStreak} ${t('days')}`}
              subtitle={t('personalBest', streakData.longestStreak)}
              icon={Flame}
              accentColor="amber"
            />
            <StatCard
              title={t('avgQuizScore')}
              value={avgQuizScore !== null ? `${avgQuizScore}%` : '—'}
              subtitle={quizHistory.length > 0 ? `${t('attempts', quizHistory.length)} · ${studentSection}` : t('noAttemptsYet')}
              icon={BookOpen}
              trend={avgQuizScore !== null && avgQuizScore >= 75 ? { value: t('abovePassingThreshold'), isPositive: true } : undefined}
              accentColor="green"
            />
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{t('activeSubject')}</span>
              </div>
              <select
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
                className="w-full text-[13px] font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 cursor-pointer"
              >
                <option value="">Select subject…</option>
                {[...subjects, ...labs].map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 truncate">
                {weakTopic ? t('focus', weakTopic.slice(0, 30) + (weakTopic.length > 30 ? '…' : '')) : t('takeQuizForRec')}
              </p>
            </div>
          </div>

          {/* ── My Subjects & Labs ── */}
          {(subjects.length > 0 || labs.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[14px] font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> My Subjects & Labs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjects.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Theory Subjects</p>
                    <div className="space-y-1.5">
                      {subjects.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <span className="text-[10px] font-bold text-indigo-400 w-4 shrink-0">{i + 1}.</span>
                          <span className="text-[13px] font-medium text-indigo-900">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {labs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lab Subjects</p>
                    <div className="space-y-1.5">
                      {labs.map((l, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <span className="text-[10px] font-bold text-emerald-400 w-4 shrink-0">{i + 1}.</span>
                          <span className="text-[13px] font-medium text-emerald-900">{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Main content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Attendance chart — lazy loaded */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('weeklyAttendance')}</h3>
                  <p className="text-[11px] text-[#9CA3AF]">{t('percentPerDay')}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  stats.percentage >= 75
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                  {stats.percentage >= 75 ? t('eligibleForExams') : t('belowThreshold')}
                </span>
              </div>
              <AttendanceChart data={trend} />
            </div>

            {/* Pending tasks */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('pendingActions')}</h3>
                <span className="text-[11px] text-[#9CA3AF]">{t('items', tasks.length)}</span>
              </div>
              <div className="space-y-2">
                {tasks.map((task) => {
                  const Icon = task.icon;
                  const dueLabel = task.due === 'Due today' ? t('dueToday') : task.due === 'Recommended' ? t('recommended') : t('anonymous');
                  return (
                    <Link key={task.id} href={task.href}
                      className="flex items-start gap-3 p-3 rounded-md border border-[#E4E7EC] hover:border-[#3E4C8A]/30 hover:bg-[#F7F8FA] transition-colors group"
                    >
                      <Icon className="w-4 h-4 text-[#3E4C8A] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-[#1A1D23] group-hover:text-[#3E4C8A] transition-colors truncate">{task.title}</p>
                        <p className={`text-[11px] mt-0.5 ${task.urgent ? 'text-amber-600' : 'text-[#9CA3AF]'}`}>{dueLabel}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5 group-hover:text-[#3E4C8A] transition-colors" />
                    </Link>
                  );
                })}
              </div>

              {/* AI recommendation */}
              <div className="mt-4 pt-4 border-t border-[#E4E7EC]">
                <p className="text-[11px] font-semibold text-[#6B7280] mb-2">{t('aiRecommendation')}</p>
                <div className="flex items-start gap-2 p-3 rounded-md bg-[#EEF0F8] border border-[#C7D2FE]/50">
                  <Brain className="w-4 h-4 text-[#3E4C8A] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#3E4C8A] leading-relaxed">
                    {weakTopic
                      ? <>{t('spendMinOn', weakTopic)}</>
                      : t('completeQuizForAI')}
                  </p>
                </div>
                <Link href="/student/learning"
                  className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#3E4C8A] hover:underline"
                >
                  {t('openStudyPlan')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ── My Courses (LMS) ── */}
          {courses.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-[#3E4C8A]" />
                  <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('myCourses')}</h3>
                </div>
                <span className="text-[11px] text-[#9CA3AF]">{t('synced', courses.length)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {courses.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-md border border-[#E4E7EC] bg-[#F7F8FA] flex flex-col gap-1">
                    <p className="text-[13px] font-medium text-[#1A1D23] truncate">{c.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{c.section || c.subject || '—'}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium capitalize">{c.source?.replace('_', ' ')}</span>
                      {c.syncedAt && <span className="text-[10px] text-[#9CA3AF]">{new Date(c.syncedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Quiz Section ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3E4C8A]" />
                <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('practiceAssessments')}</h3>
              </div>
              <Link href="/student/quizzes" className="flex items-center gap-1 text-[12px] font-medium text-[#3E4C8A] hover:underline">
                {t('viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Available quizzes */}
              <div>
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">{t('available')}</p>
                {quizzes.length === 0 ? (
                  <p className="text-[12px] text-[#9CA3AF]">{t('noActiveAssessments')}</p>
                ) : (
                  <div className="space-y-2">
                    {quizzes.slice(0, 3).map((q: any) => (
                      <Link key={q._id} href="/student/quizzes"
                        className="flex items-center justify-between p-3 rounded-md border border-[#E4E7EC] hover:border-[#3E4C8A]/30 hover:bg-[#F7F8FA] transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#1A1D23] truncate">{q.subject} {t('diagnostic')}</p>
                          <p className="text-[11px] text-[#9CA3AF]">{t('questions', q.questions?.length ?? 0)}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 group-hover:text-[#3E4C8A] transition-colors" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent attempts */}
              <div>
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">{t('recentAttempts')}</p>
                {quizHistory.length === 0 ? (
                  <p className="text-[12px] text-[#9CA3AF]">{t('noAttemptsYetShort')}</p>
                ) : (
                  <div className="space-y-2">
                    {quizHistory.slice(0, 3).map((h: any, i: number) => {
                      const score = h.score ?? 0;
                      const color = score >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : score >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-md border border-[#E4E7EC] bg-[#F7F8FA]">
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1A1D23] truncate">{h.quizId?.subject ?? 'Quiz'}</p>
                            <p className="text-[11px] text-[#9CA3AF]">{h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '—'}</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${color}`}>{score}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Notes & Resources from Faculty ── */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3E4C8A]" />
                <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('notesAndResources')}</h3>
              </div>
              <span className="text-[11px] text-[#9CA3AF]">{t('fromYourFaculty')}</span>
            </div>
            {notes.length === 0 ? (
              <p className="text-[12px] text-[#9CA3AF]">{t('noNotesYet')}</p>
            ) : (
              <div className="space-y-3">
                {notes.slice(0, 5).map((n: any) => {
                  const typeColor = n.type === 'announcement'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : n.type === 'resource'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  const TypeIcon = n.type === 'announcement' ? Megaphone : n.type === 'resource' ? LinkIcon : FileText;
                  return (
                    <div key={n._id} className={`flex items-start gap-3 p-3 rounded-md border ${n.type === 'announcement' ? 'border-amber-200 bg-amber-50/40' : 'border-[#E4E7EC]'}`}>
                      <span className={`mt-0.5 p-1.5 rounded-lg border text-xs ${typeColor}`}>
                        <TypeIcon className="w-3.5 h-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-[#1A1D23] truncate">{n.title}</p>
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${typeColor}`}>{n.type}</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] mt-0.5 line-clamp-2">{n.content}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-[#9CA3AF]">{n.subject}</span>
                          <span className="text-[10px] text-[#9CA3AF] flex items-center gap-1">
                            <Clock className="w-3 h-3" />{new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          {n.uploadedBy?.name && <span className="text-[10px] text-[#9CA3AF]">{t('by')} {n.uploadedBy.name}</span>}
                        </div>
                        {n.resourceUrl && (
                          <a href={n.resourceUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-1 text-[11px] text-emerald-600 hover:underline flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" /> {t('openResource')}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Faculty Notices ── */}
          {notices.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[14px] font-semibold text-[#1A1D23]">{t('noticesFromFaculty')}</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{t('unread', notices.filter((n:any) => !n.isRead).length)}</span>
              </div>
              <div className="space-y-2">
                {notices.slice(0, 4).map((n: any, i: number) => {
                  const typeColor = n.type === 'urgent' ? 'border-rose-200 bg-rose-50/50 text-rose-700'
                    : n.type === 'warning'      ? 'border-amber-200 bg-amber-50/50 text-amber-700'
                    : n.type === 'appreciation' ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                    : 'border-indigo-200 bg-indigo-50/50 text-indigo-700';
                  return (
                    <div key={i} className={`p-3 rounded-md border ${typeColor}`}>
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[12px] font-bold truncate">{n.subject}</p>
                        <span className="text-[10px] opacity-70 shrink-0 capitalize">{n.type}</span>
                      </div>
                      <p className="text-[11px] opacity-80 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] opacity-60 mt-1">{n.facultyId?.name || 'Faculty'} · {new Date(n.createdAt).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Attendance records table ── */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">{t('attendanceRecords')}</h3>
                <p className="text-[11px] text-slate-400">{t('clickToSort')}</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#6B7280]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('present')}: {stats.presentCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> {t('absent')}: {stats.absentCount}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {t('late')}: {sorted.filter(r => r.status === 'Late').length}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {([
                      { key: 'date',    label: t('date')    },
                      { key: 'subject', label: t('subject') },
                      { key: 'status',  label: t('status')  },
                      { key: 'time',    label: t('time')    },
                    ] as { key: SortKey; label: string }[]).map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 select-none"
                      >
                        <span className="flex items-center gap-1">
                          {col.label} <SortIcon k={col.key} />
                        </span>
                      </th>
                    ))}
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('faculty')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {sorted.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-800 tabular-nums whitespace-nowrap text-[13px]">{row.date}</td>
                      <td className="px-5 py-3.5 text-slate-800 max-w-[220px] truncate text-[13px]">{row.subject}</td>
                      <td className="px-5 py-3.5"><StatusChip status={row.status} /></td>
                      <td className="px-5 py-3.5 text-slate-500 tabular-nums whitespace-nowrap text-[13px]">{row.time}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[13px]">{row.faculty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>{t('showingRecords', sorted.length)}</span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                {t('minAttendance')}
              </span>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
