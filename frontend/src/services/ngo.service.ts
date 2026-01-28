import api from '@/lib/api';

export interface NgoProfile {
    dailyCapacity: number;
    storageFacilities: string[]; // 'cold' | 'dry' | 'frozen'
    isUrgentNeed: boolean;
}

const NgoService = {
    updateNgoProfile: async (profile: NgoProfile) => {
        const response = await api.put('/users/profile/ngo', profile);
        return response.data;
    }
};

export default NgoService;
