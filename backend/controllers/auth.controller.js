import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';

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
            organization: (role === 'ngo' || role === 'donor') ? organization : undefined,
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

export { signupUser, loginUser };
