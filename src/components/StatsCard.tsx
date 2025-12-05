import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
};

export function StatsCard({ title, value, unit, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <div className="industrial-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className={cn('text-2xl font-mono font-bold', variantStyles[variant])}>
            {typeof value === 'number' ? value.toFixed(1) : value}
            {unit && <span className="text-sm text-muted-foreground ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={cn(
              'text-xs mt-1',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            </p>
          )}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          variant === 'primary' ? 'bg-primary/20' : 
          variant === 'success' ? 'bg-success/20' :
          variant === 'warning' ? 'bg-warning/20' : 'bg-muted'
        )}>
          <Icon className={cn('w-5 h-5', variantStyles[variant])} />
        </div>
      </div>
    </div>
  );
}
