import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password, role, organizationName } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        if (role === 'NGO_PARTNER' && !organizationName) {
            res.status(400);
            throw new Error('Organization name is required for NGO Partners');
        }

        // Validate role against enum manually or rely on Mongoose validation?
        // Mongoose will validate, but we can do a quick check to be cleaner
        const validRoles = ['FOOD_DONOR', 'NGO_PARTNER', 'VOLUNTEER', 'ADMIN'];
        if (!validRoles.includes(role)) {
            res.status(400);
            throw new Error('Invalid role');
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            organizationName: role === 'NGO_PARTNER' ? organizationName : undefined,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
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
            if (!user.isActive) {
                res.status(401);
                throw new Error('User account is deactivated');
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationName: user.organizationName,
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
        const user = {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            organizationName: req.user.organizationName,
            createdAt: req.user.createdAt,
        };
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export { registerUser, loginUser, getMe };
