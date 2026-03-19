'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';
import { GenreStats, AudioProfile } from '@/types';

interface GenrePieProps {
  data: GenreStats[];
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: GenreStats }> }) => {
  if (!active || !payload?.length) return null;
  const { genre, count, percentage, color } = payload[0].payload;
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-medium mb-1" style={{ color }}>{genre}</p>
      <p className="text-slate-400">{count} artists · {percentage}%</p>
    </div>
  );
};

export function GenrePieChart({ data }: GenrePieProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          dataKey="percentage"
          nameKey="genre"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface AudioRadarProps {
  profile: AudioProfile;
}

export function AudioRadarChart({ profile }: AudioRadarProps) {
  const data = [
    { subject: 'Dance', value: profile.danceability * 100 },
    { subject: 'Energy', value: profile.energy * 100 },
    { subject: 'Mood', value: profile.valence * 100 },
    { subject: 'Acoustic', value: profile.acousticness * 100 },
    { subject: 'Instrumental', value: profile.instrumentalness * 100 },
    { subject: 'Speech', value: profile.speechiness * 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
        <Radar
          dataKey="value"
          stroke="#1db954"
          fill="#1db954"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
