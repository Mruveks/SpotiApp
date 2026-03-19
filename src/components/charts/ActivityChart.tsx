'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ListeningActivity } from '@/types';
import { format, parseISO } from 'date-fns';

interface ActivityChartProps {
  data: ListeningActivity[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1117] border border-green-500/20 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ActivityChart({ data }: ActivityChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="minutesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1db954" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="tracksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="minutes"
          name="Minutes"
          stroke="#1db954"
          strokeWidth={2}
          fill="url(#minutesGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#1db954' }}
        />
        <Area
          type="monotone"
          dataKey="tracks"
          name="Tracks"
          stroke="#00d4ff"
          strokeWidth={2}
          fill="url(#tracksGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#00d4ff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
