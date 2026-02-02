import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import { createNotification } from '../utils/notification.js';
import sendEmail from '../utils/email.js';
import { geocodeAddress } from '../utils/geocoder.js';
import { findBestDonationsForNGO, getUnmetNeed, findSuitableVolunteers } from '../services/matching.service.js';
import { getOptimalPath, getTravelCost } from '../services/routing.service.js';

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

        // Automated Address-to-Coordinate Conversion (Geocoding)
        if (pickupAddress) {
            const geocoded = await geocodeAddress(pickupAddress);
            if (geocoded) {
                console.log(`Donation Geocoding Success: ${pickupAddress} -> [${geocoded.lng}, ${geocoded.lat}]`);
                donationData.coordinates = {
                    type: 'Point',
                    coordinates: [geocoded.lng, geocoded.lat]
                };
            }
        }

        // Ensure coordinates are just the [lng, lat] array
        if (donationData.coordinates.coordinates && Array.isArray(donationData.coordinates.coordinates)) {
            // Already in the right shape if it was a nested object
        } else if (Array.isArray(donationData.coordinates)) {
            const coordsArray = donationData.coordinates;
            donationData.coordinates = { type: 'Point', coordinates: coordsArray };
        }

        const donation = await Donation.create(donationData);

        // Notify All Nearby NGOs (Broadcast)
        try {
            const ngos = await User.find({ role: 'ngo' });
            for (const ngo of ngos) {
                await createNotification(
                    ngo._id,
                    `New donation available: ${title}`,
                    'donation_created',
                    donation._id
                );
            }
        } catch (notifyError) {
            console.error('Broadcast notification failed:', notifyError);
        }

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

// @desc    Get NGO stats
// @route   GET /api/donations/ngo/stats
// @access  Private (NGO)
export const getNgoStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Total Distributions (Completed)
        const completedDonations = await Donation.find({
            claimedBy: userId,
            status: 'completed'
        });

        // 2. Sum up weight/meals
        let mealsReceived = 0;
        completedDonations.forEach(d => {
            const match = String(d.quantity).match(/(\d+(\.\d+)?)/);
            if (match) {
                mealsReceived += parseFloat(match[0]);
            } else {
                mealsReceived += 1; // Default increment if no number found
            }
        });

        // 3. Average Delivery Time (Time between pickedUpAt and deliveredAt)
        let totalDeliveryTime = 0;
        let deliveriesWithTime = 0;

        completedDonations.forEach(d => {
            if (d.pickedUpAt && d.deliveredAt) {
                const diff = (new Date(d.deliveredAt).getTime() - new Date(d.pickedUpAt).getTime()) / (1000 * 60); // minutes
                totalDeliveryTime += diff;
                deliveriesWithTime++;
            }
        });

        const avgDeliveryTime = deliveriesWithTime > 0 ? Math.round(totalDeliveryTime / deliveriesWithTime) : 0;

        res.json({
            mealsReceived: parseFloat(mealsReceived.toFixed(1)),
            avgDeliveryTime,
            totalDistributions: completedDonations.length,
            trend: 12
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

        if (donation.status === 'completed') {
            return res.status(400).json({ message: 'Donation is already completed' });
        }

        donation.status = 'completed';
        donation.feedback = { rating, comment };
        await donation.save();

        // Update Donor Trust Metrics
        const donor = await User.findById(donation.donor);
        if (donor) {
            // Initialize stats if missing (migration safety)
            if (!donor.stats) {
                donor.stats = { trustScore: 5.0, totalRatings: 0, completedDonations: 0 };
            }

            const currentScore = donor.stats.trustScore || 5.0;
            const currentCount = donor.stats.totalRatings || 0;

            // Calculate new Weighted Average
            // If it's the first real rating, maybe start fresh or blend? 
            // We use standard cumulative average.
            const newCount = currentCount + 1;
            const newScore = ((currentScore * currentCount) + Number(rating)) / newCount;

            donor.stats.trustScore = parseFloat(newScore.toFixed(2));
            donor.stats.totalRatings = newCount;
            donor.stats.completedDonations = (donor.stats.completedDonations || 0) + 1;

            await donor.save();
        }

        // Notify donor
        await createNotification(
            donation.donor,
            `Your donation "${donation.title}" was completed! You received a ${rating}/5 rating.`,
            'donation_completed',
            donation._id
        );

        res.json(donation);
    } catch (error) {
        next(error);
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

        const { storageFacilities, dailyCapacity } = user.ngoProfile;

        // Use the new matching service to find best donations for the NGO
        let donations = [];
        let unmetNeed = 0;
        let capacityWarning = false;

        try {
            if (user.coordinates && user.coordinates.lat && user.coordinates.lng) {
                // Populate location field for geospatial query if not already populated
                if (!user.location || (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)) {
                    user.location = {
                        type: 'Point',
                        coordinates: [user.coordinates.lng, user.coordinates.lat]
                    };
                    await user.save();
                }

                // Find best donations within 15km radius with suitability scores
                donations = await findBestDonationsForNGO(req.user.id);

                // Get unmet need for today
                unmetNeed = await getUnmetNeed(req.user.id);

                // Capacity warning if claimed donations exceed dailyCapacity
                capacityWarning = dailyCapacity > 0 && donations.length > 0 && unmetNeed <= 0;
            } else {
                // Fallback: return all active donations if NGO coordinates are not set
                donations = await Donation.find({ status: 'active' })
                    .populate('donor', 'name organization')
                    .sort({ createdAt: -1 })
                    .limit(20);
            }
        } catch (matchingError) {
            console.error('Matching service error:', matchingError);
            // Fallback to simple query if matching service fails
            const query = { status: 'active' };
            if (storageFacilities && storageFacilities.length > 0) {
                query.storageReq = { $in: storageFacilities };
            }
            donations = await Donation.find(query)
                .populate('donor', 'name organization')
                .sort({ createdAt: -1 })
                .limit(20);
        }

        res.json({
            donations: donations.map(d => ({
                ...d._doc || d,
                matchPercentage: d.matchPercentage || undefined,
                suitabilityScore: d.suitabilityScore || undefined,
                urgencyLevel: d.urgencyLevel || undefined,
            })),
            capacityWarning,
            unmetNeed,
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

        // Safety Buffer Logic: Prevent claiming if less than 30 minutes until expiry
        const now = new Date();
        const minsRemaining = (new Date(donation.expiryDate) - now) / (1000 * 60);
        if (minsRemaining < 30) {
            return res.status(400).json({
                message: 'Safety Threshold Reached: This donation is too close to expiry for safe transport.'
            });
        }

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

        // Trigger Auto-Dispatch for volunteers
        initiateAutoDispatch(donation._id);

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

/**
 * Auto-Dispatch Logic: Finds top 3 volunteers and notifies them with tiered delays.
 * Implements 2-minute "First Right of Refusal" lock.
 * @param {string} donationId 
 */
const initiateAutoDispatch = async (donationId) => {
    try {
        const donation = await Donation.findById(donationId);
        if (!donation) return;

        // Find top suitable volunteers (10km base)
        const topVolunteers = await findSuitableVolunteers(donation, 10000);
        if (topVolunteers.length === 0) {
            console.log(`[Auto-Dispatch] No volunteers found for donation ${donationId} within 10km.`);
            return;
        }

        // Filter top 3 for priority dispatch
        const priorityVolunteers = topVolunteers.slice(0, 3);

        // Update donation with dispatch info
        donation.dispatchedTo = priorityVolunteers.map(v => v._id);
        donation.dispatchedAt = new Date();
        await donation.save();

        console.log(`[Auto-Dispatch] Dispatching donation ${donationId} to ${priorityVolunteers.length} volunteers.`);

        // Tiered Notifications (30s gap)
        priorityVolunteers.forEach((volunteer, index) => {
            const delay = index * 30000; // 0s, 30s, 60s

            setTimeout(async () => {
                // Re-verify donation is still available for mission (deliveryStatus: idle)
                const freshDonation = await Donation.findById(donationId);
                if (freshDonation && freshDonation.deliveryStatus === 'idle') {
                    await createNotification(
                        volunteer._id,
                        `PRIORITY MISSION: A nearby donation "${freshDonation.title}" needs delivery! You have priority access for the next 2 minutes.`,
                        'priority_dispatch',
                        donationId
                    );
                }
            }, delay);
        });

    } catch (error) {
        console.error('[Auto-Dispatch] Error:', error);
    }
};

// @desc    Reject a donation (for safety reasons)
// @route   PATCH /api/donations/:id/reject
// @access  Private (NGO)
export const rejectDonation = async (req, res, next) => {
    try {
        const { rejectionReason } = req.body;

        if (!rejectionReason) {
            return res.status(400).json({ message: 'A rejection reason is required for safety auditing.' });
        }

        const donation = await Donation.findById(req.params.id).populate('donor', 'name email');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Allow rejection if active or assigned (to cancel assignment)
        if (!['active', 'assigned'].includes(donation.status)) {
            return res.status(400).json({ message: 'This donation is already closed or completed.' });
        }

        donation.status = 'rejected';
        donation.rejectionReason = rejectionReason;
        await donation.save();

        // Parse Reason for better display
        let formattedReason = rejectionReason;
        const reasonMatch = rejectionReason.match(/^\[(.*?)\]\s*(.*)$/);
        if (reasonMatch) {
            formattedReason = `${reasonMatch[1]}`;
            if (reasonMatch[2]) formattedReason += ` - ${reasonMatch[2]}`;
        }

        // 1. App Notification
        if (donation.donor) {
            await createNotification(
                donation.donor._id || donation.donor,
                `Your donation "${donation.title}" was rejected: ${formattedReason}`,
                'donation_rejected',
                donation._id
            );
        }

        // 2. Email Notification (Professional HTML)
        try {
            const emailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">SurplusLink</h1>
                </div>
                
                <div style="padding: 32px; background-color: #ffffff;">
                    <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Update on your Donation</h2>
                    
                    <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">Hello <strong>${donation.donor.name}</strong>,</p>
                    
                    <p style="color: #475569; line-height: 1.6; margin-bottom: 24px;">
                        Use of our platform helps reduce waste, and we appreciate your effort. However, an NGO has flagged your donation <strong>"${donation.title}"</strong> as unable to be distributed.
                    </p>

                    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 24px; border-radius: 6px;">
                        <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Reason for Rejection</p>
                        <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 16px;">${formattedReason}</p>
                    </div>

                    <p style="color: #475569; line-height: 1.6; font-size: 14px;">
                        Please ensure future donations meet our <strong>Safety & Hygiene Standards</strong> to avoid account restrictions. We prioritize the health of all recipients.
                    </p>

                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; line-height: 1.5; font-size: 14px; margin: 0;">
                            Best regards,<br>
                            <span style="color: #0f172a; font-weight: 600;">The SurplusLink Safety Team</span>
                        </p>
                    </div>
                </div>
                
                <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        &copy; ${new Date().getFullYear()} SurplusLink. All rights reserved.
                    </p>
                </div>
            </div>
            `;

            if (donation.donor && donation.donor.email) {
                await sendEmail({
                    email: donation.donor.email,
                    subject: 'Action Required: Donation Update',
                    message: `Your donation was rejected. Reason: ${formattedReason}`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
            // Don't fail the request, just log it
        }

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
// @desc    Get available missions for volunteers
// @route   GET /api/donations/available-missions
// @access  Private (Volunteer)
export const getAvailableMissions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // 1. Online Check
        if (!user.isOnline) {
            return res.status(400).json({ message: 'You must be online to find missions.' });
        }

        const { maxWeight, currentLocation } = user.volunteerProfile || {};

        // 2. Base Query: Claimed by NGO but waiting for volunteer
        // We look for status 'assigned' (claimed by NGO) and deliveryStatus 'idle'
        const query = {
            status: 'assigned',
            deliveryStatus: 'idle',
            volunteer: { $exists: false }, // Double check no volunteer is assigned
        };

        let donations;

        // 3. Proximity Sort & Safety Filter (Only show items with > 30 mins remaining)
        const now = new Date();
        const safetyThreshold = new Date(now.getTime() + 30 * 60000);
        const lockThreshold = new Date(now.getTime() - 2 * 60000); // 2 minutes ago

        // First Right of Refusal Filter:
        // if locked (dispatchedAt > 2 mins ago), only show to dispatchedTo volunteers
        const lockFilter = {
            $or: [
                { dispatchedAt: { $exists: false } }, // Not dispatched
                { dispatchedAt: { $lt: lockThreshold } }, // Lock expired
                { dispatchedTo: req.user.id } // User is one of the priority volunteers
            ]
        };

        const baseQuery = {
            ...query,
            expiryDate: { $gt: safetyThreshold },
            ...lockFilter
        };

        if (currentLocation && currentLocation.coordinates && currentLocation.coordinates.length === 2) {
            donations = await Donation.find({
                ...baseQuery,
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: currentLocation.coordinates
                        }
                    }
                }
            }).populate('donor', 'name address').populate('claimedBy', 'organization address');
        } else {
            donations = await Donation.find(baseQuery).populate('donor', 'name address').populate('claimedBy', 'organization address');
        }

        // 4. Capacity Filter (In-memory)
        const suitableMissions = donations.filter(donation => {
            if (!maxWeight) return true; // If no max weight set, show all? Or assume 0? Assuming strict safety, maybe filter. But usually assume capable if undefined. Let's assume passed if undefined for flexibility unless logic requires it.

            // Parse quantity
            const quantityStr = String(donation.quantity).toLowerCase();
            const match = quantityStr.match(/(\d+(\.\d+)?)/);
            if (match) {
                const weight = parseFloat(match[0]);
                return weight <= maxWeight;
            }
            return true; // If we can't parse, let the volunteer decide (return it)
        });

        res.json(suitableMissions);

    } catch (error) {
        next(error);
    }
};

// @desc    Accept a mission
// @route   PATCH /api/donations/:id/accept-mission
// @access  Private (Volunteer)
export const acceptMission = async (req, res, next) => {
    try {
        const donationId = req.params.id;
        const volunteerId = req.user.id;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(400).json({ message: 'Mission not found.' });
        }

        // Safety Buffer Logic
        const now = new Date();
        const minsRemaining = (new Date(donation.expiryDate) - now) / (1000 * 60);
        if (minsRemaining < 30) {
            return res.status(400).json({
                message: 'Safety Threshold Reached: Too close to expiry for safe delivery.'
            });
        }

        // Atomic update to prevent race conditions
        const updatedDonation = await Donation.findOneAndUpdate(
            {
                _id: donationId,
                status: 'assigned',
                deliveryStatus: 'idle',
                volunteer: { $exists: false } // ensure strictly available
            },
            {
                volunteer: volunteerId,
                deliveryStatus: 'pending_pickup',
                $set: { status: 'assigned' } // Re-affirm status (redundant but safe)
            },
            { new: true }
        ).populate('donor', 'name email').populate('claimedBy', 'organization email');

        if (!updatedDonation) {
            return res.status(400).json({ message: 'Mission already taken.' });
        }

        const donationFinal = updatedDonation;

        const volunteerName = req.user.name;

        // Notify Donor
        await createNotification(
            donationFinal.donor._id,
            `A volunteer ${volunteerName} is on their way to pick up your donation!`,
            'volunteer_accepted',
            donationFinal._id
        );

        // Notify NGO
        if (donationFinal.claimedBy) {
            await createNotification(
                donationFinal.claimedBy._id,
                `Volunteer ${volunteerName} has accepted your delivery and is heading to the donor.`,
                'volunteer_accepted',
                donationFinal._id
            );
        }

        res.json(donationFinal);
    } catch (error) {
        next(error);
    }
};

// @desc    Update granular delivery status
// @route   PATCH /api/donations/:id/delivery-status
// @access  Private (Volunteer)
export const updateDeliveryStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['heading_to_pickup', 'at_pickup', 'in_transit', 'arrived_at_delivery'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status update for this endpoint' });
        }

        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Verify Volunteer
        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        donation.deliveryStatus = status;
        await donation.save();

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm Pickup with Proof
// @route   PATCH /api/donations/:id/pickup
// @access  Private (Volunteer)
export const confirmPickup = async (req, res, next) => {
    try {
        const pickupPhoto = req.file ? req.file.path : null;

        if (!pickupPhoto) {
            return res.status(400).json({ message: 'Proof of pickup (photo) is required' });
        }

        const donation = await Donation.findById(req.params.id).populate('claimedBy', 'organization');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        donation.deliveryStatus = 'picked_up';
        donation.pickupPhoto = pickupPhoto;
        donation.pickedUpAt = Date.now();
        await donation.save();

        // Notify NGO
        if (donation.claimedBy) {
            await createNotification(
                donation.claimedBy._id,
                `Your donation has been picked up by ${req.user.name} and is on the way!`,
                'donation_picked_up',
                donation._id
            );
        }

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

// @desc    Confirm Delivery with Proof
// @route   PATCH /api/donations/:id/deliver
// @access  Private (Volunteer)
export const confirmDelivery = async (req, res, next) => {
    try {
        const deliveryPhoto = req.file ? req.file.path : null;
        const { notes } = req.body;

        if (!deliveryPhoto) {
            return res.status(400).json({ message: 'Proof of delivery (photo) is required' });
        }

        const donation = await Donation.findById(req.params.id).populate('claimedBy', 'organization');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        // Enforce sequence: Can only deliver if picked up (or states after pickup)
        const allowedPreviousStates = ['picked_up', 'in_transit', 'arrived_at_delivery'];
        if (!allowedPreviousStates.includes(donation.deliveryStatus)) {
            return res.status(400).json({ message: 'Cannot confirm delivery. Ensure item is picked up first.' });
        }

        donation.deliveryStatus = 'delivered';
        donation.deliveryPhoto = deliveryPhoto;
        donation.deliveryNotes = notes;
        donation.deliveredAt = Date.now();
        await donation.save();

        // Update Volunteer Stats & Tier
        const volunteer = await User.findById(req.user.id);
        if (volunteer) {
            volunteer.stats.completedDonations = (volunteer.stats.completedDonations || 0) + 1;

            // Check Tier Upgrade
            const count = volunteer.stats.completedDonations;
            let newTier = volunteer.volunteerProfile.tier;

            if (count >= 50) newTier = 'champion';
            else if (count >= 10) newTier = 'hero';

            if (newTier !== volunteer.volunteerProfile.tier) {
                volunteer.volunteerProfile.tier = newTier;
                // Notify of validation/upgrade?
                await createNotification(
                    volunteer._id,
                    `Congratulations! You've been promoted to ${newTier.toUpperCase()} tier!`,
                    'general'
                );
            }
            await volunteer.save();
        }

        // Notify NGO
        if (donation.claimedBy) {
            await createNotification(
                donation.claimedBy._id,
                `${req.user.name} has arrived at your location. Please verify receipt to finalize!`,
                'donation_delivered',
                donation._id
            );
        }

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

// @desc    Volunteer fails/drops a mission
// @route   PATCH /api/donations/:id/fail-mission
// @access  Private (Volunteer)
export const failMission = async (req, res, next) => {
    try {
        const { failureReason } = req.body;

        if (!failureReason) {
            return res.status(400).json({ message: 'A failure reason is required.' });
        }

        const donation = await Donation.findById(req.params.id).populate('claimedBy', 'organization');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        // Verify volunteer assignment
        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized. You are not the assigned volunteer.' });
        }

        const volunteerName = req.user.name;

        // Reset Mission
        donation.volunteer = undefined;
        donation.deliveryStatus = 'idle';
        donation.status = 'assigned'; // Back to the pool of claimed donations waiting for a volunteer

        // We don't store failureReason permanently in schema as per current instructions, maybe redundant.
        // But we must notify.
        await donation.save();

        // Update stats
        await User.findByIdAndUpdate(req.user.id, { $inc: { 'stats.cancelledDonations': 1 } });

        // Notify NGO
        if (donation.claimedBy) {
            await createNotification(
                donation.claimedBy._id,
                `Volunteer ${volunteerName} dropped the mission. Reason: "${failureReason}". Searching for a new match.`,
                'general',
                donation._id
            );
        }

        res.json({ message: 'Mission failed and reset successfully', donation });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current active mission for volunteer
// @route   GET /api/donations/active-mission
// @access  Private (Volunteer)
export const getVolunteerActiveMission = async (req, res, next) => {
    try {
        const activeMission = await Donation.findOne({
            volunteer: req.user.id,
            deliveryStatus: { $in: ['pending_pickup', 'heading_to_pickup', 'at_pickup', 'picked_up', 'in_transit', 'arrived_at_delivery'] }
        })
            .populate('donor', 'name address email organization coordinates')
            .populate('claimedBy', 'organization address email coordinates');

        res.json(activeMission);
    } catch (error) {
        next(error);
    }
};

// @desc    Get volunteer history
// @route   GET /api/donations/volunteer/history
// @access  Private (Volunteer)
export const getVolunteerHistory = async (req, res, next) => {
    try {
        const history = await Donation.find({
            volunteer: req.user.id,
            status: 'completed'
        }).sort({ updatedAt: -1 })
            .populate('donor', 'name organization')
            .populate('claimedBy', 'organization');

        res.json(history);
    } catch (error) {
        next(error);
    }
};

// @desc    Admin "Control Tower" - Active Missions
// @route   GET /api/donations/admin/active-missions
// @access  Private (Admin)
export const getAdminActiveMissions = async (req, res, next) => {
    try {
        const activeMissions = await Donation.find({
            deliveryStatus: { $in: ['pending_pickup', 'heading_to_pickup', 'at_pickup', 'picked_up', 'in_transit', 'arrived_at_delivery'] }
        })
            .populate('volunteer', 'name volunteerProfile.currentLocation volunteerProfile.vehicleType isOnline')
            .populate('donor', 'name address coordinates')
            .populate('claimedBy', 'organization address');

        res.json(activeMissions);
    } catch (error) {
        next(error);
    }
};
// @desc    Find best NGOs for a specific donation
// @route   GET /api/donations/:id/best-ngos
// @access  Private (Donor)
export const getBestNGOs = async (req, res, next) => {
    try {
        const donationId = req.params.id;
        const donation = await Donation.findById(donationId);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const bestNGOs = await findBestNGOsForDonation(donationId);
        res.json(bestNGOs);
    } catch (error) {
        next(error);
    }
};
// @desc    Get optimized route for active mission
// @route   GET /api/donations/:id/optimized-route
// @access  Private (Volunteer)
export const getOptimizedRoute = async (req, res, next) => {
    try {
        const donationId = req.params.id;
        const volunteerId = req.user.id;

        const donation = await Donation.findById(donationId)
            .populate('donor', 'coordinates address')
            .populate('claimedBy', 'location address');

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found.' });
        }

        const user = await User.findById(volunteerId);
        const volunteerCoords = user.volunteerProfile?.currentLocation?.coordinates;

        if (!volunteerCoords || volunteerCoords[0] === 0) {
            return res.status(400).json({ message: 'Volunteer location not available.' });
        }

        // Define primary stops for this mission
        const stops = [
            {
                id: 'pickup',
                type: 'pickup',
                coordinates: donation.coordinates.coordinates,
                address: donation.pickupAddress,
                priority: 5 // medium priority base
            },
            {
                id: 'dropoff',
                type: 'dropoff',
                coordinates: donation.claimedBy?.location?.coordinates || [0, 0],
                address: donation.claimedBy?.address,
                priority: 5
            }
        ];

        // DYNAMIC DIVERSION LOGIC:
        // Check if there's a nearby high-priority donation that needs pickup
        const now = new Date();
        const urgencyThreshold = new Date(now.getTime() + 60 * 60000); // Exiring in < 1hr

        const highPriorityDonations = await Donation.find({
            status: 'assigned',
            deliveryStatus: 'idle',
            volunteer: { $exists: false },
            expiryDate: { $lt: urgencyThreshold, $gt: now },
            coordinates: {
                $near: {
                    $geometry: { type: 'Point', coordinates: volunteerCoords },
                    $maxDistance: 5000 // Within 5km diversion radius
                }
            }
        }).limit(1);

        if (highPriorityDonations.length > 0) {
            const extra = highPriorityDonations[0];
            stops.push({
                id: `diversion-${extra._id}`,
                type: 'pickup',
                coordinates: extra.coordinates.coordinates,
                address: extra.pickupAddress,
                priority: 10, // Max priority for diversion
                isDiversion: true,
                diversionDonationId: extra._id
            });
            console.log(`[Routing] High-priority diversion detected for donation ${extra._id}`);
        }

        const optimizedResult = await getOptimalPath(volunteerCoords, stops);

        res.json({
            missionId: donationId,
            currentLocation: { lng: volunteerCoords[0], lat: volunteerCoords[1] },
            ...optimizedResult,
            diversionSuggested: stops.length > 2
        });

    } catch (error) {
        next(error);
    }
};
