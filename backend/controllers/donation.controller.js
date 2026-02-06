import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import { createNotification } from '../utils/notification.js';
import sendEmail from '../utils/email.js';
import { geocodeAddress } from '../utils/geocoder.js';
import { findBestDonationsForNGO, getUnmetNeed, findSuitableVolunteers } from '../services/matching.service.js';
import { getOptimalPath } from '../services/routing.service.js';

/**
 * @desc    Create a new donation posting
 * @route   POST /api/v1/donations
 * @access  Private (Donor)
 * @description Handles food donation creation with image uploads, safety threshold validation, 
 *              and automatic geocoding of pickup addresses.
 */
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

        //safety Rule: validate that (expiryDate - Date.now()) > 2 hours
        const hoursToExpiry = (expiry - now) / (1000 * 60 * 60);
        if (hoursToExpiry < 2) {
            return res.status(400).json({
                message: 'Food items must be valid for at least 2 hours before expiry for safety.',
            });
        }

        //scheduling rule: ensure pickupWindow.end < expiryDate
        if (windowEnd >= expiry) {
            return res.status(400).json({
                message: 'Pickup window must end before the food expires.',
            });
        }

        //handle photos(cloudinary)
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

        //automated address-to-coordinate conversion (geocoding)
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

        //normalized coordinate storage for MongoDB Geospatial indexing
        if (donationData.coordinates.coordinates && Array.isArray(donationData.coordinates.coordinates)) {
        } else if (Array.isArray(donationData.coordinates)) {
            const coordsArray = donationData.coordinates;
            donationData.coordinates = { type: 'Point', coordinates: coordsArray };
        }

        const donation = await Donation.create(donationData);

        //notify all nearby ngos brodcast
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

/**
 * @desc    Get donation history for the authenticated donor
 * @route   GET /api/v1/donations/my-donations
 * @access  Private (Donor)
 */
export const getDonorHistory = async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Calculate and return performance statistics for a donor
 * @route   GET /api/v1/donations/stats
 * @access  Private (Donor)
 */
export const getDonorStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments({ donor: req.user._id });
        const completedDonations = await Donation.countDocuments({
            donor: req.user._id,
            status: 'completed',
        });

        const acceptanceRate = totalDonations > 0 ? (completedDonations / totalDonations) * 100 : 0;

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

/**
 * @desc    Get performance and impact statistics for an NGO
 * @route   GET /api/v1/donations/ngo/stats
 * @access  Private (NGO)
 */
export const getNgoStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Fetch all successful distributions for this NGO
        const completedDonations = await Donation.find({
            claimedBy: userId,
            status: 'completed'
        });

        // Metric 1: Total volume/meals received
        let mealsReceived = 0;
        completedDonations.forEach(d => {
            const match = String(d.quantity).match(/(\d+(\.\d+)?)/);
            if (match) {
                mealsReceived += parseFloat(match[0]);
            } else {
                mealsReceived += 1;
            }
        });

        // Metric 2: Logistics speed (Pickup-to-Delivery time)
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

/**
 * @desc    Cancel a donation posting (if not already picked up)
 * @route   PATCH /api/v1/donations/:id/cancel
 * @access  Private (Donor)
 */
export const cancelDonation = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);

        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        if (donation.donor.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Integrity Rule: Cannot cancel if in-transit or completed
        if (!['active', 'assigned'].includes(donation.status)) {
            return res.status(400).json({
                message: `Cannot cancel donation when it is in status: ${donation.status}`,
            });
        }

        donation.status = 'cancelled';
        await donation.save();

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

/**
 * @desc    Retrieve full details of a specific donation
 * @route   GET /api/v1/donations/:id
 * @access  Private
 */
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

/**
 * @desc    Close a mission, set feedback, and update donor trust scores
 * @route   PATCH /api/v1/donations/:id/complete
 * @access  Private (NGO/Volunteer)
 */
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

        // Engine Update: Recompute Donor Trust Metrics based on feedback
        const donor = await User.findById(donation.donor);
        if (donor) {
            if (!donor.stats) {
                donor.stats = { trustScore: 5.0, totalRatings: 0, completedDonations: 0 };
            }

            const currentScore = donor.stats.trustScore || 5.0;
            const currentCount = donor.stats.totalRatings || 0;

            const newCount = currentCount + 1;
            const newScore = ((currentScore * currentCount) + Number(rating)) / newCount;

            donor.stats.trustScore = parseFloat(newScore.toFixed(2));
            donor.stats.totalRatings = newCount;
            donor.stats.completedDonations = (donor.stats.completedDonations || 0) + 1;

            await donor.save();
        }

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

/**
 * @desc    Generate a smart, prioritized feed for NGOs
 * @route   GET /api/v1/donations/feed
 * @access  Private (NGO)
 * @description Ranks donations based on proximity, urgency (expiry), and NGO capacity.
 */
export const getSmartFeed = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'ngo') {
            return res.status(403).json({ message: 'Only NGOs can access the feed' });
        }

        const { storageFacilities, dailyCapacity } = user.ngoProfile;

        // Execute AI-driven matching service
        let donations = [];
        let unmetNeed = 0;
        let capacityWarning = false;

        try {
            if (user.coordinates && user.coordinates.lat && user.coordinates.lng) {
                // Background Patch: Ensure legacy location field is populated for geospatial queries
                if (!user.location || (user.location.coordinates[0] === 0 && user.location.coordinates[1] === 0)) {
                    user.location = {
                        type: 'Point',
                        coordinates: [user.coordinates.lng, user.coordinates.lat]
                    };
                    await user.save();
                }

                // Core Logic: Find best donations within 15km
                donations = await findBestDonationsForNGO(req.user.id);
                unmetNeed = await getUnmetNeed(req.user.id);
                capacityWarning = dailyCapacity > 0 && donations.length > 0 && unmetNeed <= 0;
            } else {
                // Baseline Fallback: Return simple time-sorted active donations
                donations = await Donation.find({ status: 'active' })
                    .populate('donor', 'name organization')
                    .sort({ createdAt: -1 })
                    .limit(20);
            }
        } catch (matchingError) {
            console.error('Matching service error:', matchingError);
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

/**
 * @desc    Claim an active donation for distribution
 * @route   PATCH /api/v1/donations/:id/claim
 * @access  Private (NGO)
 * @description Validates safety thresholds before allowing a claim.
 */
export const claimDonation = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });
        if (donation.status !== 'active') return res.status(400).json({ message: 'Donation is no longer active' });

        // Logistic Safety Check: 30-minute buffer before expiry
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

        // Immediate Dispatch: Alert top suitable volunteers
        initiateAutoDispatch(donation._id);

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Automated Mission Reassignment (Supervisor Function)
 * @description Logic to handle stalled or abandoned missions by redistributing tasks.
 * @param   {string} donationId - The ID of the mission to reassign
 * @param   {string} reason - Justification for reassignment
 */
export const reassignMission = async (donationId, reason = 'Stalled or abandoned') => {
    try {
        const donation = await Donation.findById(donationId).populate('volunteer');
        if (!donation) return;

        const oldVolunteer = donation.volunteer;

        // Reset Mission State for New Assignment
        donation.volunteer = undefined;
        donation.deliveryStatus = 'idle';
        donation.status = 'assigned';
        donation.estimatedArrivalAt = undefined;
        await donation.save();

        if (oldVolunteer) {
            // Adjust volunteer work-load metrics
            await User.findByIdAndUpdate(oldVolunteer._id, {
                $inc: { currentTaskCount: -1 },
                $set: { 'volunteerProfile.lastLocationUpdate': new Date(0) } // Reset heartbeat status
            });

            await createNotification(
                oldVolunteer._id,
                `The mission for "${donation.title}" has been unassigned due to: ${reason}.`,
                'general'
            );
        }

        // High-Priority Push to next available tier of volunteers
        console.log(`[Supervisor] Reassigning mission ${donationId} due to ${reason}`);
        initiateAutoDispatch(donationId, true);

    } catch (error) {
        console.error('[Supervisor] Reassignment failed:', error);
    }
};

/**
 * @desc    Internal Dispatch Logic: Multi-tiered notification engine
 * @description Implements tiered delays (30s) to give high-suitability volunteers the "First Right of Refusal".
 * @param   {string} donationId - The mission to dispatch
 * @param   {boolean} isRetry - Whether this is a high-priority reassignment
 */
export const initiateAutoDispatch = async (donationId, isRetry = false) => {
    try {
        const donation = await Donation.findById(donationId);
        if (!donation) return;

        // Discovery: Find volunteers within 10km grid
        const topVolunteers = await findSuitableVolunteers(donation, 10000);
        if (topVolunteers.length === 0) {
            console.log(`[Auto-Dispatch] No volunteers found for donation ${donationId} within 10km.`);
            return;
        }

        const priorityVolunteers = topVolunteers.slice(0, 3);

        donation.dispatchedTo = priorityVolunteers.map(v => v._id);
        donation.dispatchedAt = new Date();
        await donation.save();

        console.log(`[Auto-Dispatch] Dispatching donation ${donationId} to ${priorityVolunteers.length} volunteers.`);

        const isTest = process.env.NODE_ENV === 'test';
        
        // Strategy: Sequence notifications to prevent multiple volunteers from racing to the same item
        priorityVolunteers.forEach((volunteer, index) => {
            const delay = isTest ? 0 : index * 30000; 

            setTimeout(async () => {
                const freshDonation = await Donation.findById(donationId);
                if (freshDonation && freshDonation.status === 'assigned' && !freshDonation.volunteer) {
                    const message = isRetry ?
                        `URGENT REASSIGNMENT: "${donation.title}" needs a volunteer immediately!` :
                        `New Mission: A donation "${donation.title}" is available near you!`;

                    await createNotification(
                        volunteer._id,
                        message,
                        'priority_dispatch',
                        donation._id
                    );
                }
            }, delay);
        });

    } catch (error) {
        console.error('[Auto-Dispatch] Error:', error);
    }
};

/**
 * @desc    Reject a donation due to safety or quality concerns
 * @route   PATCH /api/v1/donations/:id/reject
 * @access  Private (NGO)
 */
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

        if (!['active', 'assigned'].includes(donation.status)) {
            return res.status(400).json({ message: 'This donation is already closed or completed.' });
        }

        donation.status = 'rejected';
        donation.rejectionReason = rejectionReason;
        await donation.save();

        let formattedReason = rejectionReason;
        const reasonMatch = rejectionReason.match(/^\[(.*?)\]\s*(.*)$/);
        if (reasonMatch) {
            formattedReason = `${reasonMatch[1]}`;
            if (reasonMatch[2]) formattedReason += ` - ${reasonMatch[2]}`;
        }

        // Notification: App Warning
        if (donation.donor) {
            await createNotification(
                donation.donor._id || donation.donor,
                `Your donation "${donation.title}" was rejected: ${formattedReason}`,
                'donation_rejected',
                donation._id
            );
        }

        // Notification: Professional Safety Email
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
        }

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get list of all current and historical claims for an NGO
 * @route   GET /api/v1/donations/claimed
 * @access  Private (NGO)
 */
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
/**
 * @desc    Find suitable missions for online volunteers
 * @route   GET /api/v1/donations/available-missions
 * @access  Private (Volunteer)
 * @description Filters by proximity, vehicle capacity, and implementation of the "First Right of Refusal" 2-minute lock.
 */
export const getAvailableMissions = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        // State Check: Only online volunteers can receive tasks
        if (!user.isOnline) {
            return res.status(400).json({ message: 'You must be online to find missions.' });
        }

        const { maxWeight, currentLocation } = user.volunteerProfile || {};

        const query = {
            status: 'assigned',
            deliveryStatus: 'idle',
            volunteer: { $exists: false }, 
        };

        let donations;

        const now = new Date();
        const safetyThreshold = new Date(now.getTime() + 30 * 60000); // Expiry > 30m
        const lockThreshold = new Date(now.getTime() - 2 * 60000); // 2 minute lock window

        // Logistic Rule: Honor the 2-minute priority period for dispatched volunteers
        const lockFilter = {
            $or: [
                { dispatchedAt: { $exists: false } }, 
                { dispatchedAt: { $lt: lockThreshold } }, 
                { dispatchedTo: req.user.id } 
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
            }).populate('donor', 'name address stats.trustScore').populate('claimedBy', 'organization address');
        } else {
            donations = await Donation.find(baseQuery).populate('donor', 'name address stats.trustScore').populate('claimedBy', 'organization address');
        }

        // Capacity Rule: Filter missions based on volunteer vehicle weight limits
        const suitableMissions = donations.filter(donation => {
            if (!maxWeight) return true; 

            const quantityStr = String(donation.quantity).toLowerCase();
            const match = quantityStr.match(/(\d+(\.\d+)?)/);
            if (match) {
                const weight = parseFloat(match[0]);
                return weight <= maxWeight;
            }
            return true; 
        });

        res.json(suitableMissions);

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Commit to a specific delivery mission
 * @route   PATCH /api/v1/donations/:id/accept-mission
 * @access  Private (Volunteer)
 */
export const acceptMission = async (req, res, next) => {
    try {
        const donationId = req.params.id;
        const volunteerId = req.user.id;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(400).json({ message: 'Mission not found.' });
        }

        const now = new Date();
        const minsRemaining = (new Date(donation.expiryDate) - now) / (1000 * 60);
        if (minsRemaining < 30) {
            return res.status(400).json({
                message: 'Safety Threshold Reached: Too close to expiry for safe delivery.'
            });
        }

        // Atomic Transaction: Ensure no two volunteers can claim the same mission
        const updatedDonation = await Donation.findOneAndUpdate(
            {
                _id: donationId,
                status: 'assigned',
                deliveryStatus: 'idle',
                volunteer: { $exists: false } 
            },
            {
                volunteer: volunteerId,
                deliveryStatus: 'pending_pickup',
                $set: {
                    status: 'assigned',
                    estimatedArrivalAt: new Date(Date.now() + 60 * 60000) // Baseline 1-hour ETA prediction
                }
            },
            { new: true }
        ).populate('donor', 'name email').populate('claimedBy', 'organization email');

        if (!updatedDonation) {
            return res.status(400).json({ message: 'Mission already taken.' });
        }

        // Update Volunteer State for Equity & Load Balancing
        await User.findByIdAndUpdate(volunteerId, {
            $inc: { currentTaskCount: 1 },
            $set: {
                'volunteerProfile.lastMissionDate': new Date(),
                'volunteerProfile.lastLocationUpdate': new Date()
            }
        });

        const donationFinal = updatedDonation;
        const volunteerName = req.user.name;

        await createNotification(
            donationFinal.donor._id,
            `A volunteer ${volunteerName} is on their way to pick up your donation!`,
            'volunteer_accepted',
            donationFinal._id
        );

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

/**
 * @desc    Update the granular stage of a delivery mission
 * @route   PATCH /api/v1/donations/:id/delivery-status
 * @access  Private (Volunteer)
 */
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

        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        donation.deliveryStatus = status;
        await donation.save();

        // Safety Heartbeat: Update volunteer's activity timestamp
        await User.findByIdAndUpdate(req.user.id, {
            $set: { 'volunteerProfile.lastLocationUpdate': new Date() }
        });

        res.json(donation);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Confirm food pickup with photo proof
 * @route   PATCH /api/v1/donations/:id/pickup
 * @access  Private (Volunteer)
 */
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

        if (!donation.volunteer || donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        const allowedForPickup = ['pending_pickup', 'heading_to_pickup', 'at_pickup'];
        if (!allowedForPickup.includes(donation.deliveryStatus)) {
            return res.status(400).json({ message: `Cannot pickup from current status: ${donation.deliveryStatus}` });
        }

        donation.deliveryStatus = 'picked_up';
        donation.pickupPhoto = pickupPhoto;
        donation.pickedUpAt = Date.now();
        await donation.save();

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

/**
 * @desc    Confirm final delivery and upload NGO handoff proof
 * @route   PATCH /api/v1/donations/:id/deliver
 * @access  Private (Volunteer)
 */
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

        if (!donation.volunteer || donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized for this mission' });
        }

        const allowedPreviousStates = ['picked_up', 'in_transit', 'arrived_at_delivery'];
        if (!allowedPreviousStates.includes(donation.deliveryStatus)) {
            return res.status(400).json({ message: 'Cannot confirm delivery. Ensure item is picked up first.' });
        }

        donation.deliveryStatus = 'delivered';
        donation.deliveryPhoto = deliveryPhoto;
        donation.deliveryNotes = notes;
        donation.deliveredAt = Date.now();
        await donation.save();

        // Level-Up Engine: Update volunteer rank based on successful completion
        const volunteer = await User.findById(req.user.id);
        if (volunteer) {
            volunteer.stats.completedDonations = (volunteer.stats.completedDonations || 0) + 1;
            volunteer.currentTaskCount = Math.max(0, (volunteer.currentTaskCount || 1) - 1);

            // Tier Calculation
            const count = volunteer.stats.completedDonations;
            let newTier = volunteer.volunteerProfile.tier;

            if (count >= 50) newTier = 'champion';
            else if (count >= 10) newTier = 'hero';

            if (newTier !== volunteer.volunteerProfile.tier) {
                volunteer.volunteerProfile.tier = newTier;
                await createNotification(
                    volunteer._id,
                    `Congratulations! You've been promoted to ${newTier.toUpperCase()} tier!`,
                    'general'
                );
            }
            await volunteer.save();
        }

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

/**
 * @desc    Volunteer reports a failure or drops an active mission
 * @route   PATCH /api/v1/donations/:id/fail-mission
 * @access  Private (Volunteer)
 */
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

        if (donation.volunteer && donation.volunteer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized.' });
        }

        const volunteerName = req.user.name;

        // Reset and Trigger Re-dispatch
        await reassignMission(donation._id, `Volunteer Reported Failure: ${failureReason}`);

        await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.cancelledDonations': 1 }
        });

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

/**
 * @desc    Get the volunteer's current ongoing mission
 * @route   GET /api/v1/donations/active-mission
 * @access  Private (Volunteer)
 */
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

/**
 * @desc    Retrieve historical log of missions completed by a volunteer
 * @route   GET /api/v1/donations/volunteer/history
 * @access  Private (Volunteer)
 */
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

/**
 * @desc    Admin Monitoring: Global view of all missions currently in-transit
 * @route   GET /api/v1/donations/admin/active-missions
 * @access  Private (Admin)
 */
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

/**
 * @desc    Get suitability-ranked list of NGOs for a donation (UI recommendation)
 * @route   GET /api/v1/donations/:id/best-ngos
 * @access  Private (Donor)
 */
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

/**
 * @desc    Get dynamic, optimized delivery route from volunteer to donor to NGO
 * @route   GET /api/v1/donations/:id/optimized-route
 * @access  Private (Volunteer)
 * @description Injects "Dynamic Diversions" if a high-priority nearby mission is detected.
 */
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

        const stops = [
            {
                id: 'pickup',
                type: 'pickup',
                coordinates: donation.coordinates.coordinates,
                address: donation.pickupAddress,
                priority: 5 
            },
            {
                id: 'dropoff',
                type: 'dropoff',
                coordinates: donation.claimedBy?.location?.coordinates || [0, 0],
                address: donation.claimedBy?.address,
                priority: 5
            }
        ];

        // Logic: Diversion Scanner
        const now = new Date();
        const urgencyThreshold = new Date(now.getTime() + 60 * 60000); // Items expiring < 1hr

        const highPriorityDonations = await Donation.find({
            status: 'assigned',
            deliveryStatus: 'idle',
            volunteer: { $exists: false },
            expiryDate: { $lt: urgencyThreshold, $gt: now },
            coordinates: {
                $near: {
                    $geometry: { type: 'Point', coordinates: volunteerCoords },
                    $maxDistance: 5000 // 5km radius
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
                priority: 10, // Override base path
                isDiversion: true,
                diversionDonationId: extra._id
            });
            console.log(`[Routing] High-priority diversion injected for mission ${extra._id}`);
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

/**
 * @desc    Abort an accepted mission before pickup
 * @route   PATCH /api/v1/donations/:id/cancel-mission
 * @access  Private (Volunteer)
 */
export const cancelMission = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) return res.status(404).json({ message: 'Donation not found' });

        if (donation.volunteer?.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { reason } = req.body || { reason: 'Emergency/Breakdown' };

        await reassignMission(donation._id, `Volunteer Emergency: ${reason}`);

        res.json({ message: 'Mission cancelled and sent for reassignment.' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Discovery: Locate and rank suitable volunteers for a specific donation
 * @route   GET /api/v1/donations/:id/potential-volunteers
 * @access  Private (NGO/Admin)
 */
export const getPotentialVolunteers = async (req, res, next) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }

        const volunteers = await findSuitableVolunteers(donation, 15000); // 15km search grid

        const response = volunteers.map(v => ({
            id: v._id,
            name: v.name,
            matchScore: v.suitabilityScore,
            distance: v.distance,
            tier: v.tier,
            vehicleType: v.volunteerProfile?.vehicleType
        }));

        res.json(response);
    } catch (error) {
        next(error);
    }
};
