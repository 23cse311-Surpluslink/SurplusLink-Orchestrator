import { PageHeader } from '@/components/common/page-header';
import { NotificationItem } from '@/components/common/notification-item';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/notification-context';
import { CheckCheck, Loader2 } from 'lucide-react';

export default function DonorNotifications() {
  const { notifications, unreadCount, markAllRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
      >
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </PageHeader>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            <div className="bg-background param p-3 rounded-full mb-3">
              <CheckCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p>You're all caught up!</p>
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          notifications.map((notification: any) => (
            <NotificationItem
              key={notification._id || notification.id}
              notification={notification}
            // onClick={() => {}} // Navigation logic can be added here
            />
          ))
        )}
      </div>
    </div>
  );
}
