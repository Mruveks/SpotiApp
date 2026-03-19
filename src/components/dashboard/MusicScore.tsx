'use client';

import { MusicIntelligenceScore } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Brain, Star } from 'lucide-react';

interface ScoreRingProps {
  score: number;
  label: string;
  color?: string;
  size?: number;
}

function ScoreRing({ score, label, color = '#1db954', size = 80 }: ScoreRingProps) {
  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        {/* Background ring */}
        <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        {/* Score ring */}
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        {/* Score text */}
        <text x="40" y="40" textAnchor="middle" dy=".35em" fill={color} fontSize="16" fontWeight="bold" fontFamily="monospace">
          {score}
        </text>
      </svg>
      <span className="text-xs text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  score: number;
  description: string;
  color?: string;
}

function ProgressBar({ label, score, description, color = '#1db954' }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-300">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{score}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

interface MusicScoreCardProps {
  score?: MusicIntelligenceScore;
}

export function MusicScoreCard({ score }: MusicScoreCardProps) {
  if (!score) return null;
  return (
    <Card glow="purple" className="h-full">
      <CardHeader
        title="Music Intelligence Score"
        icon={<Brain className="w-4 h-4" />}
        action={<Badge variant="purple">BETA</Badge>}
      />

      {/* Main scores */}
      <div className="flex items-center justify-around py-4 border-b border-white/5 mb-4">
        <ScoreRing score={score.overall} label="Overall" color="#1db954" size={90} />
        <ScoreRing score={score.diversity} label="Diversity" color="#00d4ff" size={70} />
        <ScoreRing score={score.discovery} label="Discovery" color="#7c3aed" size={70} />
        <ScoreRing score={score.consistency} label="Consistency" color="#f472b6" size={70} />
      </div>

      {/* Personality */}
      <div className="mb-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-3 h-3 text-purple-400" />
          <span className="text-xs font-semibold text-purple-400">{score.personality}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{score.personalityDescription}</p>
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {score.breakdown.map((item, i) => {
          const colors = ['#1db954', '#00d4ff', '#7c3aed', '#f472b6', '#fbbf24'];
          return (
            <ProgressBar
              key={item.label}
              label={item.label}
              score={item.score}
              description={item.description}
              color={colors[i % colors.length]}
            />
          );
        })}
      </div>
    </Card>
  );
}
