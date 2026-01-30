import mongoose from 'mongoose';
import Notification from '../models/Notification.model.js';

export const createNotification = async (recipientId, message, type, relatedDonationId = null) => {
    try {
        if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
            // console.warn(`[Notification Skip] Invalid recipient: ${recipientId}`);
            return null;
        }

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
