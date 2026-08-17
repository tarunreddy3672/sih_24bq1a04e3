'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  CalendarCheck,
  Award,
  Sparkles,
  TrendingUp,
  Activity,
  Flame,
  Search,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  Star,
  CheckCircle2,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import WowInsightCard from '@/components/dashboard/WowInsightCard';
import StudentDrilldownModal from '@/components/dashboard/StudentDrilldownModal';
import Badge from '@/components/shared/Badge';
import GlassCard from '@/components/shared/GlassCard';
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

export default function AdminControlTowerPage() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'leaderboard'>('overview');
  const [actionSuccess, setActionSuccess] = useState(false);

  // Institution Telemetry State
  const [analytics, setAnalytics] = useState({
    totalStudents: 480,
    totalFaculty: 32,
    averageAttendance: 91.4,
    averageQuizScore: 84.2,
    activeClassesCount: 6,
    activeClasses: [
      { id: '1', class: 'CSE-A', subject: 'Digital Electronics & VLSI', faculty: 'Dr. Priya Nair', present: 56, absent: 4, total: 60, attendancePercent: 93, status: 'Active' as const },
      { id: '2', class: 'CSE-B', subject: 'Data Structures & Algorithms', faculty: 'Prof. Rajesh Gupta', present: 48, absent: 12, total: 60, attendancePercent: 80, status: 'Active' as const },
      { id: '3', class: 'ECE-A', subject: 'Signals & Systems', faculty: 'Dr. Ananya Sen', present: 52, absent: 6, total: 58, attendancePercent: 89, status: 'Active' as const },
      { id: '4', class: 'IT-A', subject: 'Database Management Systems', faculty: 'Prof. Vikram Rao', present: 58, absent: 2, total: 60, attendancePercent: 96, status: 'Active' as const },
      { id: '5', class: 'AI-A', subject: 'Deep Learning & Neural Nets', faculty: 'Dr. Meera Iyer', present: 44, absent: 6, total: 50, attendancePercent: 88, status: 'Upcoming' as const },
      { id: '6', class: 'CSE-C', subject: 'Computer Networks', faculty: 'Prof. S. Verma', present: 55, absent: 5, total: 60, attendancePercent: 91, status: 'Completed' as const },
    ],
    attendanceTrends: [
      { date: 'Mon', attendance: 92 },
      { date: 'Tue', attendance: 94 },
      { date: 'Wed', attendance: 88 },
      { date: 'Thu', attendance: 91 },
      { date: 'Fri', attendance: 95 },
      { date: 'Sat', attendance: 89 },
      { date: 'Today', attendance: 91.4 },
    ],
    quizPerformance: [
      { subject: 'Digital Elec.', averageScore: 86, attemptsCount: 142 },
      { subject: 'DSA', averageScore: 78, attemptsCount: 198 },
      { subject: 'Signals', averageScore: 82, attemptsCount: 110 },
      { subject: 'DBMS', averageScore: 89, attemptsCount: 165 },
      { subject: 'Networks', averageScore: 81, attemptsCount: 130 },
    ],
    streakLeaderboard: [
      { id: '64f1a2b3c4d5e6f7a8b9c001', name: 'Aarav Sharma', streak: 14, badges: ['14-Day Consistency Master', 'VLSI Quiz Champion'], classOrSubject: 'CSE-A' },
      { id: '64f1a2b3c4d5e6f7a8b9c002', name: 'Diya Patel', streak: 9, badges: ['7-Day Spark', 'DSA Prodigy'], classOrSubject: 'CSE-A' },
      { id: '64f1a2b3c4d5e6f7a8b9c003', name: 'Aditya Mehta', streak: 8, badges: ['7-Day Spark'], classOrSubject: 'IT-A' },
      { id: '64f1a2b3c4d5e6f7a8b9c007', name: 'Sanya Kapoor', streak: 7, badges: ['7-Day Spark'], classOrSubject: 'ECE-A' },
      { id: '64f1a2b3c4d5e6f7a8b9c008', name: 'Rohan Verma', streak: 5, badges: ['Weekly Warrior'], classOrSubject: 'CSE-B' },
    ],
  });

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/institution-analytics');
        const data = await res.json();
        if (data.analytics) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.warn('Using local telemetry state');
      }
    }
    loadAnalytics();
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
    <div className="flex min-h-screen bg-[#070B14] text-slate-100">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Institutional Command Control Tower" roleBadge="ADMIN" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 live-indicator" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Campus 360 Telemetry Online • Smart India Hackathon Demonstration Build
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Institution Operations & Intelligence Terminal
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="amber" size="md" dot>
                {analytics.activeClassesCount} Active Class Sessions Live
              </Badge>
            </div>
          </div>

          {actionSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Remediation Directive Dispatched! Automated check-in reminders queued for Section CSE-B students.</span>
            </motion.div>
          )}

          {/* 1. THE WOW INSIGHT CARD (Section 33 - Priority #1) */}
          <WowInsightCard
            onTriggerAction={handleExecuteDirective}
          />

          {/* 2. Key Institution Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Enrolled Students"
              value={analytics.totalStudents}
              subtitle="4 Engineering Departments"
              icon={Users}
              trend={{ value: '100% Biometric Enrolled', isPositive: true }}
              accentColor="cyan"
            />
            <StatCard
              title="Campus Attendance"
              value={`${analytics.averageAttendance}%`}
              subtitle="+1.8% vs last week"
              icon={CalendarCheck}
              trend={{ value: '1.8%', isPositive: true }}
              accentColor="emerald"
            />
            <StatCard
              title="Average Quiz Score"
              value={`${analytics.averageQuizScore}%`}
              subtitle="Aggregated across 845 attempts"
              icon={Award}
              trend={{ value: '3.2%', isPositive: true }}
              accentColor="indigo"
            />
            <StatCard
              title="Active Faculty On-Duty"
              value={analytics.totalFaculty}
              subtitle="6 Live Biometric Terminals"
              icon={Activity}
              accentColor="amber"
            />
          </div>

          {/* 3. Live Active Class Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Real-Time Classroom Telemetry Stream
                </h3>
                <p className="text-xs text-slate-400">Live biometric attendance feeds verified per lecture block</p>
              </div>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 live-indicator" />
                Live Sync (3s Interval)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.activeClasses.map((cls) => {
                const isUnderperforming = cls.attendancePercent < 85;
                return (
                  <div
                    key={cls.id}
                    className={`glass-panel p-5 rounded-2xl border transition-all ${
                      isUnderperforming
                        ? 'border-amber-500/40 bg-amber-950/10'
                        : 'border-white/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                          {cls.class}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-tight">{cls.subject}</h4>
                        <p className="text-xs text-slate-400">{cls.faculty}</p>
                      </div>
                      <Badge
                        variant={cls.status === 'Active' ? 'emerald' : cls.status === 'Upcoming' ? 'cyan' : 'slate'}
                        size="sm"
                        dot={cls.status === 'Active'}
                      >
                        {cls.status}
                      </Badge>
                    </div>

                    {/* Attendance Bar */}
                    <div className="my-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300">
                          {cls.present} / {cls.total} Present
                        </span>
                        <span className={`font-bold ${cls.attendancePercent >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {cls.attendancePercent}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            cls.attendancePercent >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'
                          }`}
                          style={{ width: `${cls.attendancePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                      <span>Absent: {cls.absent} students</span>
                      {isUnderperforming && <span className="text-amber-400 font-semibold">Flagged Anomaly</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Institutional Analytics: Attendance Trends & Quiz Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Attendance Trend Chart */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Campus-Wide Attendance Trend</h3>
                  <p className="text-xs text-slate-400">Weekly trajectory across all 6 sections</p>
                </div>
                <Badge variant="cyan" size="sm">
                  Target: &gt;90%
                </Badge>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.attendanceTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAdminAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis domain={[75, 100]} stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="attendance" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorAdminAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quiz Performance by Subject */}
            <div className="lg:col-span-6 glass-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Diagnostic Score by Discipline</h3>
                  <p className="text-xs text-slate-400">Average MCQ mastery rates</p>
                </div>
                <Badge variant="indigo" size="sm">
                  Mean: 84.2%
                </Badge>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.quizPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="subject" stroke="#64748B" fontSize={10} />
                    <YAxis domain={[50, 100]} stroke="#64748B" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="averageScore" fill="#6366F1" radius={[6, 6, 0, 0]} name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5. Streak Leaderboard & Student Drill-Down Trigger */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Campus Streak & Consistency Champions
                </h3>
                <p className="text-xs text-slate-400">
                  Click any student name to inspect authorized telemetry dossier and weak topics
                </p>
              </div>

              <span className="text-xs text-cyan-400 font-mono">
                Top 5 High-Consistency Scholars
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {analytics.streakLeaderboard.map((student, idx) => (
                <div
                  key={idx}
                  onClick={() => handleOpenStudentDrilldown(student.id)}
                  className="p-4 rounded-xl bg-slate-950/70 border border-white/10 hover:border-cyan-400/50 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">{student.classOrSubject}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-[11px] font-mono font-bold text-orange-400 flex items-center gap-1 mt-1">
                      <Flame className="w-3 h-3 fill-orange-400 text-orange-400" />
                      {student.streak} Days
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Inspect Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
