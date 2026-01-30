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
    getClaimedDonations,
    getAvailableMissions,
    acceptMission,
    updateDeliveryStatus,
    confirmPickup,
    confirmDelivery,
    failMission,
    getVolunteerHistory,
    getAdminActiveMissions,
} from '../controllers/donation.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin Routes
router.get('/admin/active-missions', roleBasedAccess(['admin']), getAdminActiveMissions);

// NGO specific routes
router.get('/feed', roleBasedAccess(['ngo']), getSmartFeed);
router.get('/claimed', roleBasedAccess(['ngo']), getClaimedDonations);
router.patch('/:id/claim', roleBasedAccess(['ngo']), claimDonation);
router.patch('/:id/reject', roleBasedAccess(['ngo']), rejectDonation);
router.get('/available-missions', roleBasedAccess(['volunteer']), getAvailableMissions);
router.get('/volunteer/history', roleBasedAccess(['volunteer']), getVolunteerHistory);
router.patch('/:id/accept-mission', roleBasedAccess(['volunteer']), acceptMission);
router.patch('/:id/pickup', roleBasedAccess(['volunteer']), confirmPickup);
router.patch('/:id/deliver', roleBasedAccess(['volunteer']), confirmDelivery);
router.patch('/:id/delivery-status', roleBasedAccess(['volunteer']), updateDeliveryStatus);
router.patch('/:id/fail-mission', roleBasedAccess(['volunteer']), failMission);

// Donor specific routes
router.post('/', roleBasedAccess(['donor']), upload.array('photos', 5), createDonation);
router.get('/my-donations', roleBasedAccess(['donor']), getDonorHistory);
router.get('/stats', roleBasedAccess(['donor']), getDonorStats);
router.patch('/:id/cancel', roleBasedAccess(['donor']), cancelDonation);

// General donation routes
router.get('/:id', getDonationById);
router.patch('/:id/complete', completeDonation);

export default router;
