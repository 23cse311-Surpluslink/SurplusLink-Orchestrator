import mongoose from 'mongoose';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import { t } from './i18n.js';

export const createNotification = async (recipientId, message, type, relatedDonationId = null, params = {}) => {
    try {
        if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
            return null;
        }

        // Fetch user to get language and notification preferences
        const user = await User.findById(recipientId).select('language notificationPreferences role');
        if (!user) return null;

        const lang = user.language || 'en';
        const prefs = user.notificationPreferences || { enabled: true, channels: { push: true, email: true }, types: { donations: true, missions: true, reminders: true } };

        // 1. Master Toggle Check
        if (prefs.enabled === false) {
            console.log(`[Notification] Blocked: Master toggle off for user ${recipientId}`);
            return null;
        }

        // 2. Type Check
        const typeMapping = {
            'donation_created': user.role === 'ngo' ? 'missions' : 'donations',
            'donation_cancelled': 'donations',
            'donation_completed': 'donations',
            'donation_assigned': 'donations',
            'donation_rejected': 'donations',
            'donation_picked_up': 'donations',
            'donation_delivered': 'donations',
            'donation_expired': 'reminders',
            'volunteer_accepted': 'missions',
            'priority_dispatch': 'missions',
            'mission_reassigned': 'missions',
            'mission_delayed': 'reminders',
            'mission_nudge': 'reminders',
            'level_up': 'missions',
            'general': 'donations'
        };

        const prefCategory = typeMapping[type] || 'donations';
        if (prefs.types && prefs.types[prefCategory] === false) {
            console.log(`[Notification] Blocked: Preferences for ${prefCategory} disabled for user ${recipientId}`);
            return null;
        }

        // 3. Channel Check (Push/DB)
        if (prefs.channels && prefs.channels.push === false) {
            console.log(`[Notification] Push/DB disabled for user ${recipientId}`);
            // We still return null because this utility handles the DB creation which represents the "Push" channel in our simplified architecture
            return null;
        }

        // If 'message' is a translation key, translate it. Otherwise use it as is.
        const translatedMessage = t(lang, message, params);

        console.log(`[Notification] To: ${recipientId} (${lang}), Msg: ${translatedMessage}, Type: ${type}`);

        // Save to database (Treating this as the "Push" channel)
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
