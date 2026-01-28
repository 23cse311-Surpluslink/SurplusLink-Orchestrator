import User from '../models/User.model.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                status: user.status,
                avatar: user.avatar,
                createdAt: user.createdAt,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify organization credentials
// @route   PATCH /api/v1/users/verify
// @access  Admin
const verifyUser = async (req, res, next) => {
    const { userId, status } = req.body;

    try {
        const user = await User.findById(userId);

        if (user) {
            user.status = status || user.status;
            const updatedUser = await user.save();
            res.json({
                message: `User status updated to ${updatedUser.status}`,
                id: updatedUser.id,
                status: updatedUser.status
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.address = req.body.address || user.address;
            user.coordinates = req.body.coordinates || user.coordinates;

            if (req.file) {
                user.avatar = req.file.path;
            } else if (req.body.avatar === '') {
                // Allow clearing avatar if explicitly passed as empty string
                user.avatar = undefined;
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                organization: updatedUser.organization,
                status: updatedUser.status,
                address: updatedUser.address,
                coordinates: updatedUser.coordinates,
                avatar: updatedUser.avatar,
                createdAt: updatedUser.createdAt,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Submit verification documents
// @route   PUT /api/v1/users/verify-documents
// @access  Private
const submitVerification = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.taxId = req.body.taxId || user.taxId;
            user.permitNumber = req.body.permitNumber || user.permitNumber;
            user.address = req.body.address || user.address;

            if (req.file) {
                user.documentUrl = req.file.path;
            }

            user.status = 'pending';

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Verification documents submitted successfully',
                user: {
                    id: updatedUser.id,
                    status: updatedUser.status,
                    documentUrl: updatedUser.documentUrl
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/v1/users/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get pending verifications
// @route   GET /api/v1/users/admin/pending
// @access  Admin
const getPendingVerifications = async (req, res, next) => {
    try {
        const users = await User.find({
            status: 'pending',
            $or: [
                { taxId: { $exists: true } },
                { documentUrl: { $exists: true } }
            ]
        }).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export { getUserProfile, verifyUser, updateUserProfile, submitVerification, getUsers, getPendingVerifications };
