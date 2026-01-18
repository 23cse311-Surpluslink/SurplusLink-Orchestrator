import express from 'express';
import {
    getUserProfile,
    verifyUser,
    updateUserProfile,
} from '../controllers/user.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.patch('/verify', protect, roleBasedAccess(['admin']), verifyUser);

export default userRouter;
