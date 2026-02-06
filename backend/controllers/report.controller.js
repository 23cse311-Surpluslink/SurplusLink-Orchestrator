import Donation from '../models/Donation.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Generate a detailed donation activity report with filtering
 * @route   GET /api/v1/reports/donations
 * @access  Private (Admin, Donor)
 * @description Supports multi-dimensional filtering by date range, status, and donor ID (admin only).
 */
const getDonationReport = async (req, res, next) => {
    try {
        const { startDate, endDate, status, donorId } = req.query;

        let query = {};

        // Security logic: Donors only see their own donations
        if (req.user.role === 'donor') {
            query.donor = new mongoose.Types.ObjectId(req.user.id);
        } else if (req.user.role === 'admin') {
            // Admin can filter by donorId if provided
            if (donorId) {
                query.donor = new mongoose.Types.ObjectId(donorId);
            }
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const report = await Donation.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'donor',
                    foreignField: '_id',
                    as: 'donorDetails',
                },
            },
            { $unwind: '$donorDetails' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'claimedBy',
                    foreignField: '_id',
                    as: 'ngoDetails',
                },
            },
            {
                $unwind: {
                    path: '$ngoDetails',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 0,
                    donationId: '$_id',
                    donorName: '$donorDetails.name',
                    donorOrg: '$donorDetails.organization',
                    recipientNgo: '$ngoDetails.organization',
                    foodType: 1,
                    quantity: 1,
                    status: 1,
                    expiryDate: 1,
                    pickupWindow: 1,
                    createdAt: 1,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        res.status(200).json(report);
    } catch (error) {
        next(error);
    }
};

export { getDonationReport };
