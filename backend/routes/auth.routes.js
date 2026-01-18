import express from 'express';
import {
    signupUser,
    loginUser,
} from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signupUser);
authRouter.post('/login', loginUser);

export default authRouter;
