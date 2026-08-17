'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakFlameProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakFlame({ streak, size = 'md' }: StreakFlameProps) {
  const sizeMap = {
    sm: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-lg' },
    md: { box: 'w-16 h-16', icon: 'w-8 h-8', text: 'text-2xl' },
    lg: { box: 'w-24 h-24', icon: 'w-12 h-12', text: 'text-4xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${currentSize.box} flex items-center justify-center`}>
        {/* Pulsing flame aura */}
        <motion.div
          animate={{
            scale: [1, 1.18, 1],
            opacity: [0.35, 0.7, 0.35],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-t from-orange-600 to-amber-400 blur-md"
        />

        {/* Outer Flame Glow */}
        <motion.div
          animate={{
            y: [-1, -3, 0],
            rotate: [-2, 2, -1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="relative z-10 p-2.5 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-white shadow-lg shadow-orange-500/40"
        >
          <Flame className={`${currentSize.icon} fill-yellow-200 text-orange-600`} />
        </motion.div>
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className={`${currentSize.text} font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 font-mono`}>
            {streak}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
            Day Streak
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          {streak >= 14 ? '🔥 Consistency Legend' : streak >= 7 ? '⚡ On Fire!' : '🌱 Building Momentum'}
        </p>
      </div>
    </div>
  );
}
