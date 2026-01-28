import express from 'express';
import {
    createDonation,
    getDonorHistory,
    getDonorStats,
    cancelDonation,
    getDonationById,
    completeDonation,
    getSmartFeed,
    claimDonation,
    rejectDonation,
} from '../controllers/donation.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// NGO specific routes
router.get('/feed', roleBasedAccess(['ngo']), getSmartFeed);
router.patch('/:id/claim', roleBasedAccess(['ngo']), claimDonation);
router.patch('/:id/reject', roleBasedAccess(['ngo']), rejectDonation);

// Donor specific routes
router.post('/', roleBasedAccess(['donor']), upload.array('photos', 5), createDonation);
router.get('/my-donations', roleBasedAccess(['donor']), getDonorHistory);
router.get('/stats', roleBasedAccess(['donor']), getDonorStats);
router.patch('/:id/cancel', roleBasedAccess(['donor']), cancelDonation);

// General donation routes
router.get('/:id', getDonationById);
router.patch('/:id/complete', completeDonation);

export default router;
