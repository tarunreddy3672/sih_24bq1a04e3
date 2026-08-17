'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';
import { Bell, Clock, Sparkles } from 'lucide-react';

interface TopbarProps {
  title?: string;
  roleBadge?: string;
}

export default function Topbar({ title, roleBadge }: TopbarProps) {
  const { data: session } = useSession();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const userName = session?.user?.name || 'Authorized User';
  const userRole = (session?.user as any)?.role || 'student';
  const classOrSub = (session?.user as any)?.classOrSubject || 'CSE Department';

  const roleVariants: Record<string, 'cyan' | 'indigo' | 'amber'> = {
    student: 'cyan',
    faculty: 'indigo',
    admin: 'amber',
  };

  return (
    <header className="h-16 bg-[#080D1A]/80 border-b border-white/10 px-6 flex items-center justify-between backdrop-blur-xl sticky top-0 z-10">
      {/* Title & context */}
      <div className="flex items-center gap-3">
        {title && <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">{title}</h1>}
        <Badge variant={roleVariants[userRole] || 'cyan'} size="sm" dot>
          {roleBadge || userRole.toUpperCase()}
        </Badge>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time || 'LIVE'}</span>
        </div>

        {/* SIH Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>SIH 2026 Engine</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <Avatar name={userName} role={userRole} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{classOrSub}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
