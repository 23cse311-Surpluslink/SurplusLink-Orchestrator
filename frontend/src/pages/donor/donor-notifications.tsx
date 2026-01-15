import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { NotificationItem } from '@/components/common/notification-item';
import { Button } from '@/components/ui/button';
import { notifications as allNotifications } from '@/mockData/notifications';
import { useAuth } from '@/contexts/auth-context';
import { CheckCheck } from 'lucide-react';

export default function DonorNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(
    allNotifications.filter(n => n.userId === user?.id || n.userId === 'donor-1')
  );

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-2xl">
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
        {notifications.map(notification => (
          <NotificationItem 
            key={notification.id} 
            notification={notification}
            onClick={() => markAsRead(notification.id)}
          />
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}
