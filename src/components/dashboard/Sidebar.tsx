'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Users,
  Camera,
  Layers,
  PlusCircle,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface SidebarProps {
  role?: 'student' | 'faculty' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentRole = role || (session?.user as any)?.role || 'student';

  const studentNav = [
    { name: 'Dashboard', href: '/student/dashboard', icon: GraduationCap },
    { name: 'AI Study & Tutor', href: '/student/learning', icon: Sparkles, badge: 'Claude AI' },
    { name: 'Adaptive Quizzes', href: '/student/quizzes', icon: BookOpen },
    { name: 'Faculty Feedback', href: '/student/feedback', icon: MessageSquare },
  ];

  const facultyNav = [
    { name: 'Face Attendance', href: '/faculty/attendance', icon: Camera, badge: 'Live AI' },
    { name: 'Class Analytics', href: '/faculty/classes', icon: Users },
    { name: 'Quiz Builder', href: '/faculty/quizzes/create', icon: PlusCircle },
    { name: 'Feedback Review', href: '/faculty/feedback-review', icon: MessageSquare },
  ];

  const adminNav = [
    { name: 'Control Tower', href: '/admin/control-tower', icon: ShieldCheck, badge: 'Campus 360' },
  ];

  const navItems = currentRole === 'admin' ? adminNav : currentRole === 'faculty' ? facultyNav : studentNav;

  const roleLabels = {
    student: { title: 'Student Portal', color: 'text-cyan-400', border: 'border-cyan-500/20 bg-cyan-500/10' },
    faculty: { title: 'Faculty Suite', color: 'text-indigo-400', border: 'border-indigo-500/20 bg-indigo-500/10' },
    admin: { title: 'Control Tower', color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/10' },
  };

  const currentRoleInfo = roleLabels[currentRole as keyof typeof roleLabels] || roleLabels.student;

  return (
    <aside className="w-64 bg-[#090D18]/90 border-r border-white/10 flex flex-col shrink-0 min-h-screen relative z-20 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white font-mono flex items-center gap-1">
              EduVision<span className="text-cyan-400">.AI</span>
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-sans">Smart Education OS</span>
          </div>
        </Link>
      </div>

      {/* Role Pill Indicator */}
      <div className="px-4 py-3">
        <div className={`px-3 py-1.5 rounded-xl border flex items-center justify-between ${currentRoleInfo.border}`}>
          <span className={`text-xs font-semibold ${currentRoleInfo.color}`}>
            {currentRoleInfo.title}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-indicator" />
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
              className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'text-white bg-slate-800/80 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Switch Role Quick Links (For SIH Judges & Demo) */}
      <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          ⚡ Demo Role Switch
        </p>
        <div className="grid grid-cols-3 gap-1">
          <Link
            href="/student/dashboard"
            className={`px-2 py-1 text-center rounded text-[10px] font-medium transition-all ${
              currentRole === 'student' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Student
          </Link>
          <Link
            href="/faculty/attendance"
            className={`px-2 py-1 text-center rounded text-[10px] font-medium transition-all ${
              currentRole === 'faculty' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Faculty
          </Link>
          <Link
            href="/admin/control-tower"
            className={`px-2 py-1 text-center rounded text-[10px] font-medium transition-all ${
              currentRole === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Sign out section */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            End Session
          </span>
          <span className="text-[10px] text-slate-500">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
