import { User } from '@/types';

export const users: User[] = [
  {
    id: 'donor-1',
    name: 'Fresh Bites Restaurant',
    email: 'contact@freshbites.com',
    role: 'donor',
    status: 'active',
    organization: 'Fresh Bites Inc.',
    createdAt: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FB'
  },
  {
    id: 'donor-2',
    name: 'Golden Catering',
    email: 'info@goldencatering.com',
    role: 'donor',
    status: 'active',
    organization: 'Golden Events LLC',
    createdAt: '2024-02-20',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=GC'
  },
  {
    id: 'donor-3',
    name: 'The Grand Hotel',
    email: 'kitchen@grandhotel.com',
    role: 'donor',
    status: 'pending',
    organization: 'Grand Hospitality',
    createdAt: '2024-03-10',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TG'
  },
  {
    id: 'ngo-1',
    name: 'Food For All',
    email: 'help@foodforall.org',
    role: 'ngo',
    status: 'active',
    organization: 'Food For All Foundation',
    createdAt: '2024-01-05',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FFA'
  },
  {
    id: 'ngo-2',
    name: 'Community Kitchen',
    email: 'info@communitykitchen.org',
    role: 'ngo',
    status: 'active',
    organization: 'Community Kitchen Network',
    createdAt: '2024-01-22',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CK'
  },
  {
    id: 'ngo-3',
    name: 'Hunger Relief',
    email: 'support@hungerrelief.org',
    role: 'ngo',
    status: 'pending',
    organization: 'Hunger Relief International',
    createdAt: '2024-03-15',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HR'
  },
  {
    id: 'admin-1',
    name: 'Sarah Admin',
    email: 'sarah@surpluslink.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SA'
  }
];

export const getDemoUser = (role: string): User | undefined => {
  return users.find(u => u.role === role && u.status === 'active');
};
