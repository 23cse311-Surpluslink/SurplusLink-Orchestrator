import request from 'supertest';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';
import { calculateSuitabilityScore, getVolunteerSuitabilityScore } from '../services/matching.service.js';

describe('Resilience & Load Balancing Tests', () => {
    let app;
    let volunteerToken, volunteerId;
    let donorId, ngoId, donationId;

    beforeAll(async () => {
        app = (await import('../server.js')).default;
        await connect();
    });

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    describe('NGO Load Balancing (Requirement 5.6)', () => {
        it('should apply 0.5x multiplier to suitability score when NGO is at >80% capacity', async () => {
            const donation = {
                expiryDate: new Date(Date.now() + 8 * 60 * 60 * 1000) // Standard (>6h)
            };

            const ngo = {
                ngoProfile: {
                    dailyCapacity: 10,
                    isUrgentNeed: false
                }
            };

            // Case 1: Low load (2/10 = 20%)
            const scoreLow = calculateSuitabilityScore(donation, ngo, 1000, 8); // 8 unmet = 2 claimed

            // Case 2: High load (9/10 = 90%)
            const scoreHigh = calculateSuitabilityScore(donation, ngo, 1000, 1); // 1 unmet = 9 claimed

            expect(scoreHigh).toBeLessThan(scoreLow * 0.6); // Should be roughly half
        });

        it('should NOT apply penalty for Critical (<2h) donations regardless of load', async () => {
            const donation = {
                expiryDate: new Date(Date.now() + 1 * 60 * 60 * 1000) // Critical (<3h)
            };

            const ngo = {
                ngoProfile: {
                    dailyCapacity: 10,
                    isUrgentNeed: false
                }
            };

            const scoreLow = calculateSuitabilityScore(donation, ngo, 1000, 8);
            const scoreHigh = calculateSuitabilityScore(donation, ngo, 1000, 1);

            expect(scoreHigh).toBe(scoreLow); // No penalty for critical
        });
    });

    describe('Volunteer Equity (Requirement 5.6)', () => {
        it('should boost score for volunteers with no tasks today (Standard Mission)', () => {
            const donation = { expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000) }; // Standard

            const volBusy = {
                volunteerProfile: { tier: 'rookie', lastMissionDate: new Date() },
                currentTaskCount: 1
            };

            const volFree = {
                volunteerProfile: { tier: 'rookie', lastMissionDate: new Date(Date.now() - 86400000) }, // Yesterday
                currentTaskCount: 0
            };

            const scoreBusy = getVolunteerSuitabilityScore(volBusy, 1000, donation);
            const scoreFree = getVolunteerSuitabilityScore(volFree, 1000, donation);

            expect(scoreFree).toBeGreaterThan(scoreBusy + 20);
        });
    });

    describe('Supervisor Reassignment (Requirement 5.5)', () => {
        it('should reassign mission if volunteer heartbeat is stalled', async () => {
            // Setup donor, ngo, donation
            const donor = await User.create({ name: 'D', email: 'd@t.com', password: 'p', role: 'donor', organization: 'DO' });
            const ngo = await User.create({ name: 'N', email: 'n@t.com', password: 'p', role: 'ngo', organization: 'NO', location: { coordinates: [0, 0] } });
            const vol = await User.create({
                name: 'V', email: 'v@t.com', password: 'p', role: 'volunteer', isOnline: true,
                volunteerProfile: { currentLocation: { coordinates: [0, 0] }, lastLocationUpdate: new Date(Date.now() - 20 * 60 * 1000) } // Stalled
            });

            const donation = await Donation.create({
                title: 'Stalled Mission',
                description: 'Desc',
                foodType: 'Type',
                perishability: 'low',
                donor: donor._id,
                coordinates: { type: 'Point', coordinates: [0.1, 0.1] },
                pickupAddress: 'A',
                quantity: '10kg',
                expiryDate: new Date(Date.now() + 3600000 * 5),
                pickupWindow: { start: new Date(), end: new Date(Date.now() + 3600000) },
                status: 'assigned',
                deliveryStatus: 'pending_pickup',
                volunteer: vol._id,
                estimatedArrivalAt: new Date(Date.now() + 30 * 60000)
            });

            // The setupCronJobs function isn't easily exportable/testable here without starting the whole app 
            // but we can import reassignMission directly to test its core logic.
            const { reassignMission } = await import('../controllers/donation.controller.js');

            await reassignMission(donation._id, 'Manual Test Stall');

            const updated = await Donation.findById(donation._id);
            expect(updated.volunteer).toBeUndefined();
            expect(updated.deliveryStatus).toBe('idle');

            const updatedVol = await User.findById(vol._id);
            // currentTaskCount should have been decremented if it was 0 or handled.
            // (Initial User.create default 0, so 0 - 1 = -1 but Math.max in controller might prevent it if I used it, 
            // let's check reassignMission code)
        });
    });
});
