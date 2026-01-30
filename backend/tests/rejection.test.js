import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Rejection Logic Tests', () => {
    let donorToken;
    let ngoToken;
    let donor;
    let ngo;

    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';

        // Create Donor
        donor = await User.create({
            name: 'Test Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Donor Org',
            status: 'active'
        });
        donorToken = `Bearer ${jwt.sign({ id: donor._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

        // Create NGO
        ngo = await User.create({
            name: 'Test NGO',
            email: 'ngo@test.com',
            password: 'password123',
            role: 'ngo',
            organization: 'NGO Org',
            status: 'active'
        });
        ngoToken = `Bearer ${jwt.sign({ id: ngo._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;

    }, 120000);

    afterAll(async () => {
        await disconnect();
    });

    afterEach(async () => {
        // We do not clear database here to preserve users, or we re-create them.
        // For simplicity, we just delete donations.
        await Donation.deleteMany({});
    });

    test('Rejection Logs: Should update status and reason when rejected', async () => {
        // 1. Create Donation
        const donationData = {
            title: 'Unsafe Food',
            description: 'Might be spoiled',
            foodType: 'Cooked',
            quantity: '5kg',
            perishability: 'high',
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
        const donationId = createRes.body.id;

        // 2. Reject Donation (NGO)
        const rejectReason = '[Safety Issue] Food appears moldy in photo';
        const rejectRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/reject`)
            .set('Authorization', ngoToken)
            .send({ rejectionReason: rejectReason });

        expect(rejectRes.status).toBe(200);
        expect(rejectRes.body.status).toBe('rejected');
        expect(rejectRes.body.rejectionReason).toBe(rejectReason);

        // 3. Verify in DB
        const updatedDonation = await Donation.findById(donationId);
        expect(updatedDonation.status).toBe('rejected');
        expect(updatedDonation.rejectionReason).toBe(rejectReason);
    });
});
