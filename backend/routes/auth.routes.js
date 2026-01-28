import express from 'express';
import {
    signupUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    sendOTP,
    verifyOTP,
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);
authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOTP);

export default authRouter;
