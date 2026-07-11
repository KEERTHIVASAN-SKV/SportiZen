import React from 'react';
import { ShieldCheck } from 'lucide-react';

type BadgeVariant =
  | 'player'
  | 'coach'
  | 'organization'
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'sport'
  | 'success'
  | 'warning'
  | 'danger';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
  showIcon?: boolean;
}

const styles: Record<BadgeVariant, string> = {
  player:
    'bg-blue-500 text-white',
  coach:
    'bg-emerald-500 text-white',
  organization:
    'bg-orange-500 text-white',
  verified:
    'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
  pending:
    'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  rejected:
    'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
  sport:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
  success:
    'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800',
  warning:
    'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
  danger:
    'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800',
};

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '', showIcon = false }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {showIcon && variant === 'verified' && <ShieldCheck className="w-3 h-3" />}
      {children}
    </span>
  );
};

export default Badge;
