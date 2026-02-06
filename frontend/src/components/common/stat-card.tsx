import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card p-6 shadow-md border border-border transition-all duration-300 hover:shadow-lg",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3 text-primary">
          {icon}
        </div>
      </div>
      
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
