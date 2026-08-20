'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap, BookOpen, HelpCircle, MessageSquare,
  Users, Camera, PlusCircle, ShieldCheck, Video, FileText,
  ClipboardList, BarChart2, ScanFace, LifeBuoy, Globe,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useLang, type Lang } from '@/lib/i18n';

interface SidebarProps { role?: 'student' | 'faculty' | 'admin'; }

const studentNav = [
  { key: 'dashboard',     href: '/student/dashboard',     icon: GraduationCap },
  { key: 'studyPlan',     href: '/student/learning',      icon: BookOpen,     tag: 'AI' },
  { key: 'quizzes',       href: '/student/quizzes',       icon: HelpCircle },
  { key: 'videoLectures', href: '/student/videos',        icon: Video },
  { key: 'registerFace',  href: '/student/register-face', icon: ScanFace,     tag: 'New' },
  { key: 'feedback',      href: '/student/feedback',      icon: MessageSquare },
  { key: 'myProfile',     href: '/student/profile',       icon: Users },
  { key: 'help',          href: '/student/help',          icon: LifeBuoy },
] as const;

const facultyNav = [
  { key: 'attendance',        href: '/faculty/attendance',        icon: Camera,        tag: 'Live' },
  { key: 'manualAttendance',  href: '/faculty/manual-attendance', icon: ClipboardList },
  { key: 'students',          href: '/faculty/students',          icon: Users },
  { key: 'classAnalytics',    href: '/faculty/classes',           icon: BarChart2 },
  { key: 'myQuizzes',         href: '/faculty/quizzes',           icon: ClipboardList },
  { key: 'createQuiz',        href: '/faculty/quizzes/create',    icon: PlusCircle },
  { key: 'videoLectures',     href: '/faculty/videos/upload',     icon: Video,         tag: 'New' },
  { key: 'notesResources',    href: '/faculty/notes',             icon: FileText },
  { key: 'feedback',          href: '/faculty/feedback-review',   icon: MessageSquare },
  { key: 'help',              href: '/faculty/help',              icon: LifeBuoy },
] as const;

const adminNav = [
  { key: 'controlTower', href: '/admin/control-tower', icon: ShieldCheck, tag: 'Live' },
] as const;

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'te', label: 'తె' },
  { code: 'hi', label: 'हि' },
];

const roleConfig = {
  student: { gradient: 'from-indigo-600 to-violet-600', label: 'Student Portal', dot: 'bg-indigo-400' },
  faculty: { gradient: 'from-emerald-600 to-teal-600',  label: 'Faculty Console', dot: 'bg-emerald-400' },
  admin:   { gradient: 'from-amber-500 to-orange-500',  label: 'Control Tower',  dot: 'bg-amber-400' },
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang, setLang, t } = useLang();

  const currentRole = (role || (session?.user as any)?.role || 'student') as 'student' | 'faculty' | 'admin';
  const navItems = currentRole === 'admin' ? adminNav : currentRole === 'faculty' ? facultyNav : studentNav;
  const rc = roleConfig[currentRole];

  return (
    <aside className="w-64 flex flex-col shrink-0 min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)' }}>

      {/* Brand */}
      <div className="h-16 px-5 flex items-center border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[15px] font-bold text-white tracking-tight block">EduVision</span>
            <span className="text-[10px] text-white/40 font-mono">{rc.label}</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">
          {t('menu')}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                isActive
                  ? `bg-gradient-to-r ${rc.gradient} text-white shadow-lg`
                  : 'text-white/50 hover:text-white hover:bg-white/8'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-white' : 'text-white/40'}`} />
                {t(item.key as any)}
              </span>
              {'tag' in item && item.tag && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'
                }`}>
                  {item.tag}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Language switcher */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <div className="px-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="w-3 h-3 text-white/30" />
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">{t('language')}</span>
          </div>
          <div className="flex gap-1">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  lang === code
                    ? `bg-gradient-to-r ${rc.gradient} text-white shadow-md`
                    : 'bg-white/8 text-white/40 hover:bg-white/15 hover:text-white/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
