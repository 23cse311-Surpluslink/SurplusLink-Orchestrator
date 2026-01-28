import express from 'express';
import {
    createDonation,
    getDonorHistory,
    getDonorStats,
    cancelDonation,
    getDonationById,
    completeDonation,
} from '../controllers/donation.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Donor specific routes
router.post('/', upload.array('photos', 5), createDonation);
router.get('/my-donations', roleBasedAccess(['donor']), getDonorHistory);
router.get('/stats', roleBasedAccess(['donor']), getDonorStats);
router.patch('/:id/cancel', roleBasedAccess(['donor']), cancelDonation);

// General donation routes (might be accessed by NGO/Volunteer too)
router.get('/:id', getDonationById);
router.patch('/:id/complete', completeDonation);

export default router;
