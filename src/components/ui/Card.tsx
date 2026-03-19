'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'green' | 'cyan' | 'purple' | 'none';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glow = 'none', hover = false, onClick }: CardProps) {
  const glowClass = {
    green: 'border-green-500/20 shadow-[0_0_20px_rgba(29,185,84,0.1)]',
    cyan: 'border-cyan-400/20 shadow-[0_0_20px_rgba(0,212,255,0.1)]',
    purple: 'border-purple-500/20 shadow-[0_0_20px_rgba(124,58,237,0.1)]',
    none: 'border-white/5',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl border bg-[#0d1117]/80 backdrop-blur-xl p-4 transition-all duration-300',
        glowClass,
        hover && 'hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(29,185,84,0.15)] hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-green-400">{icon}</span>}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
