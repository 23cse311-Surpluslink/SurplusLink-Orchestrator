import request from 'supertest';
import { jest } from '@jest/globals';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Report Analytics Integration Tests', () => {
    let app;
    let donorToken, adminToken;
    let donorId, adminId;

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
            name: 'John Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Green Farm',
            status: 'active'
        });
        donorId = donor._id;

        // 2. Setup Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'admin',
            status: 'active'
        });
        adminId = admin._id;

        // 3. Login and get tokens (simulating cookies)
        const donorLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'donor@test.com',
            password: 'password123'
        });
        donorToken = donorLogin.headers['set-cookie'][0];

        const adminLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'admin@test.com',
            password: 'password123'
        });
        adminToken = adminLogin.headers['set-cookie'][0];

        // 4. Create some donations
        await Donation.create({
            title: 'Veggie Donation',
            description: 'Fresh veggies',
            foodType: 'Vegetables',
            quantity: '10kg',
            expiryDate: new Date(),
            perishability: 'high',
            pickupWindow: { start: new Date(), end: new Date() },
            pickupAddress: 'Address 1',
            coordinates: { type: 'Point', coordinates: [0, 0] },
            donor: donorId,
            status: 'completed'
        });

        const anotherDonor = await User.create({
            name: 'Other Donor',
            email: 'other@test.com',
            password: 'password123',
            role: 'donor',
            organization: 'Other Farm',
            status: 'active'
        });

        await Donation.create({
            title: 'Fruit Donation',
            description: 'Fresh fruits',
            foodType: 'Fruits',
            quantity: '5kg',
            expiryDate: new Date(),
            perishability: 'medium',
            pickupWindow: { start: new Date(), end: new Date() },
            pickupAddress: 'Address 2',
            coordinates: { type: 'Point', coordinates: [0, 0] },
            donor: anotherDonor._id,
            status: 'active'
        });
    });

    it('should allow Admin to see all donations in the report', async () => {
        const res = await request(app)
            .get('/api/v1/reports/donations')
            .set('Cookie', [adminToken]);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('donorName');
        expect(res.body[0]).toHaveProperty('organization');
    });

    it('should only allow Donor to see their own donations', async () => {
        const res = await request(app)
            .get('/api/v1/reports/donations')
            .set('Cookie', [donorToken]);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].donorName).toBe('John Donor');
    });

    it('should filter by status', async () => {
        const res = await request(app)
            .get('/api/v1/reports/donations?status=completed')
            .set('Cookie', [adminToken]);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].status).toBe('completed');
    });

    it('should restrict access for volunteers', async () => {
        // First create a volunteer and login
        await User.create({
            name: 'Vol',
            email: 'vol@test.com',
            password: 'password123',
            role: 'volunteer',
            status: 'active'
        });

        const volLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'vol@test.com',
            password: 'password123'
        });
        const volToken = volLogin.headers['set-cookie'][0];

        const res = await request(app)
            .get('/api/v1/reports/donations')
            .set('Cookie', [volToken]);

        expect(res.statusCode).toBe(401); // Unauthorized
    });
});
