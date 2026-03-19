import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'cyan' | 'purple' | 'pink' | 'yellow' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  cyan: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  gray: 'bg-slate-700/50 text-slate-400 border-slate-600/30',
};

export function Badge({ children, variant = 'gray', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
