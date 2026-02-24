import User from '../models/User.model.js';
import SafetyRule from '../models/SafetyRule.model.js';
import VerificationLog from '../models/VerificationLog.model.js';
import Donation from '../models/Donation.model.js';

/**
 * @desc    Get all pending users for verification
 * @route   GET /api/v1/admin/pending-users
 * @access  Private/Admin
 */
export const getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ status: 'pending' }).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify/Approve a user
 * @route   POST /api/v1/admin/verify-user
 * @access  Private/Admin
 */
export const verifyUser = async (req, res, next) => {
    try {
        const { userId, status, remarks } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.status = status === 'approved' ? 'active' : 'rejected';
        user.isVerified = status === 'approved';
        await user.save();

        await VerificationLog.create({
            userId,
            adminId: req.user._id,
            status,
            remarks,
        });

        res.json({ message: `User ${status} successfully` });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Manage Safety Rules (Create/Update)
 * @route   POST /api/v1/admin/safety-rules
 * @access  Private/Admin
 */
export const manageSafetyRule = async (req, res, next) => {
    try {
        const { foodType, maxDurationHours, storageRequired } = req.body;

        const rule = await SafetyRule.findOneAndUpdate(
            { foodType },
            { maxDurationHours, storageRequired, isActive: true },
            { upsert: true, new: true }
        );

        res.json(rule);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all safety rules
 * @route   GET /api/v1/admin/safety-rules
 * @access  Private/Admin
 */
export const getSafetyRules = async (req, res, next) => {
    try {
        const rules = await SafetyRule.find();
        res.json(rules);
    } catch (error) {
        next(error);
    }
};
