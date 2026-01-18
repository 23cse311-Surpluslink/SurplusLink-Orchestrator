import express from 'express';
import {
    getUserProfile,
    verifyUser,
    updateUserProfile,
    submitVerification,
} from '../controllers/user.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const userRouter = express.Router();

userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.put('/verify-documents', protect, upload.single('verificationDoc'), submitVerification);
userRouter.patch('/verify', protect, roleBasedAccess(['admin']), verifyUser);

export default userRouter;
