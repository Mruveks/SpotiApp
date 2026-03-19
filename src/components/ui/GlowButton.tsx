'use client';

import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'cyan' | 'purple' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function GlowButton({
  children,
  variant = 'green',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  const variantStyles = {
    green: 'bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20 hover:border-green-400 hover:shadow-[0_0_20px_rgba(29,185,84,0.3)]',
    cyan: 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    purple: 'bg-purple-500/10 border-purple-500/40 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]',
    ghost: 'bg-transparent border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-200',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border font-medium transition-all duration-200 cursor-pointer',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
