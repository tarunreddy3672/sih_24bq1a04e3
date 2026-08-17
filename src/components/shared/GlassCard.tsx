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
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
        glow ? 'glass-panel-glow' : 'glass-panel'
      } ${
        hoverEffect ? 'hover:border-cyan-500/30 hover:shadow-cyan-500/10 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
