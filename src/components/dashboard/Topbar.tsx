'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, Search, Settings, LogOut, User, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';

const LiveClock = memo(function LiveClock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="text-[12px] font-mono text-slate-500 tabular-nums">{time}</span>;
});

const NOTIFICATIONS = [
  { id: 1, title: 'Quiz result available', body: 'Digital Electronics — Score: 88%', time: '2m ago', unread: true },
  { id: 2, title: 'Study streak milestone', body: 'You\'ve maintained a 14-day streak!', time: '1h ago', unread: true },
  { id: 3, title: 'New study plan generated', body: 'Gemini AI updated your revision schedule', time: '3h ago', unread: false },
  { id: 4, title: 'Attendance recorded', body: 'Present — Digital Electronics, 9:00 AM', time: 'Yesterday', unread: false },
];

interface TopbarProps { title?: string; subtitle?: string; roleBadge?: string; }

const roleGradient: Record<string, string> = {
  student: 'from-indigo-500 to-violet-500',
  faculty: 'from-emerald-500 to-teal-500',
  admin:   'from-amber-500 to-orange-500',
};

export default function Topbar({ title, subtitle, roleBadge }: TopbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const handleSignOut = useCallback(() => signOut({ callbackUrl: '/login' }), []);
  const userName  = session?.user?.name  || 'Authorized User';
  const userRole  = (session?.user as any)?.role || 'student';
  const userEmail = session?.user?.email || '';
  const initials  = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => n.unread).length;

  const profileLinks: Record<string, { label: string; href: string }[]> = {
    student: [
      { label: 'My Dashboard', href: '/student/dashboard' },
      { label: 'My Profile',   href: '/student/profile'   },
      { label: 'Study Plan',   href: '/student/learning'  },
    ],
    faculty: [
      { label: 'Attendance',      href: '/faculty/attendance' },
      { label: 'Class Analytics', href: '/faculty/classes'    },
    ],
    admin: [
      { label: 'Control Tower', href: '/admin/control-tower' },
    ],
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, unread: false })));
  const dismiss = (id: number) => setNotifications(n => n.filter(x => x.id !== id));
  const grad = roleGradient[userRole] || roleGradient.student;

  return (
    <header className="h-14 bg-white/95 backdrop-blur border-b border-slate-200/80 px-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {title && (
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
          </div>
        )}
        {roleBadge && (
          <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest bg-gradient-to-r ${grad} text-white shadow-sm`}>
            {roleBadge}
          </span>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 w-44 focus-within:border-indigo-300 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input type="text" placeholder="Search..." className="bg-transparent text-[12px] text-slate-700 placeholder-slate-400 outline-none w-full" />
        </div>

        {/* Clock */}
        <div className="hidden md:flex items-center px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <LiveClock />
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-white hover:border-slate-300 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br ${grad} text-white text-[9px] font-bold flex items-center justify-center shadow-sm`}>
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="text-[13px] font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-indigo-600 hover:underline font-semibold">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="text-[12px] text-slate-400 text-center py-6">No notifications</p>
                ) : notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${n.unread ? 'bg-indigo-50/40' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? `bg-gradient-to-br ${grad}` : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-900 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{n.body}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                    <button onClick={() => dismiss(n.id)} className="text-slate-300 hover:text-slate-500 shrink-0 mt-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative pl-2 border-l border-slate-200">
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm`}>
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-slate-900 leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-400 leading-tight capitalize">{userRole}</p>
            </div>
            <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[13px] font-bold shrink-0 shadow-sm`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{userName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
                  </div>
                </div>
              </div>
              <div className="py-1">
                {(profileLinks[userRole] || profileLinks.student).map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {link.label}
                  </Link>
                ))}
                <Link href="/settings" onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors">
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-slate-100 py-1">
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-rose-600 hover:bg-rose-50 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
