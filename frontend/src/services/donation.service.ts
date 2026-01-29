/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '@/lib/api';
import { Donation, DonationStats } from '@/types';

interface BackendDonation {
    _id?: string;
    id?: string;
    expiryDate?: string;
    expiryTime?: string;
    pickupWindow?: string | { start: string; end: string };
    pickupAddress?: string;
    location?: { address: string };
    donorName?: string;
    status: Donation['status'];
    foodCategory?: Donation['foodCategory'];
    storageReq?: Donation['storageReq'];
}

const mapDonation = (d: any): Donation => ({
    ...d,
    id: d._id || d.id || "",
    expiryTime: d.expiryDate || d.expiryTime || "",
    pickupWindow: typeof d.pickupWindow === 'object'
        ? `${new Date(d.pickupWindow.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(d.pickupWindow.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : d.pickupWindow || "",
    location: d.location?.address || d.pickupAddress || "Unknown Location",
    address: d.location?.address || d.pickupAddress || "",
    // Fix: Handle populated donor object or direct name
    donorName: d.donor?.name || d.donor?.organization || d.donorName || "Unknown Donor",
    // Fix: Map photos array to image (first one) and keep photos
    image: d.photos?.[0] || d.image || "",
    photos: d.photos || [],
    status: d.status,
    foodCategory: d.foodCategory,
    storageReq: d.storageReq,
    // Fix: Map GeoJSON coordinates [lng, lat] to { lat, lng }
    coordinates: d.coordinates?.coordinates ? {
        lat: d.coordinates.coordinates[1],
        lng: d.coordinates.coordinates[0]
    } : undefined
});

const DonationService = {
    createDonation: async (formData: FormData) => {
        const response = await api.post('/donations', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyDonations: async (): Promise<Donation[]> => {
        const response = await api.get('/donations/my-donations');
        return Array.isArray(response.data) ? response.data.map(mapDonation) : [];
    },

    getStats: async (): Promise<DonationStats> => {
        const response = await api.get('/donations/stats');
        return response.data;
    },

    cancelDonation: async (id: string) => {
        const response = await api.patch(`/donations/${id}/cancel`);
        return response.data;
    },

    // Epic 3: NGO Methods
    getSmartFeed: async (): Promise<{ donations: Donation[], capacityWarning: boolean, count: number }> => {
        const response = await api.get('/donations/feed');
        return {
            ...response.data,
            donations: Array.isArray(response.data.donations) ? response.data.donations.map(mapDonation) : []
        };
    },

    getClaimedDonations: async (): Promise<Donation[]> => {
        const response = await api.get('/donations/claimed');
        return Array.isArray(response.data) ? response.data.map(mapDonation) : [];
    },

    claimDonation: async (id: string) => {
        const response = await api.patch(`/donations/${id}/claim`);
        return response.data;
    },

    rejectDonation: async (id: string, reason: string) => {
        const response = await api.patch(`/donations/${id}/reject`, { rejectionReason: reason });
        return response.data;
    },

    completeDonation: async (id: string, rating: number, comment: string) => {
        const response = await api.patch(`/donations/${id}/complete`, { rating, comment });
        return response.data;
    }
};

export default DonationService;
