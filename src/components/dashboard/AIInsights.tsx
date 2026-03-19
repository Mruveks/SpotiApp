'use client';

import { AIInsight } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, TrendingUp, Lightbulb, Search, Music } from 'lucide-react';

const typeConfig: Record<AIInsight['type'], { color: 'green' | 'cyan' | 'purple' | 'pink' | 'yellow'; Icon: React.ElementType; badge: string }> = {
  trend: { color: 'green', Icon: TrendingUp, badge: 'Trend' },
  discovery: { color: 'cyan', Icon: Search, badge: 'Discovery' },
  pattern: { color: 'purple', Icon: Music, badge: 'Pattern' },
  recommendation: { color: 'pink', Icon: Lightbulb, badge: 'Insight' },
};

interface InsightCardProps {
  insight: AIInsight;
}

function InsightItem({ insight }: InsightCardProps) {
  const { color, Icon, badge } = typeConfig[insight.type];

  return (
    <div className={`p-3 rounded-lg bg-${color}-500/5 border border-${color}-500/15 space-y-2 transition-all duration-200 hover:border-${color}-500/30`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{insight.icon}</span>
          <span className={`text-xs font-semibold text-${color}-400`}>{insight.title}</span>
        </div>
        <Badge variant={color} size="sm">{badge}</Badge>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {insight.tags.map((tag) => (
            <span key={tag} className="text-xs text-slate-600 bg-white/5 rounded px-1.5 py-0.5">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <div className="h-1 w-12 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-current"
              style={{ width: `${insight.confidence * 100}%`, color: `var(--accent-${color === 'green' ? 'green' : color === 'cyan' ? 'cyan' : 'purple'})` }}
            />
          </div>
          <span className="text-xs text-slate-600">{Math.round(insight.confidence * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

interface AIInsightsProps {
  insights?: AIInsight[];
}

export function AIInsights({ insights = [] }: AIInsightsProps) {
  return (
    <Card className="h-full">
      <CardHeader
        title="AI Music Insights"
        icon={<Sparkles className="w-4 h-4" />}
        subtitle="Powered by pattern analysis"
        action={
          <span className="text-xs text-green-400 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            analyzing
          </span>
        }
      />
      <div className="space-y-3">
        {insights.map((insight) => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>
    </Card>
  );
}
