import { Notification } from '@/types';

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'donor-1',
    title: 'Pickup Confirmed',
    message: 'Food For All has accepted your donation of 25 portions of Prepared Meals.',
    type: 'pickup',
    read: false,
    createdAt: '2024-12-28T12:30:00'
  },
  {
    id: 'notif-2',
    userId: 'donor-1',
    title: 'Delivery Completed',
    message: 'Your donation of Fresh Produce has been successfully delivered to Community Kitchen.',
    type: 'delivery',
    read: false,
    createdAt: '2024-12-28T10:15:00'
  },
  {
    id: 'notif-3',
    userId: 'donor-1',
    title: 'Hygiene Report Available',
    message: 'A new hygiene compliance report is available for your recent donation.',
    type: 'hygiene',
    read: true,
    createdAt: '2024-12-27T16:00:00'
  },
  {
    id: 'notif-4',
    userId: 'ngo-1',
    title: 'New Donation Available',
    message: 'Fresh Bites Restaurant has posted a new donation: 25 portions of Prepared Meals.',
    type: 'match',
    read: false,
    createdAt: '2024-12-28T10:05:00'
  },
  {
    id: 'notif-5',
    userId: 'ngo-1',
    title: 'Volunteer Assigned',
    message: 'John D. has been assigned to pick up your accepted donation.',
    type: 'pickup',
    read: false,
    createdAt: '2024-12-28T11:30:00'
  },
  {
    id: 'notif-6',
    userId: 'ngo-1',
    title: 'Delivery En Route',
    message: 'Your donation from Golden Catering is currently on its way. ETA: 30 minutes.',
    type: 'delivery',
    read: true,
    createdAt: '2024-12-28T14:45:00'
  },
  {
    id: 'notif-7',
    userId: 'admin-1',
    title: 'New User Registration',
    message: 'The Grand Hotel has registered as a new donor and awaits approval.',
    type: 'system',
    read: false,
    createdAt: '2024-12-28T09:00:00'
  },
  {
    id: 'notif-8',
    userId: 'admin-1',
    title: 'Late Pickup Alert',
    message: 'Donation #don-5 was not picked up before expiry time.',
    type: 'system',
    read: false,
    createdAt: '2024-12-27T18:30:00'
  }
];

export const getNotificationsByUser = (userId: string): Notification[] => {
  return notifications.filter(n => n.userId === userId);
};

export const getUnreadCount = (userId: string): number => {
  return notifications.filter(n => n.userId === userId && !n.read).length;
};
