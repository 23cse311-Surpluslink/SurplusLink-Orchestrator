import Donation from '../models/Donation.model.js';
import { createNotification } from '../utils/notification.js';

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donor)
export const createDonation = async (req, res) => {
    try {
        const {
            title,
            description,
            foodType,
            quantity,
            expiryDate,
            perishability,
            pickupWindow,
            pickupAddress,
            coordinates,
            allergens,
            dietaryTags,
        } = req.body;

        const expiry = new Date(expiryDate);
        const now = new Date();

        // Safety Rule: Validate that (expiryDate - Date.now()) > 2 hours
        const hoursToExpiry = (expiry - now) / (1000 * 60 * 60);
        if (hoursToExpiry < 2) {
            return res.status(400).json({
                message: 'Food items must be valid for at least 2 hours before expiry for safety.',
            });
        }

        // Scheduling Rule: Ensure pickupWindow.end < expiryDate
        const pickupEnd = new Date(pickupWindow.end);
        if (pickupEnd >= expiry) {
            return res.status(400).json({
                message: 'Pickup window must end before the food expires.',
            });
        }

        // Handle photos if uploaded via Multer
        const photos = req.files ? req.files.map((file) => file.path) : [];

        const donation = await Donation.create({
            title,
            description,
            foodType,
            quantity,
            expiryDate: expiry,
            perishability,
            photos,
            pickupWindow: {
                start: new Date(pickupWindow.start),
                end: pickupEnd,
            },
            pickupAddress,
            coordinates: {
                type: 'Point',
                coordinates: JSON.parse(coordinates), // Expecting "[lng, lat]" string or array
            },
            allergens: allergens ? (Array.isArray(allergens) ? allergens : JSON.parse(allergens)) : [],
            dietaryTags: dietaryTags ? (Array.isArray(dietaryTags) ? dietaryTags : JSON.parse(dietaryTags)) : [],
            donor: req.user._id,
        });

        // Notify NGOs (Placeholder log)
        await createNotification(
            'NGO_BROADCAST_GROUP', // Placeholder for all relevant NGOs
            `New donation available: ${title}`,
            'donation_created',
            donation._id
        );

        res.status(201).json(donation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get donor history
// @route   GET /api/donations/my-donations
// @access  Private (Donor)
export const getDonorHistory = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get donor stats
// @route   GET /api/donations/stats
// @access  Private (Donor)
export const getDonorStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments({ donor: req.user._id });
        const completedDonations = await Donation.countDocuments({
            donor: req.user._id,
            status: 'completed',
        });

        const acceptanceRate = totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

        // Additional metric: Total meals saved (assuming quantity can be used or just count completed)
        // For now, let's just use the count of completed donations as "Total Meals Saved" placeholder
        // or if we had a numeric quantity, we'd sum it.

        res.json({
            totalDonations,
            completedDonations,
            acceptanceRate: acceptanceRate.toFixed(2),
            totalMealsSaved: completedDonations, // Placeholder logic
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel donation
// @route   PATCH /api/donations/:id/cancel
// @access  Private (Donor)
export const cancelDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Allow cancellation only if status is 'active' or 'assigned'
        if (!['active', 'assigned'].includes(donation.status)) {
            return res.status(400).json({
                message: `Cannot cancel donation when it is in status: ${donation.status}`,
            });
        }

        donation.status = 'cancelled';
        await donation.save();

        // Notify relevant parties
        await createNotification(
            donation.donor,
            `You have cancelled the donation: ${donation.title}`,
            'donation_cancelled',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    View donation details
// @route   GET /api/donations/:id
// @access  Private
export const getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donor', 'name email organization');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark donation as completed
// @route   PATCH /api/donations/:id/complete
// @access  Private (Usually volunteer/NGO, but we need the status update logic here)
export const completeDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = 'completed';
        await donation.save();

        // Notify donor
        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" has been successfully completed!`,
            'donation_completed',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
