import express from 'express';
import { getDonationReport } from '../controllers/report.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/donations', protect, roleBasedAccess(['admin', 'donor']), getDonationReport);

export default router;
