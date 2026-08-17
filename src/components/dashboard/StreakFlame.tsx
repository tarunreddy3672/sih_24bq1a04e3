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
    md: { box: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-2xl' },
    lg: { box: 'w-20 h-20', icon: 'w-10 h-10', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${currentSize.box} rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs`}>
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-amber-500"
        >
          <Flame className={`${currentSize.icon} fill-amber-400 text-amber-500`} />
        </motion.div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={`${currentSize.text} font-black text-amber-600 font-mono`}>
            {streak}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Day Streak
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          {streak >= 14 ? '🌟 Consistency Legend' : streak >= 7 ? '🔥 Active Habit' : '🌱 Building Consistency'}
        </p>
      </div>
    </div>
  );
}
