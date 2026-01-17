import express from 'express';
import {
    registerUser,
    loginUser,
    getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.flatten ? express.Router() : new express.Router();
// Note: express.flatten check is unnecessary standard express, removing it to be standard.
// Just using standard Router.

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', protect, getMe);

export default authRouter;
