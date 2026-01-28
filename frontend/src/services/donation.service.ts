import api from '@/lib/api';

export interface Donation {
    _id: string;
    title: string;
    description?: string;
    foodType: string;
    quantity: string;
    expiryDate: string;
    pickupWindow: {
        start: string;
        end: string;
    };
    photos: string[];
    location: {
        type: string;
        coordinates: [number, number];
        address: string;
    };
    allergens: string[];
    dietaryTags: string[];
    status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
    donorId: string;
    createdAt: string;
}

export interface DonationStats {
    totalDonations: number;
    completedDonations: number;
    acceptanceRate: number;
}

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
        return response.data;
    },

    getStats: async (): Promise<DonationStats> => {
        const response = await api.get('/donations/stats');
        return response.data;
    },

    cancelDonation: async (id: string) => {
        const response = await api.patch(`/donations/${id}/cancel`);
        return response.data;
    },
};

export default DonationService;
