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
    donorId?: string;
    donor?: { _id?: string; id?: string; name?: string; organization?: string };
    photos?: string[];
    image?: string;
    title?: string;
    foodType?: string;
    quantity?: string;
    createdAt?: string;
    status: Donation['status'];
    foodCategory?: Donation['foodCategory'];
    storageReq?: Donation['storageReq'];
    claimedBy?: { _id?: string; id?: string; name?: string; organization?: string; address?: string };
    volunteer?: { _id?: string; id?: string; name?: string };
    pickupPhoto?: string;
    deliveryPhoto?: string;
    pickupNotes?: string;
    deliveryNotes?: string;
    coordinates?: {
        type?: 'Point';
        coordinates?: [number, number];
    };
}

const mapDonation = (d: BackendDonation): Donation => ({
    title: d.title || "",
    foodType: d.foodType || "",
    quantity: d.quantity || "",
    createdAt: d.createdAt || new Date().toISOString(),
    id: d._id || d.id || "",
    donorId: d.donorId || d.donor?._id || d.donor?.id || "",
    expiryTime: d.expiryDate || d.expiryTime || "",
    pickupWindow: typeof d.pickupWindow === 'object'
        ? `${new Date(d.pickupWindow.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(d.pickupWindow.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : d.pickupWindow || "",
    location: d.location?.address || d.pickupAddress || "Unknown Location",
    address: d.location?.address || d.pickupAddress || "",
    donorName: d.donor?.name || d.donor?.organization || d.donorName || "Unknown Donor",
    ngoName: d.claimedBy?.organization || d.claimedBy?.name || "",
    ngoAddress: d.claimedBy?.address || "",
    image: d.photos?.[0] || d.image || "",
    photos: d.photos || [],
    pickupPhoto: d.pickupPhoto,
    deliveryPhoto: d.deliveryPhoto,
    pickupNotes: d.pickupNotes,
    deliveryNotes: d.deliveryNotes,
    status: d.status,
    foodCategory: d.foodCategory,
    storageReq: d.storageReq,
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
    },

    // Epic 4: Volunteer Methods
    getAvailableMissions: async (): Promise<Donation[]> => {
        const response = await api.get('/donations/available-missions');
        return Array.isArray(response.data) ? response.data.map(mapDonation) : [];
    },

    acceptMission: async (id: string) => {
        const response = await api.patch(`/donations/${id}/accept-mission`);
        return response.data;
    },

    updateDeliveryStatus: async (id: string, status: string) => {
        const response = await api.patch(`/donations/${id}/delivery-status`, { status });
        return response.data;
    },

    confirmPickup: async (id: string, formData: FormData) => {
        const response = await api.patch(`/donations/${id}/pickup`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    confirmDelivery: async (id: string, formData: FormData) => {
        const response = await api.patch(`/donations/${id}/deliver`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    getVolunteerHistory: async (): Promise<Donation[]> => {
        const response = await api.get('/donations/volunteer/history');
        return Array.isArray(response.data) ? response.data.map(mapDonation) : [];
    }
};
;

export default DonationService;
