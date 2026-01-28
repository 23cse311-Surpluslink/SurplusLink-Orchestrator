import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';

// @desc    Register a new user
// @route   POST /api/v1/auth/signup
// @access  Public
const signupUser = async (req, res, next) => {
    const { name, email, password, role, organization } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        if ((role === 'ngo' || role === 'donor') && !organization) {
            res.status(400);
            throw new Error('Organization/Business name is required for NGOs and Donors');
        }

        const validRoles = ['donor', 'ngo', 'volunteer', 'admin'];
        if (!validRoles.includes(role)) {
            res.status(400);
            throw new Error('Invalid role');
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            status: (role === 'volunteer' || role === 'admin') ? 'active' : 'pending',
            organization: (role === 'ngo' || role === 'donor') ? organization : undefined,
        });

        if (user) {
            const token = generateToken(user._id, user.role);

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Required for sameSite: 'none'
                sameSite: 'none', // Required for cross-site cookie
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.status(201).json({
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
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.status === 'deactivated') {
                res.status(401);
                throw new Error('User account is deactivated');
            }

            const token = generateToken(user._id, user.role);

            res.cookie('token', token, {
                httpOnly: true,
                secure: true, // Required for sameSite: 'none'
                sameSite: 'none', // Required for cross-site cookie
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

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
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear session
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
        });
        res.status(200).json({ success: true, message: 'Successfully logged out' });
    } catch (error) {
        next(error);
    }
};

export { signupUser, loginUser, logoutUser, forgotPassword, resetPassword };

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
async function forgotPassword(req, res, next) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404);
            throw new Error('User not found with this email');
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        res.json({
            success: true,
            message: 'Reset link generated (Simulated)',
            resetToken: resetToken
        });
    } catch (error) {
        next(error);
    }
}

// @desc    Reset Password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
async function resetPassword(req, res, next) {
    const { password } = req.body;
    const { token } = req.params;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400);
            throw new Error('Invalid or expired reset token');
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        next(error);
    }
}
