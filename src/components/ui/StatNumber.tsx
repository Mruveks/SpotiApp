'use client';

import { cn } from '@/lib/utils';

interface StatNumberProps {
  value: string | number;
  label: string;
  change?: number;
  color?: 'green' | 'cyan' | 'purple' | 'pink';
  className?: string;
}

export function StatNumber({ value, label, change, color = 'green', className }: StatNumberProps) {
  const colorStyles = {
    green: 'text-green-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
    pink: 'text-pink-400',
  };

  return (
    <div className={cn('flex flex-col', className)}>
      <span className={cn('text-2xl font-bold font-mono tracking-tight', colorStyles[color])}>
        {value}
      </span>
      <span className="text-xs text-slate-500 mt-0.5">{label}</span>
      {change !== undefined && (
        <span className={cn('text-xs mt-1 font-medium', change >= 0 ? 'text-green-400' : 'text-red-400')}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  );
}
