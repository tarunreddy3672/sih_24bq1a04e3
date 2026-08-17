'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import StreakFlame from '@/components/dashboard/StreakFlame';
import ProgressRing from '@/components/shared/ProgressRing';
import Badge from '@/components/shared/Badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function StudentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({
    currentStreak: 14,
    longestStreak: 21,
    badges: ['14-Day Consistency Master', 'VLSI Quiz Champion', 'Perfect Morning Attendance'],
  });
  const [attendanceStats, setAttendanceStats] = useState({
    percentage: 94,
    presentCount: 22,
    absentCount: 2,
    totalClasses: 24,
  });

  const attendanceTrendData = [
    { day: 'Mon', attendance: 100 },
    { day: 'Tue', attendance: 100 },
    { day: 'Wed', attendance: 80 },
    { day: 'Thu', attendance: 100 },
    { day: 'Fri', attendance: 100 },
    { day: 'Sat', attendance: 90 },
    { day: 'Today', attendance: 94 },
  ];

  const todaysTasks = [
    {
      id: 1,
      title: 'Digital Electronics Practice Sprint',
      desc: '4 conceptual questions on MOSFET transconductance and CMOS timing',
      href: '/student/quizzes',
      badge: 'Due 11:59 PM',
      badgeVariant: 'amber' as const,
      completed: false,
    },
    {
      id: 2,
      title: 'AI Synthesis: Revise MOSFET Biasing',
      desc: 'Targeted micro-revision generated from last diagnostic assessment',
      href: '/student/learning',
      badge: 'AI Tutor',
      badgeVariant: 'indigo' as const,
      completed: false,
    },
    {
      id: 3,
      title: 'Submit Digital Electronics Lecture Feedback',
      desc: 'Anonymous pedagogical feedback for Dr. Priya Nair',
      href: '/student/feedback',
      badge: 'Anonymous',
      badgeVariant: 'slate' as const,
      completed: true,
    },
  ];

  useEffect(() => {
    async function loadStudentTelemetry() {
      try {
        const [streakRes, attRes] = await Promise.all([
          fetch('/api/streaks').then((r) => r.json()),
          fetch('/api/attendance').then((r) => r.json()),
        ]);

        if (streakRes.streak) setStreakData(streakRes.streak);
        if (attRes.percentage) {
          setAttendanceStats({
            percentage: attRes.percentage,
            presentCount: attRes.presentCount,
            absentCount: attRes.absentCount,
            totalClasses: attRes.presentCount + attRes.absentCount,
          });
        }
      } catch (e) {
        console.warn('Using local telemetry state');
      } finally {
        setLoading(false);
      }
    }
    loadStudentTelemetry();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="student" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Student Academic Terminal" roleBadge="STUDENT" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="study-card p-6 sm:p-7 bg-gradient-to-r from-indigo-50/80 via-white to-blue-50/60 border-indigo-200/80 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="relative z-10 space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Daily Study Session Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, Aarav Sharma
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                You’re on a <span className="text-amber-600 font-bold">{streakData.currentStreak}-day learning streak</span>. Your course attendance improved <span className="text-emerald-600 font-bold">+6%</span> this month.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <StreakFlame streak={streakData.currentStreak} size="md" />
            </div>
          </div>

          {/* Key Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Attendance Rate"
              value={`${attendanceStats.percentage}%`}
              subtitle={`${attendanceStats.presentCount} of ${attendanceStats.totalClasses} sessions attended`}
              icon={CalendarCheck}
              trend={{ value: '6%', isPositive: true }}
              accentColor="indigo"
            />
            <StatCard
              title="Current Streak"
              value={`${streakData.currentStreak} Days`}
              subtitle={`Personal record: ${streakData.longestStreak} days`}
              icon={Flame}
              trend={{ value: '3 days to badge', isPositive: true }}
              accentColor="amber"
            />
            <StatCard
              title="Average Quiz Score"
              value="88%"
              subtitle="Top 5% in Section CSE-A"
              icon={BookOpen}
              trend={{ value: '4%', isPositive: true }}
              accentColor="emerald"
            />
            <StatCard
              title="Active Subject"
              value="VLSI & CMOS"
              subtitle="Focus Topic: MOSFET Biasing"
              icon={GraduationCap}
              accentColor="cyan"
            />
          </div>

          {/* Main Visual Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Attendance Analytics Card */}
            <div className="lg:col-span-7 study-card p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-indigo-600" />
                    Biometric Attendance Record
                  </h3>
                  <p className="text-xs text-slate-500">Weekly verification verified via face-api.js</p>
                </div>
                <Badge variant="indigo" size="sm">
                  {attendanceStats.percentage}% Target Met
                </Badge>
              </div>

              {/* Chart & Ring Combo */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-2">
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-2">
                  <ProgressRing percentage={attendanceStats.percentage} size={110} strokeWidth={9} color="#4F46E5" label="Present" />
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" /> {attendanceStats.presentCount} Present
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> {attendanceStats.absentCount} Absent
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-8 h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorStudentAtt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} domain={[60, 100]} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#0F172A',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Area type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStudentAtt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insight Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <TrendingUp className="w-3.5 h-3.5" /> High standing for semester examination eligibility
                </span>
                <span className="font-mono text-[10px]">Min. Required: 75%</span>
              </div>
            </div>

            {/* Today's Actionable Tasks */}
            <div className="lg:col-span-5 study-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Today’s Study Tasks
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">2 of 3 Completed</span>
                </div>

                <div className="space-y-3">
                  {todaysTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={task.href}
                      className="block p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {task.title}
                        </h4>
                        <Badge variant={task.badgeVariant} size="sm">
                          {task.badge}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{task.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Earned Badges Showcase */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Unlocked Achievement Badges
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {streakData.badges.map((b, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium flex items-center gap-1"
                    >
                      <Award className="w-3 h-3 text-amber-600" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Study Recommendation */}
          <div className="study-card p-5 border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  AI Adaptive Recommendation
                </h4>
                <p className="text-xs text-slate-700">
                  You are strongest in <span className="font-semibold text-slate-900">Digital Logic Circuits</span>. Spend 15 minutes reviewing <span className="font-semibold text-amber-700">MOSFET small-signal transconductance</span> before the next scheduled quiz.
                </p>
              </div>
            </div>
            <Link
              href="/student/learning"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>Open Study Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
