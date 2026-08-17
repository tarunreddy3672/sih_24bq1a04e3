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

  const roleGradients: Record<string, string> = {
    student: 'from-cyan-500 to-blue-600 border-cyan-400/40',
    faculty: 'from-indigo-500 to-purple-600 border-indigo-400/40',
    admin: 'from-amber-500 to-orange-600 border-amber-400/40',
  };

  const gradient = roleGradients[role || 'student'] || 'from-slate-700 to-slate-800 border-slate-600';

  return (
    <div
      className={`rounded-full bg-gradient-to-tr ${gradient} border flex items-center justify-center font-bold text-white shadow-md ${sizeClasses[size]}`}
    >
      {initials}
    </div>
  );
}
