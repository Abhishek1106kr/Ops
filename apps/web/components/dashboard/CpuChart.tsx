"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricPoint } from '@sentinel-ai/types';
import { formatDate } from '@sentinel-ai/utils';

interface CpuChartProps {
  data: MetricPoint[];
}

export default function CpuChart({ data }: CpuChartProps) {
  // Formats timestamps for display
  const chartData = data.map(d => ({
    ...d,
    time: formatDate(d.timestamp)
  }));

  return (
    <div className="glass-card p-6 rounded-2xl h-[330px] w-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-slate-100 text-base">Resource Metrics</h3>
          <p className="text-xs text-slate-400">Live CPU and Memory cluster performance statistics</p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brandPurple block"></span>
            <span className="text-slate-300 font-medium">CPU (%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brandCyan block"></span>
            <span className="text-slate-300 font-medium">Memory (%)</span>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#111827', borderColor: '#374151', borderRadius: '8px' }}
              labelClassName="text-slate-400 text-xs font-semibold"
              itemStyle={{ fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="cpu" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
            <Area type="monotone" dataKey="memory" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
