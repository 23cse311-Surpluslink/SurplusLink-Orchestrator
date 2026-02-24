import express from 'express';
import {
    getPendingUsers,
    verifyUser,
    manageSafetyRule,
    getSafetyRules,
} from '../controllers/admin.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';

const adminRouter = express.Router();

adminRouter.use(protect);
adminRouter.use(roleBasedAccess(['admin']));

adminRouter.get('/pending-users', getPendingUsers);
adminRouter.post('/verify-user', verifyUser);
adminRouter.post('/safety-rules', manageSafetyRule);
adminRouter.get('/safety-rules', getSafetyRules);

export default adminRouter;
