import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
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
            organization: role === 'ngo' ? organization : undefined,
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                status: user.status,
                token: generateToken(user._id, user.role),
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
// @route   POST /api/auth/login
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

            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                status: user.status,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            organization: req.user.organization,
            status: req.user.status,
            createdAt: req.user.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

export { registerUser, loginUser, getMe };
