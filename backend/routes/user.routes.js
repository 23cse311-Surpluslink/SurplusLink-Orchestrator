import express from 'express';
import {
    getUserProfile,
    verifyUser,
    updateUserProfile,
    submitVerification,
    getUsers,
    getPendingVerifications,
} from '../controllers/user.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const userRouter = express.Router();

userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/profile', protect, updateUserProfile);
userRouter.put('/verify-documents', protect, upload.single('verificationDoc'), submitVerification);
userRouter.patch('/verify', protect, roleBasedAccess(['admin']), verifyUser);
userRouter.get('/admin/users', protect, roleBasedAccess(['admin']), getUsers);
userRouter.get('/admin/pending', protect, roleBasedAccess(['admin']), getPendingVerifications);

export default userRouter;
