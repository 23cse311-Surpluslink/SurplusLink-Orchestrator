import express from 'express';
import {
    signupUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);

export default authRouter;
