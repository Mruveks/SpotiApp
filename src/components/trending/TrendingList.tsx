'use client';

import { TrendingItem } from '@/types';
import { Card, CardHeader } from '@/components/ui/Card';
import { TrendingUp, Flame, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface TrendingListProps {
  items: TrendingItem[];
  title?: string;
  showRegion?: boolean;
  className?: string;
}

export function TrendingList({ items, title = 'Trending Now', className }: TrendingListProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader
        title={title}
        icon={<TrendingUp className="w-4 h-4" />}
        action={
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        }
      />
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/5 group',
              index === 0 && 'bg-green-500/5 border border-green-500/10'
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-6 text-center">
              {index < 3 ? (
                <Flame className={cn(
                  'w-4 h-4 mx-auto',
                  index === 0 ? 'text-yellow-400' : index === 1 ? 'text-orange-400' : 'text-red-400'
                )} />
              ) : (
                <span className="text-xs font-mono text-slate-600">{item.rank}</span>
              )}
            </div>

            {/* Art */}
            <img
              src={item.imageUrl}
              alt=""
              className="w-9 h-9 rounded object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/40/40`;
              }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate group-hover:text-green-400 transition-colors">
                {item.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{item.artist}</p>
            </div>

            {/* Change */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <ArrowUp className="w-3 h-3 text-green-400" />
              <Badge variant="green" size="sm">+{item.change}%</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
