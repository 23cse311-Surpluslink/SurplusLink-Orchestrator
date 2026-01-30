export type UserRole = 'donor' | 'ngo' | 'admin' | 'volunteer';

export interface VolunteerProfile {
  tier: 'rookie' | 'hero' | 'champion';
  vehicleType?: 'bicycle' | 'scooter' | 'car' | 'van';
  maxWeight?: number;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface UserStats {
  completedDonations: number;
  cancelledDonations: number;
  mealsSaved?: number;
  co2Saved?: number;
}

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
  coordinates?: { lat: number; lng: number };
  isOnline?: boolean;
  volunteerProfile?: VolunteerProfile;
  stats?: UserStats;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  pickupWindow: string;
  location: string;
  address: string;
  status: 'active' | 'assigned' | 'accepted' | 'at_pickup' | 'picked_up' | 'at_delivery' | 'delivered' | 'completed' | 'cancelled' | 'expired' | 'rejected';
  assignedNgo?: string;
  assignedVolunteer?: string;
  createdAt: string;
  ngoName?: string;
  ngoAddress?: string;
  image?: string;
  photos?: string[];
  pickupPhoto?: string;
  deliveryPhoto?: string;
  pickupNotes?: string;
  deliveryNotes?: string;
  expiryDate?: string;
  pickupAddress?: string;
  coordinates?: { lat: number; lng: number };
  foodCategory?: 'cooked' | 'raw' | 'packaged';
  storageReq?: 'cold' | 'dry' | 'frozen';
  rejectionReason?: string;
  claimedBy?: {
    id: string;
    organization: string;
    name?: string;
  };
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

export interface DonationStats {
  totalDonations: number;
  completedDonations: number;
  acceptanceRate: number;
}
