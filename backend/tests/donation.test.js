import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server.js';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Donation Integration Tests', () => {
    let token;
    let user;

    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';

        // Create a test donor
        user = await User.create({
            name: 'Test Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Test Org',
            status: 'active'
        });

        token = `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    }, 120000);

    afterAll(async () => {
        await disconnect();
    });

    afterEach(async () => {
        await clearDatabase();
        // Re-create user since clearDatabase deletes it
        user = await User.create({
            name: 'Test Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Test Org',
            status: 'active'
        });
        token = `Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })}`;
    });

    const validDonation = {
        title: 'Fresh Bread',
        description: 'Assorted baked goods from today.',
        foodType: 'Bakery',
        quantity: '10 loaves',
        perishability: 'medium',
        pickupAddress: '123 Bakery St',
        coordinates: [77.1025, 28.7041], // [lng, lat]
        pickupWindow: {
            start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
            end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()    // 3 hours from now
        },
        expiryDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString() // 5 hours from now
    };

    test('Auth Protection: Should fail with 401 if no token provided', async () => {
        const res = await request(app)
            .post('/api/v1/donations')
            .send(validDonation);

        expect(res.status).toBe(401);
    });

    test('Safety Validation: Should fail if expiryDate is less than 2 hours from now', async () => {
        const invalidDonation = {
            ...validDonation,
            expiryDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // Only 1 hour from now
        };

        const res = await request(app)
            .post('/api/v1/donations')
            .set('Authorization', token)
            .send(invalidDonation);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/at least 2 hours/);
    });

    test('Logic Validation: Should fail if pickupWindow.end is after expiryDate', async () => {
        const invalidDonation = {
            ...validDonation,
            pickupWindow: {
                start: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
                end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString() // Ends after expiry (5h)
            }
        };

        const res = await request(app)
            .post('/api/v1/donations')
            .set('Authorization', token)
            .send(invalidDonation);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/before the food expires/);
    });

    test('Successful Creation: Should create donation with status active', async () => {
        const res = await request(app)
            .post('/api/v1/donations')
            .set('Authorization', token)
            .send(validDonation);

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('active');
        expect(res.body.title).toBe(validDonation.title);
        expect(res.body.donor).toBe(user._id.toString());
    });

    test('Cancellation: Should update status to cancelled', async () => {
        // First create a donation
        const donation = await Donation.create({
            ...validDonation,
            donor: user._id,
            coordinates: { type: 'Point', coordinates: [77.1025, 28.7041] }
        });

        const res = await request(app)
            .patch(`/api/v1/donations/${donation._id}/cancel`)
            .set('Authorization', token);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('cancelled');

        // Verify in DB
        const updatedDonation = await Donation.findById(donation._id);
        expect(updatedDonation.status).toBe('cancelled');
    });
});
