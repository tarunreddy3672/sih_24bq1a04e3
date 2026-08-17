import React from 'react';

interface AvatarProps {
  name: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Avatar({ name, role, size = 'md' }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const roleStyles: Record<string, string> = {
    student: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    faculty: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    admin: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const style = roleStyles[role || 'student'] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      className={`rounded-full ${style} border flex items-center justify-center font-bold shadow-sm ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  );
}
