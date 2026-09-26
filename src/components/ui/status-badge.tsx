import React from 'react';
import { OperationStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OperationStatus | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const norm = status?.toLowerCase() || 'draft';

  const configs: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    draft: {
      label: 'DRAFT',
      bg: 'bg-slate-800/80',
      text: 'text-slate-300',
      border: 'border-slate-700',
      dot: 'bg-slate-400'
    },
    waiting: {
      label: 'WAITING',
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      border: 'border-amber-600/40',
      dot: 'bg-amber-400 animate-pulse'
    },
    ready: {
      label: 'READY',
      bg: 'bg-sky-950/60',
      text: 'text-sky-300',
      border: 'border-sky-500/40',
      dot: 'bg-sky-400'
    },
    done: {
      label: 'DONE',
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      dot: 'bg-emerald-400'
    },
    canceled: {
      label: 'CANCELED',
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      dot: 'bg-rose-400'
    }
  };

  const current = configs[norm] || configs.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono font-medium tracking-wider uppercase rounded-full border transition-colors",
        current.bg,
        current.text,
        current.border,
        size === 'sm' && "px-2 py-0.5 text-[10px]",
        size === 'md' && "px-2.5 py-1 text-xs",
        size === 'lg' && "px-3.5 py-1.5 text-sm",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dot)} />
      {current.label}
    </span>
  );
}
