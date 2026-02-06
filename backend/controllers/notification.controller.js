import Notification from '../models/Notification.model.js';

/**
 * @desc    Fetch recent push notifications for the authenticated user
 * @route   GET /api/v1/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Mark all unread notifications as read
 * @route   PATCH /api/v1/notifications/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
