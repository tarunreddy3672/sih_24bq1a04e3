'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Avatar from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';
import { Clock, GraduationCap } from 'lucide-react';

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
  const classOrSub = (session?.user as any)?.classOrSubject || 'Department of Computer Science';

  const roleVariants: Record<string, 'indigo' | 'emerald' | 'amber'> = {
    student: 'indigo',
    faculty: 'emerald',
    admin: 'amber',
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
      {/* Title & context */}
      <div className="flex items-center gap-3">
        {title && <h1 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{title}</h1>}
        <Badge variant={roleVariants[userRole] || 'indigo'} size="sm" dot>
          {roleBadge || userRole.toUpperCase()}
        </Badge>
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{time || 'LIVE'}</span>
        </div>

        {/* Academic Tag */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700 font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          <span>SIH 2026 Academic Edition</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <Avatar name={userName} role={userRole} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{userName}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{classOrSub}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
