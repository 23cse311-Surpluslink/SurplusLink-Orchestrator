import api from '@/lib/api';

const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

const markAsRead = async () => {
    const response = await api.patch('/notifications/read');
    return response.data;
};

export default {
    getNotifications,
    markAsRead
};
