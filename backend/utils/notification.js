import Notification from '../models/Notification.model.js';

export const createNotification = async (recipientId, message, type, relatedDonationId = null) => {
    try {
        // For now, we log it as requested
        console.log(`[Notification] To: ${recipientId}, Msg: ${message}, Type: ${type}`);

        // Also save to database
        const notification = await Notification.create({
            recipient: recipientId,
            message,
            type,
            relatedDonation: relatedDonationId,
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
