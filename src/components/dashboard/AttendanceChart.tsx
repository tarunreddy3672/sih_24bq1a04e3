'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  data: { day: string; v: number }[];
}

export default function AttendanceChart({ data }: Props) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="attFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3E4C8A" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3E4C8A" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            stroke="#E4E7EC"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#E4E7EC' }}
          />
          <YAxis
            domain={[60, 100]}
            stroke="#E4E7EC"
            tick={{ fill: '#9CA3AF', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #E4E7EC',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#1A1D23',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
            formatter={(v: unknown) => [`${v}%`, 'Attendance']}
          />
          {/* 75% minimum line */}
          <ReferenceLine
            y={75}
            stroke="#F59E0B"
            strokeDasharray="4 3"
            strokeWidth={1}
            label={{ value: '75% min', position: 'insideTopRight', fill: '#F59E0B', fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="#3E4C8A"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#attFill)"
            dot={{ r: 3, fill: '#3E4C8A', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#3E4C8A' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
