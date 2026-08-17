'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import StatCard from '@/components/dashboard/StatCard';
import Badge from '@/components/shared/Badge';
import DataTable from '@/components/shared/DataTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function FacultyClassesPage() {
  const [selectedClass, setSelectedClass] = useState('CSE-A');

  const classRoster = [
    {
      id: '1',
      name: 'Aarav Sharma',
      email: 'student@eduvision.ai',
      attendancePct: 94,
      avgQuizScore: 88,
      weakTopic: 'MOSFET Biasing',
      status: 'Top Performer',
    },
    {
      id: '2',
      name: 'Diya Patel',
      email: 'diya@eduvision.ai',
      attendancePct: 92,
      avgQuizScore: 85,
      weakTopic: 'Balanced Trees',
      status: 'Consistent',
    },
    {
      id: '3',
      name: 'Rohan Verma',
      email: 'rohan@eduvision.ai',
      attendancePct: 80,
      avgQuizScore: 72,
      weakTopic: 'CMOS Delay Models',
      status: 'Needs Attention',
    },
  ];

  const weakTopicTrend = [
    { topic: 'MOSFET Biasing', missCount: 14 },
    { topic: 'CMOS Propagation Delay', missCount: 11 },
    { topic: 'Sequential Flip-Flops', missCount: 7 },
    { topic: 'Timing Skew Margins', missCount: 4 },
  ];

  const columns = [
    { header: 'Student Name', accessorKey: 'name' as const, className: 'font-semibold text-slate-900' },
    { header: 'Email ID', accessorKey: 'email' as const, className: 'font-mono text-xs text-slate-500' },
    {
      header: 'Attendance %',
      cell: (row: any) => (
        <span className={`font-mono font-bold ${row.attendancePct >= 85 ? 'text-emerald-700' : 'text-amber-700'}`}>
          {row.attendancePct}%
        </span>
      ),
    },
    {
      header: 'Avg. Score',
      cell: (row: any) => <span className="font-mono text-indigo-600 font-bold">{row.avgQuizScore}%</span>,
    },
    {
      header: 'Identified Weak Concept',
      cell: (row: any) => (
        <Badge variant="amber" size="sm">
          {row.weakTopic}
        </Badge>
      ),
    },
    {
      header: 'Standing',
      cell: (row: any) => (
        <Badge variant={row.status === 'Top Performer' ? 'indigo' : row.status === 'Consistent' ? 'emerald' : 'red'} size="sm">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar role="faculty" />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Class Roster & Cohort Analytics" roleBadge="FACULTY" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Class Performance & Cohort Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time correlation between attendance rates and diagnostic quiz outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 outline-none shadow-2xs"
              >
                <option value="CSE-A">Cohort CSE-A (Digital Electronics)</option>
                <option value="CSE-B">Cohort CSE-B (Data Structures)</option>
              </select>
            </div>
          </div>

          {/* Metric Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Enrolled Cohort"
              value="60 Students"
              subtitle="Section CSE-A • Semester 4"
              icon={Users}
              accentColor="indigo"
            />
            <StatCard
              title="Cohort Attendance"
              value="93.4%"
              subtitle="+2.4% above institutional avg"
              icon={CalendarCheck}
              trend={{ value: '2.4%', isPositive: true }}
              accentColor="emerald"
            />
            <StatCard
              title="Average Quiz Score"
              value="84.6%"
              subtitle="Based on 4 diagnostic assessments"
              icon={Award}
              accentColor="cyan"
            />
            <StatCard
              title="Flagged for Review"
              value="3 Students"
              subtitle="Attendance < 80% or Quiz < 65%"
              icon={AlertTriangle}
              accentColor="amber"
            />
          </div>

          {/* Weak Topic Cohort Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 study-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Cohort Weak-Topic Distribution (Frequency of Missed Concepts)
                  </h3>
                  <p className="text-xs text-slate-500">Identifies concepts requiring re-explanation in the next lecture session</p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weakTopicTrend} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 0 }}>
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                    <YAxis dataKey="topic" type="category" stroke="#475569" fontSize={11} width={130} />
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
                    <Bar dataKey="missCount" fill="#F59E0B" radius={[0, 6, 6, 0]} name="Students Missed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Pedagogical Suggestion card */}
            <div className="lg:col-span-4 study-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Pedagogical Suggestion</h3>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-4">
                  <strong className="text-amber-800">MOSFET Biasing</strong> was missed by 23% of Section CSE-A in the latest quiz.
                </p>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">Recommended Action:</p>
                  <p>• Dedicate the first 10 minutes of Monday's session to small-signal numerical derivations.</p>
                  <p>• Push an automated 3-question follow-up micro quiz to student dashboards.</p>
                </div>
              </div>

              <a
                href="/faculty/quizzes/create"
                className="mt-4 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Author Targeted Remediation Quiz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="study-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                Active Class Roster
              </h3>
              <Badge variant="indigo" size="sm">
                MongoDB Synchronized
              </Badge>
            </div>

            <DataTable columns={columns} data={classRoster} />
          </div>
        </main>
      </div>
    </div>
  );
}
