import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import { createNotification } from '../utils/notification.js';

// @desc    Create new donation
// @route   POST /api/donations
// @access  Private (Donor)
export const createDonation = async (req, res) => {
    try {
        let {
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

        // Helper to parse JSON fields from multipart/form-data
        const parseJsonField = (val) => {
            if (!val) return null;
            if (typeof val === 'object') return val;
            try {
                return JSON.parse(val);
            } catch (e) {
                console.error(`Failed to parse field:`, val);
                return null;
            }
        };

        pickupWindow = parseJsonField(pickupWindow);
        coordinates = parseJsonField(coordinates);
        allergens = parseJsonField(allergens) || [];
        dietaryTags = parseJsonField(dietaryTags) || [];

        if (!pickupWindow || !pickupWindow.start || !pickupWindow.end) {
            return res.status(400).json({ message: 'Invalid pickup window format.' });
        }

        const expiry = new Date(expiryDate);
        const windowStart = new Date(pickupWindow.start);
        const windowEnd = new Date(pickupWindow.end);
        const now = new Date();

        if (isNaN(expiry.getTime())) return res.status(400).json({ message: 'Invalid expiry date.' });
        if (isNaN(windowStart.getTime())) return res.status(400).json({ message: 'Invalid pickup window start date.' });
        if (isNaN(windowEnd.getTime())) return res.status(400).json({ message: 'Invalid pickup window end date.' });

        // Safety Rule: Validate that (expiryDate - Date.now()) > 2 hours
        const hoursToExpiry = (expiry - now) / (1000 * 60 * 60);
        if (hoursToExpiry < 2) {
            return res.status(400).json({
                message: 'Food items must be valid for at least 2 hours before expiry for safety.',
            });
        }

        // Scheduling Rule: Ensure pickupWindow.end < expiryDate
        if (windowEnd >= expiry) {
            return res.status(400).json({
                message: 'Pickup window must end before the food expires.',
            });
        }

        // Handle photos if uploaded via Multer
        const photos = req.files ? req.files.map((file) => file.path) : [];

        const donationData = {
            title,
            description,
            foodType,
            quantity,
            expiryDate: expiry,
            perishability,
            photos,
            pickupWindow: {
                start: windowStart,
                end: windowEnd,
            },
            pickupAddress,
            coordinates: {
                type: 'Point',
                coordinates: Array.isArray(coordinates) ? coordinates : (coordinates?.coordinates || coordinates),
            },
            allergens,
            dietaryTags,
            donor: req.user._id,
        };

        // Ensure coordinates are just the [lng, lat] array
        if (donationData.coordinates.coordinates && Array.isArray(donationData.coordinates.coordinates)) {
            // Already in the right shape if it was a nested object
        } else if (Array.isArray(donationData.coordinates)) {
            const coordsArray = donationData.coordinates;
            donationData.coordinates = { type: 'Point', coordinates: coordsArray };
        }

        const donation = await Donation.create(donationData);

        // Notify NGOs
        await createNotification(
            'NGO_BROADCAST_GROUP',
            `New donation available: ${title}`,
            'donation_created',
            donation._id
        );

        res.status(201).json(donation);
    } catch (error) {
        console.error('Donation Creation Error:', error);
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
            totalMealsSaved: completedDonations,
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

// @desc    Mark donation as completed and provide feedback
// @route   PATCH /api/donations/:id/complete
// @access  Private (NGO/Volunteer)
export const completeDonation = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        donation.status = 'completed';
        donation.feedback = { rating, comment };
        await donation.save();

        // Notify donor
        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" has been successfully completed and rated ${rating}/5!`,
            'donation_completed',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get smart feed for NGOs
// @route   GET /api/donations/feed
// @access  Private (NGO)
export const getSmartFeed = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({ message: 'Only NGOs can access the feed' });
        }

        const { storageFacilities, dailyCapacity, isUrgentNeed } = user.ngoProfile;

        let query = {
            status: 'active',
        };

        // Storage Match: If the NGO has storageFacilities, only return matching donations
        if (storageFacilities && storageFacilities.length > 0) {
            query.storageReq = { $in: storageFacilities };
        }

        let donations;

        // Sorting and Geospatial logic
        if (user.coordinates && user.coordinates.lat && user.coordinates.lng) {
            const userCoords = [user.coordinates.lng, user.coordinates.lat];

            donations = await Donation.find({
                ...query,
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: userCoords
                        }
                    }
                }
            });
        } else {
            donations = await Donation.find(query).sort({ createdAt: -1 });
        }

        // Capacity Warning logic (Simplified: based on dailyCapacity vs available donations count)
        const capacityWarning = dailyCapacity > 0 && donations.length > dailyCapacity;

        res.json({
            donations,
            capacityWarning,
            count: donations.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Claim a donation
// @route   PATCH /api/donations/:id/claim
// @access  Private (NGO)
export const claimDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        if (donation.status !== 'active') return res.status(400).json({ message: 'Donation is no longer active' });

        donation.status = 'assigned';
        donation.claimedBy = req.user.id;
        donation.claimedAt = Date.now();
        await donation.save();

        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" has been claimed by ${req.user.organization}`,
            'donation_assigned',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

// @desc    Reject a donation (for safety reasons)
// @route   PATCH /api/donations/:id/reject
// @access  Private (NGO)
export const rejectDonation = async (req, res, next) => {
    try {
        const { rejectionReason } = req.body;
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        donation.status = 'rejected';
        donation.rejectionReason = rejectionReason;
        await donation.save();

        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" was rejected for safety reasons. Reason: ${rejectionReason}`,
            'donation_rejected',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

// @desc    Get donations claimed by NGO
// @route   GET /api/donations/claimed
// @access  Private (NGO)
export const getClaimedDonations = async (req, res, next) => {
    try {
        const donations = await Donation.find({ claimedBy: req.user._id })
            .sort({ updatedAt: -1 })
            .populate('donor', 'name organization');
        res.json(donations);
    } catch (error) {
        next(error);
    }
};
