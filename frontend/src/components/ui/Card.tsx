import { cn } from '../../lib/utils';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'outline';
  padding?: 'sm' | 'md' | 'lg';
}

export const Card = ({ className, variant = 'glass', padding = 'md', children, ...props }: CardProps) => {
  const variants = {
    glass: 'glass-card',
    solid: 'bg-white rounded-2xl shadow-md',
    outline: 'bg-white/50 rounded-2xl border border-slate-200',
  };
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div className={cn(variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4', className)} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-navy-700', className)} {...props}>{children}</h3>
);

export const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props}>{children}</div>
);
