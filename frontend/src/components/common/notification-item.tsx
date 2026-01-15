import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { Bell, Truck, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { getRelativeTime } from '@/utils/formatters';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

const iconByType = {
  pickup: Bell,
  delivery: Truck,
  hygiene: ShieldCheck,
  system: Info,
  match: CheckCircle2,
};

const colorByType = {
  pickup: 'text-primary bg-primary/10',
  delivery: 'text-info bg-info/10',
  hygiene: 'text-success bg-success/10',
  system: 'text-warning bg-warning/10',
  match: 'text-accent bg-accent/10',
};

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = iconByType[notification.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer",
        notification.read
          ? "bg-background border-border"
          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      <div className={cn("rounded-lg p-2", colorByType[notification.type])}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-sm truncate",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {getRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {!notification.read && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
      )}
    </div>
  );
}
