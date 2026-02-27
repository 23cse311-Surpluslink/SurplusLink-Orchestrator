import mongoose from 'mongoose';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { t } from './i18n.js';

export const createNotification = async (recipientId, message, type, relatedDonationId = null, params = {}) => {
    try {
        if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
            return null;
        }

        // Fetch user to get language preference
        const user = await User.findById(recipientId).select('language');
        const lang = user?.language || 'en';

        // If 'message' is a translation key, translate it. Otherwise use it as is.
        // We can detect if it's a key by checking if it exists in translations or has no spaces.
        const translatedMessage = t(lang, message, params);

        // For now, we log it as requested
        console.log(`[Notification] To: ${recipientId} (${lang}), Msg: ${translatedMessage}, Type: ${type}`);

        // Also save to database
        const notification = await Notification.create({
            recipient: recipientId,
            message: translatedMessage,
            type,
            relatedDonation: relatedDonationId,
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
