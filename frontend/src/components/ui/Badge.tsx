import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'indigo' | 'emerald' | 'amber' | 'slate' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'indigo',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantStyles = {
    indigo:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    slate:
      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    purple:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    outline:
      'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-0.5 text-xs font-medium',
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
