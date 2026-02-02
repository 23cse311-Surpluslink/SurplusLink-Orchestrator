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
    getVolunteerActiveMission,
    getAdminActiveMissions,
    getNgoStats,
    getBestNGOs,
    getOptimizedRoute,
    cancelMission,
} from '../controllers/donation.controller.js';
import { protect, roleBasedAccess } from '../middleware/auth.middleware.js';
import upload from '../config/cloudinary.js';

import { deliveryStatusLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin Routes
router.get('/admin/active-missions', roleBasedAccess(['admin']), getAdminActiveMissions);

// NGO specific routes
router.get('/feed', roleBasedAccess(['ngo']), getSmartFeed);
router.get('/claimed', roleBasedAccess(['ngo']), getClaimedDonations);
router.get('/ngo/stats', roleBasedAccess(['ngo']), getNgoStats);
router.patch('/:id/claim', roleBasedAccess(['ngo']), claimDonation);
router.patch('/:id/reject', roleBasedAccess(['ngo']), rejectDonation);

// Volunteer specific routes
router.get('/available-missions', roleBasedAccess(['volunteer']), getAvailableMissions);
router.get('/volunteer/history', roleBasedAccess(['volunteer']), getVolunteerHistory);
router.get('/active-mission', roleBasedAccess(['volunteer']), getVolunteerActiveMission);
router.patch('/:id/accept-mission', roleBasedAccess(['volunteer']), acceptMission);
router.patch('/:id/pickup', roleBasedAccess(['volunteer']), upload.single('photo'), confirmPickup);
router.patch('/:id/deliver', roleBasedAccess(['volunteer']), upload.single('photo'), confirmDelivery);
router.patch('/:id/delivery-status', roleBasedAccess(['volunteer']), deliveryStatusLimiter, updateDeliveryStatus);
router.patch('/:id/fail-mission', roleBasedAccess(['volunteer']), failMission);
router.patch('/:id/cancel-mission', roleBasedAccess(['volunteer']), cancelMission);
router.get('/:id/optimized-route', roleBasedAccess(['volunteer']), getOptimizedRoute);

// Donor specific routes
router.post('/', roleBasedAccess(['donor']), upload.array('photos', 5), createDonation);
router.get('/my-donations', roleBasedAccess(['donor']), getDonorHistory);
router.get('/stats', roleBasedAccess(['donor']), getDonorStats);
router.patch('/:id/cancel', roleBasedAccess(['donor']), cancelDonation);
router.get('/:id/best-ngos', roleBasedAccess(['donor']), getBestNGOs);

// General donation routes
router.get('/:id', getDonationById);
router.patch('/:id/complete', completeDonation);

export default router;
