export type UserRole = 'donor' | 'ngo' | 'admin' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'pending' | 'deactivated' | 'rejected';
  organization?: string;
  createdAt: string;
  avatar?: string;
  taxId?: string;
  permitNumber?: string;
  documentUrl?: string;
  address?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  pickupWindow: string;
  location: string;
  address: string;
  status: 'pending' | 'assigned' | 'picked' | 'delivered' | 'expired' | 'cancelled';
  assignedNgo?: string;
  assignedVolunteer?: string;
  createdAt: string;
  image?: string;
  coordinates?: { lat: number; lng: number };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'pickup' | 'delivery' | 'hygiene' | 'system' | 'match';
  read: boolean;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'on_route' | 'busy';
  currentLocation?: { lat: number; lng: number };
  assignedDonation?: string;
}

export interface Feedback {
  id: string;
  donationId: string;
  ngoId: string;
  rating: number;
  hygieneCompliance: boolean;
  comments: string;
  createdAt: string;
}

export interface Metrics {
  mealsSaved: number;
  co2Reduced: number;
  activeDonors: number;
  activeNgos: number;
  avgDeliveryTime: number;
  foodRescueRate: number;
  monthlyData: {
    month: string;
    donations: number;
    meals: number;
    co2: number;
  }[];
}
