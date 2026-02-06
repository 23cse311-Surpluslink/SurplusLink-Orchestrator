import { ReactNode, ElementType } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode | ElementType;
  description?: string;
  subtext?: string; // For compatibility
  trend?: number | {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  subtext,
  trend,
  className
}: StatCardProps) {
  const displayDescription = description || subtext;

  const trendValue = typeof trend === 'number' ? Math.abs(trend) : trend?.value;
  const isPositive = typeof trend === 'number' ? trend > 0 : trend?.isPositive;

  const renderIcon = () => {
    if (!Icon) return null;
    if (typeof Icon === 'function' || (typeof Icon === 'object' && 'render' in Icon)) {
      const IconComponent = Icon as ElementType;
      return <IconComponent className="h-5 w-5" />;
    }
    return Icon as ReactNode;
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl bg-card p-6 shadow-md border border-border transition-all duration-300 hover:shadow-lg",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className={cn(
                "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold",
                isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              )}>
                {isPositive ? '↑' : '↓'} {trendValue}%
              </div>
            )}
          </div>
          {displayDescription && (
            <p className="text-xs text-muted-foreground">{displayDescription}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
            {renderIcon()}
          </div>
        )}
      </div>

      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
    </div>
  );
}
