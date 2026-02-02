import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import mongoose from 'mongoose';

/**
 * Calculate the suitability score for an NGO based on a donation
 * Combines distance (60%) and need/capacity (40%)
 * Formula: Suitability = ((1/(distanceKm + 1)) * 60) + ((unmetNeed/capacity) * 40)
 * Boosts by 20% if NGO has isUrgentNeed flag
 * 
 * @param {Object} donation - The donation object
 * @param {Object} ngo - The NGO user object
 * @param {number} distance - Distance in meters
 * @param {number} unmetNeed - Unmet need for the NGO
 * @returns {number} Suitability score (0-100)
 */
const calculateSuitabilityScore = (donation, ngo, distance, unmetNeed) => {
    // Distance score (60% weight): Closer is better
    // Formula: 1 / (distance_in_km + 1) * 100
    const distanceKm = distance / 1000;
    const distanceScore = (1 / (distanceKm + 1)) * 100;
    const distanceWeight = 0.6;

    // Need/Capacity score (40% weight)
    // Score = (unmetNeed / dailyCapacity) * 100
    let needScore = 0;
    const capacity = ngo.ngoProfile?.dailyCapacity || 0;
    if (capacity > 0) {
        needScore = (unmetNeed / capacity) * 100;
    }
    const needWeight = 0.4;

    // Combine scores
    let finalScore = (distanceScore * distanceWeight) + (needScore * needWeight);

    // Boost by 20% if NGO has isUrgentNeed flag (Multiplicative boost)
    if (ngo.ngoProfile && ngo.ngoProfile.isUrgentNeed) {
        finalScore = finalScore * 1.2;
    }

    return Math.round(Math.min(finalScore, 100) * 100) / 100; // Cap at 100 and round to 2 decimal places
};

/**
 * Find the best NGOs for a specific donation within a 15km radius
 * Uses MongoDB aggregation for efficient geospatial calculations
 * 
 * @param {string} donationId - The ID of the donation
 * @returns {Promise<Array>} Array of matched NGOs with suitability scores
 */
export const findBestNGOsForDonation = async (donationId) => {
    try {
        const donation = await Donation.findById(donationId);
        if (!donation) {
            throw new Error('Donation not found');
        }

        const [lng, lat] = donation.coordinates.coordinates;

        // Use MongoDB aggregation pipeline for efficient geospatial calculations
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                    distanceField: 'distance',
                    maxDistance: 15000, // 15km in meters
                    spherical: true,
                    query: {
                        role: 'ngo',
                        status: 'active',
                    },
                },
            },
            {
                $match: {
                    // Filter: Ensure the NGO has the required storageFacilities
                    // If donation is 'frozen', NGO must have 'frozen' facility.
                    $expr: {
                        $cond: {
                            if: { $not: ["$donation.storageReq"] },
                            then: true,
                            else: {
                                $or: [
                                    { $size: { $ifNull: ["$ngoProfile.storageFacilities", []] } }, // Match if NGO says they have any? No, filter strictly.
                                    { $in: [donation.storageReq, { $ifNull: ["$ngoProfile.storageFacilities", []] }] }
                                ]
                            }
                        }
                    }
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    organization: 1,
                    email: 1,
                    distance: 1,
                    ngoProfile: 1,
                    'stats.trustScore': 1,
                    'stats.completedDonations': 1,
                },
            },
        ];

        // Fixed match logic for better clarity
        if (donation.storageReq) {
            pipeline[1].$match = {
                'ngoProfile.storageFacilities': donation.storageReq
            };
        } else {
            pipeline.splice(1, 1); // Remove match stage if no storage req
        }

        const ngos = await User.aggregate(pipeline);

        // Calculate suitability scores for each NGO
        const scoredNGOs = await Promise.all(ngos.map(async (ngo) => {
            const unmetNeed = await getUnmetNeed(ngo._id);
            const suitabilityScore = calculateSuitabilityScore(donation, ngo, ngo.distance, unmetNeed);

            return {
                ...ngo,
                suitabilityScore,
                matchPercentage: suitabilityScore,
            };
        }));

        // Sort by suitability score in descending order
        scoredNGOs.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

        return scoredNGOs;
    } catch (error) {
        console.error('Error finding best NGOs:', error);
        throw error;
    }
};

/**
 * Find the best donations for a specific NGO within a 15km radius
 * Uses MongoDB aggregation for efficient geospatial calculations
 * Prioritizes donations by:
 * 1. Distance (closer is better)
 * 2. Perishability (high perishability gets priority)
 * 3. Storage facility match
 * 
 * @param {string} ngoId - The ID of the NGO user
 * @returns {Promise<Array>} Array of matched donations with suitability scores
 */
export const findBestDonationsForNGO = async (ngoId) => {
    try {
        const ngo = await User.findById(ngoId);
        if (!ngo || ngo.role !== 'ngo') {
            throw new Error('NGO not found or invalid role');
        }

        if (!ngo.coordinates || !ngo.coordinates.lat || !ngo.coordinates.lng) {
            throw new Error('NGO coordinates not set');
        }

        const [lng, lat] = [ngo.coordinates.lng, ngo.coordinates.lat];

        // Build storage facilities filter
        let storageFilter = {};
        if (ngo.ngoProfile && ngo.ngoProfile.storageFacilities && ngo.ngoProfile.storageFacilities.length > 0) {
            storageFilter = {
                $or: [
                    { storageReq: null },
                    { storageReq: { $in: ngo.ngoProfile.storageFacilities } },
                ],
            };
        } else {
            // If NGO has NO storage facilities listed, can they take anything?
            // Usually NGOs specify what they CAN handle. If empty, maybe only 'dry' or nothing.
            // Requirement says: "Filter: Ensure the NGO has the required storageFacilities"
            // Let's assume they can only take what matches or if donation has no requirement.
            storageFilter = { storageReq: { $exists: false } };
        }

        // Use MongoDB aggregation pipeline for efficient geospatial calculations
        const pipeline = [
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [lng, lat],
                    },
                    distanceField: 'distance',
                    maxDistance: 15000, // 15km in meters
                    spherical: true,
                    query: {
                        status: 'active',
                        ...storageFilter,
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'donor',
                    foreignField: '_id',
                    as: 'donorInfo',
                },
            },
            {
                $unwind: {
                    path: '$donorInfo',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    foodType: 1,
                    quantity: 1,
                    expiryDate: 1,
                    perishability: 1,
                    pickupWindow: 1,
                    pickupAddress: 1,
                    coordinates: 1,
                    allergens: 1,
                    dietaryTags: 1,
                    storageReq: 1,
                    distance: 1,
                    'donorInfo.name': 1,
                    'donorInfo.organization': 1,
                    createdAt: 1,
                },
            },
        ];

        const donations = await Donation.aggregate(pipeline);
        const unmetNeed = await getUnmetNeed(ngoId);

        // Calculate suitability scores for each donation
        const scoredDonations = donations.map((donation) => {
            const suitabilityScore = calculateSuitabilityScore(donation, ngo, donation.distance, unmetNeed);

            return {
                ...donation,
                suitabilityScore,
                matchPercentage: suitabilityScore,
            };
        });

        // Sort by suitability score in descending order
        scoredDonations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

        return scoredDonations;
    } catch (error) {
        console.error('Error finding best donations for NGO:', error);
        throw error;
    }
};

/**
 * Get unmet need for an NGO for a specific day
 * Unmet Need = dailyCapacity - sum of claimed but not delivered donations
 * 
 * @param {string} ngoId - The ID of the NGO
 * @returns {Promise<number>} Unmet need in units
 */
export const getUnmetNeed = async (ngoId) => {
    try {
        const ngo = await User.findById(ngoId);
        if (!ngo) {
            throw new Error('NGO not found');
        }

        const dailyCapacity = ngo.ngoProfile?.dailyCapacity || 0;

        // Get total quantity of claimed but not delivered donations for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const result = await Donation.aggregate([
            {
                $match: {
                    claimedBy: new mongoose.Types.ObjectId(ngoId),
                    status: { $in: ['assigned', 'picked_up', 'picked-up', 'in-transit', 'arrived'] }, // More robust status check
                    createdAt: { $gte: today, $lt: tomorrow },
                },
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
        ]);

        const claimedCount = result.length > 0 ? result[0].totalCount : 0;
        const unmetNeed = Math.max(0, dailyCapacity - claimedCount);

        return unmetNeed;
    } catch (error) {
        console.error('Error calculating unmet need:', error);
        throw error;
    }
};
