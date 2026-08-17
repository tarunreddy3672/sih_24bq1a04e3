import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  glow = false,
  hoverEffect = false,
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 ${
        glow
          ? 'study-card-highlight'
          : 'study-card'
      } ${
        hoverEffect ? 'study-card-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
