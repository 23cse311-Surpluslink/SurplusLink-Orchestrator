import request from 'supertest';
import { jest } from '@jest/globals';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Routing & Pathfinding Integration Tests', () => {
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

        // 1. Setup Donor
        const donor = await User.create({
            name: 'Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Donor Org',
            isVerified: true
        });
        donorId = donor._id;

        // 2. Setup NGO
        const ngo = await User.create({
            name: 'NGO',
            email: 'ngo@test.com',
            password: 'password123',
            role: 'ngo',
            organization: 'NGO Org',
            location: { type: 'Point', coordinates: [100.1, 20.1] },
            isVerified: true
        });
        ngoId = ngo._id;

        // 3. Setup Volunteer
        const volunteer = await User.create({
            name: 'Volunteer',
            email: 'vol@test.com',
            password: 'password123',
            role: 'volunteer',
            isOnline: true,
            isVerified: true,
            volunteerProfile: {
                currentLocation: { type: 'Point', coordinates: [100.0, 20.0] }
            }
        });
        volunteerId = volunteer._id;

        const loginRes = await request(app).post('/api/v1/auth/login').send({
            email: 'vol@test.com',
            password: 'password123'
        });
        volunteerToken = loginRes.headers['set-cookie'][0];

        // 4. Create Donation
        const donation = await Donation.create({
            title: 'Food Donation',
            description: 'Fresh vegetables',
            foodType: 'Produce',
            perishability: 'high',
            donor: donorId,
            coordinates: { type: 'Point', coordinates: [100.05, 20.05] },
            pickupAddress: 'Pickup Point',
            quantity: '10kg',
            expiryDate: new Date(Date.now() + 3600000 * 5),
            pickupWindow: {
                start: new Date(),
                end: new Date(Date.now() + 3600000)
            },
            status: 'assigned',
            claimedBy: ngoId,
            deliveryStatus: 'idle'
        });
        donationId = donation._id;
    });

    it('should calculate an optimized route for an active mission', async () => {
        const res = await request(app)
            .get(`/api/v1/donations/${donationId}/optimized-route`)
            .set('Cookie', [volunteerToken]);

        expect(res.statusCode).toBe(200);
        expect(res.body.path).toHaveLength(2); // Pickup and Drop-off
        expect(res.body.path[0].id).toBe('pickup');
        expect(res.body.path[1].id).toBe('dropoff');
        expect(res.body.estimatedTotalTime).toBeDefined();
    });

    it('should suggest a diversion for a high-priority nearby donation', async () => {
        // Create a high-priority donation dying soon nearby
        await Donation.create({
            title: 'URGENT FOOD',
            description: 'Cooked meals',
            foodType: 'Prepared',
            perishability: 'high',
            donor: donorId,
            coordinates: { type: 'Point', coordinates: [100.01, 20.01] }, // Very close to volunteer [100, 20]
            pickupAddress: 'Urgent Pickup',
            quantity: '5kg',
            expiryDate: new Date(Date.now() + 15 * 60000), // Exiring in 15 mins!
            pickupWindow: { start: new Date(), end: new Date() },
            status: 'assigned',
            deliveryStatus: 'idle'
        });

        const res = await request(app)
            .get(`/api/v1/donations/${donationId}/optimized-route`)
            .set('Cookie', [volunteerToken]);

        expect(res.statusCode).toBe(200);
        expect(res.body.diversionSuggested).toBe(true);
        expect(res.body.path).toHaveLength(3); // 2 originals + 1 diversion
        // Dijkstra (Greedy) should pick the diversion first as it's closer and high priority
        expect(res.body.path[0].id).toMatch(/diversion/);
    });

    it('should handle missing volunteer location with 400', async () => {
        await User.findByIdAndUpdate(volunteerId, { 'volunteerProfile.currentLocation.coordinates': [0, 0] });

        const res = await request(app)
            .get(`/api/v1/donations/${donationId}/optimized-route`)
            .set('Cookie', [volunteerToken]);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/location not available/i);
    });
});
