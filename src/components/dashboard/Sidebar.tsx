'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  Camera,
  PlusCircle,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

interface SidebarProps {
  role?: 'student' | 'faculty' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentRole = role || (session?.user as any)?.role || 'student';

  const studentNav = [
    { name: 'My Dashboard', href: '/student/dashboard', icon: GraduationCap },
    { name: 'Study Plan & Tutor', href: '/student/learning', icon: BookOpen, badge: 'AI Tutor' },
    { name: 'Practice Quizzes', href: '/student/quizzes', icon: HelpCircle },
    { name: 'Course Feedback', href: '/student/feedback', icon: MessageSquare },
  ];

  const facultyNav = [
    { name: 'Class Attendance', href: '/faculty/attendance', icon: Camera, badge: 'Biometric' },
    { name: 'Class Analytics', href: '/faculty/classes', icon: Users },
    { name: 'Create Quiz', href: '/faculty/quizzes/create', icon: PlusCircle },
    { name: 'Feedback Review', href: '/faculty/feedback-review', icon: MessageSquare },
  ];

  const adminNav = [
    { name: 'Control Tower', href: '/admin/control-tower', icon: ShieldCheck, badge: 'Overview' },
  ];

  const navItems = currentRole === 'admin' ? adminNav : currentRole === 'faculty' ? facultyNav : studentNav;

  const roleLabels = {
    student: { title: 'Student Portal', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    faculty: { title: 'Faculty Suite', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    admin: { title: 'Control Tower', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  };

  const currentRoleInfo = roleLabels[currentRole as keyof typeof roleLabels] || roleLabels.student;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-screen relative z-20 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">
              EduVision
            </span>
            <span className="text-[10px] text-slate-500 block -mt-1">Academic Learning OS</span>
          </div>
        </Link>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-4 py-3">
        <div className={`px-3 py-1.5 rounded-xl border flex items-center justify-between ${currentRoleInfo.badge}`}>
          <span className="text-xs font-semibold">
            {currentRoleInfo.title}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 live-indicator" />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'text-indigo-700 bg-indigo-50/80 border border-indigo-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-indigo-100">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Demo Role Switcher */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Demo Role Switch
        </p>
        <div className="grid grid-cols-3 gap-1">
          <Link
            href="/student/dashboard"
            className={`px-2 py-1.5 text-center rounded-lg text-[10px] font-semibold transition-all ${
              currentRole === 'student' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Student
          </Link>
          <Link
            href="/faculty/attendance"
            className={`px-2 py-1.5 text-center rounded-lg text-[10px] font-semibold transition-all ${
              currentRole === 'faculty' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Faculty
          </Link>
          <Link
            href="/admin/control-tower"
            className={`px-2 py-1.5 text-center rounded-lg text-[10px] font-semibold transition-all ${
              currentRole === 'admin' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Sign out section */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent transition-all"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            End Session
          </span>
          <span className="text-[10px] text-slate-400">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
