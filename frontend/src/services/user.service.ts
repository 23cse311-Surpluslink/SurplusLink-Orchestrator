import api from '@/lib/api';

export const updateVolunteerStatus = async (isOnline: boolean) => {
    const response = await api.patch('/users/volunteer/status', { isOnline });
    return response.data;
};

export const updateVolunteerProfile = async (profileData: { vehicleType?: string; maxWeight?: number }) => {
    const response = await api.patch('/users/volunteer/profile', profileData);
    return response.data;
};

export const updateVolunteerLocation = async (lat: number, lng: number) => {
    const response = await api.patch('/users/volunteer/location', { lat, lng });
    return response.data;
};

export const getVolunteerStats = async () => {
    const response = await api.get('/users/volunteer/stats');
    return response.data;
};

export const getNgoVolunteers = async () => {
    const response = await api.get('/users/ngo/volunteers');
    return response.data;
};
