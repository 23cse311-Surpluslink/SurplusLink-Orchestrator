import { Metrics, Volunteer } from '@/types';

export const metrics: Metrics = {
  mealsSaved: 12450,
  co2Reduced: 4.2, // in tons
  activeDonors: 47,
  activeNgos: 23,
  avgDeliveryTime: 42, // in minutes
  foodRescueRate: 87.5, // percentage
  monthlyData: [
    { month: 'Jul', donations: 145, meals: 1850, co2: 0.32 },
    { month: 'Aug', donations: 168, meals: 2100, co2: 0.38 },
    { month: 'Sep', donations: 192, meals: 2450, co2: 0.42 },
    { month: 'Oct', donations: 215, meals: 2800, co2: 0.48 },
    { month: 'Nov', donations: 248, meals: 3150, co2: 0.55 },
    { month: 'Dec', donations: 276, meals: 3500, co2: 0.62 }
  ]
};

export const donorMetrics = {
  totalDonations: 48,
  mealsSaved: 1250,
  co2Reduced: 0.42,
  monthlyBreakdown: [
    { month: 'Jul', meals: 150, co2: 0.05 },
    { month: 'Aug', meals: 180, co2: 0.06 },
    { month: 'Sep', meals: 200, co2: 0.07 },
    { month: 'Oct', meals: 220, co2: 0.08 },
    { month: 'Nov', meals: 250, co2: 0.08 },
    { month: 'Dec', meals: 250, co2: 0.08 }
  ]
};

export const ngoMetrics = {
  mealsReceived: 2850,
  avgDeliveryTime: 38,
  activePickups: 3,
  monthlyReceived: [
    { month: 'Jul', meals: 350, deliveries: 12 },
    { month: 'Aug', meals: 420, deliveries: 15 },
    { month: 'Sep', meals: 480, deliveries: 18 },
    { month: 'Oct', meals: 520, deliveries: 20 },
    { month: 'Nov', meals: 540, deliveries: 22 },
    { month: 'Dec', meals: 540, deliveries: 24 }
  ]
};

export const volunteers: Volunteer[] = [
  {
    id: 'vol-1',
    name: 'John D.',
    phone: '+1 555-0101',
    status: 'on_route',
    currentLocation: { lat: 40.7200, lng: -74.0100 },
    assignedDonation: 'don-2'
  },
  {
    id: 'vol-2',
    name: 'Maria S.',
    phone: '+1 555-0102',
    status: 'on_route',
    currentLocation: { lat: 40.7500, lng: -73.9900 },
    assignedDonation: 'don-3'
  },
  {
    id: 'vol-3',
    name: 'Alex R.',
    phone: '+1 555-0103',
    status: 'available',
    currentLocation: { lat: 40.7300, lng: -74.0000 }
  },
  {
    id: 'vol-4',
    name: 'Sam K.',
    phone: '+1 555-0104',
    status: 'available',
    currentLocation: { lat: 40.7600, lng: -73.9800 }
  }
];

export const liveRoutes = [
  {
    id: 'route-1',
    donationId: 'don-2',
    volunteer: 'John D.',
    from: 'Fresh Bites Restaurant',
    to: 'Food For All',
    status: 'en_route',
    eta: '15 min',
    progress: 65
  },
  {
    id: 'route-2',
    donationId: 'don-3',
    volunteer: 'Maria S.',
    from: 'Golden Catering',
    to: 'Community Kitchen',
    status: 'en_route',
    eta: '8 min',
    progress: 85
  },
  {
    id: 'route-3',
    donationId: 'don-4',
    volunteer: 'Alex R.',
    from: 'Golden Catering',
    to: 'Food For All',
    status: 'delivered',
    eta: '-',
    progress: 100
  }
];

export const adminStats = {
  donationsToday: 18,
  activeRoutes: 5,
  pendingApprovals: 3,
  disputes: 1,
  kpis: {
    foodRescueRate: 87.5,
    avgDeliveryTime: 42,
    ngoEngagement: 92.3,
    donorRetention: 78.5
  }
};
