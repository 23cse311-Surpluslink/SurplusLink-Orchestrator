import express from 'express';
import { getDonationReport, getNgoUtilizationReport } from '../controllers/report.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/donations', protect, roleBasedAccess(['admin', 'donor']), getDonationReport);
router.get('/ngo-utilization', protect, roleBasedAccess(['admin', 'ngo']), getNgoUtilizationReport);

export default router;
