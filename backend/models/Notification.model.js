import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['donation_created', 'donation_cancelled', 'donation_completed', 'donation_assigned', 'donation_rejected', 'volunteer_accepted', 'donation_picked_up', 'donation_delivered', 'general'],
            required: true,
        },
        relatedDonation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
