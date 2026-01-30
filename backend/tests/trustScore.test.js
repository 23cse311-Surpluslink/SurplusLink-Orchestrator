import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Trust Score Integration Tests', () => {
    let donorToken;
    let ngoToken;
    let donor;
    let ngo;

    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    }, 120000);

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();
        // Create Donor
        donor = await User.create({
            name: 'Trust Donor',
            email: 'trustdonor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Trust Org',
            status: 'active',
            stats: {
                trustScore: 4.0, // Start with 4.0
                totalRatings: 1,
                completedDonations: 1
            }
        });
        donorToken = `Bearer ${jwt.sign({ id: donor._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

        // Create NGO
        ngo = await User.create({
            name: 'Trust NGO',
            email: 'trustngo@test.com',
            password: 'password123',
            role: 'ngo',
            organization: 'NGO Org',
            status: 'active'
        });
        ngoToken = `Bearer ${jwt.sign({ id: ngo._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    });

    test('Trust Score: Should update weighted average correctly on rating', async () => {
        // 1. Create Donation
        const donationData = {
            title: 'Tasty Food',
            description: 'Good qual',
            foodType: 'Cooked',
            quantity: '10kg',
            perishability: 'medium',
            pickupAddress: 'Address',
            coordinates: [77.1, 28.7],
            pickupWindow: {
                start: new Date(Date.now() + 100000).toISOString(),
                end: new Date(Date.now() + 200000).toISOString()
            },
            expiryDate: new Date(Date.now() + 30000000).toISOString()
        };

        const createRes = await request(app)
            .post('/api/v1/donations')
            .set('Authorization', donorToken)
            .send(donationData);

        expect(createRes.status).toBe(201);
        const donationId = createRes.body._id;

        // 2. Claim Donation (NGO)
        await request(app)
            .patch(`/api/v1/donations/${donationId}/claim`)
            .set('Authorization', ngoToken);

        // 3. Complete Donation with Rating 5 (NGO)
        // Previous: Score 4.0, Count 1.
        // New Rating: 5.
        // Expected New Score: ((4.0 * 1) + 5) / 2 = 9 / 2 = 4.5.
        const completeRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/complete`)
            .set('Authorization', ngoToken) // Any user can complete? No, usually NGO. Check controller logic (it might not restrict who completes, but likely should be the claimer or NGO). Logic in controller doesn't seem to check req.user for permission explicitly in the snippet shown, but `completeDonation` implementation I saw earlier didn't check `claimedBy`, but it's protected. I'll assume it works if I send a valid token.
            .send({ rating: 5, comment: "Great job" });

        expect(completeRes.status).toBe(200);

        // 4. Verify Donor Stats
        const updatedDonor = await User.findById(donor._id);
        expect(updatedDonor.stats.trustScore).toBe(4.5);
        expect(updatedDonor.stats.totalRatings).toBe(2);
        expect(updatedDonor.stats.completedDonations).toBe(2);
    });
});
