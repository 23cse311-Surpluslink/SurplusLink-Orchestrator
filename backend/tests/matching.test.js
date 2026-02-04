import request from 'supertest';
import { jest } from '@jest/globals';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

// Mock Cloudinary
jest.unstable_mockModule('../config/cloudinary.js', () => ({
    __esModule: true,
    default: {
        single: () => (req, res, next) => {
            req.file = { path: 'https://mock-cloudinary-url.com/proof.jpg' };
            next();
        },
        array: () => (req, res, next) => {
            req.files = [];
            next();
        }
    }
}));

// Mock Geocoder to prevent overwriting test coordinates
jest.unstable_mockModule('../utils/geocoder.js', () => ({
    __esModule: true,
    geocodeAddress: jest.fn().mockResolvedValue(null) // Return null so controller uses provided coordinates
}));

describe('Intelligent Dispatch - Matching Algorithm Tests', () => {
    let app;
    let ngoToken, donorToken;
    let donationId;

    beforeAll(async () => {
        app = (await import('../server.js')).default;
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });

    afterAll(async () => {
        await disconnect();
    });

    beforeEach(async () => {
        await clearDatabase();

        // 1. Setup Donor & NGO
        await request(app).post('/api/v1/auth/signup').send({
            name: 'Donor', email: 'donor@test.com', password: 'password123', role: 'donor', organization: 'Farm'
        });
        const donorLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'donor@test.com', password: 'password123'
        });
        donorToken = donorLogin.headers['set-cookie'][0].split(';')[0];

        await request(app).post('/api/v1/auth/signup').send({
            name: 'NGO', email: 'ngo@test.com', password: 'password123', role: 'ngo', organization: 'FoodBank'
        });
        const ngoLogin = await request(app).post('/api/v1/auth/login').send({
            email: 'ngo@test.com', password: 'password123'
        });
        ngoToken = ngoLogin.headers['set-cookie'][0].split(';')[0];

        // 2. Create a Donation at [0, 0]
        const donationRes = await request(app)
            .post('/api/v1/donations')
            .set('Cookie', [donorToken])
            .send({
                title: 'Heaps of Carrots',
                description: 'Freshly harvested',
                foodType: 'Vegetables',
                quantity: '50kg',
                expiryDate: new Date(Date.now() + 86400000).toISOString(),
                perishability: 'medium',
                pickupWindow: {
                    start: new Date(Date.now() + 3600000).toISOString(),
                    end: new Date(Date.now() + 7200000).toISOString()
                },
                pickupAddress: 'Center Point',
                coordinates: { coordinates: [0, 0] }
            });

        donationId = donationRes.body.id || donationRes.body._id;
    });

    it('should rank the closest and most capable volunteer at #1', async () => {
        // Vol 1: Ideal (Close & High Capacity)
        await User.create({
            name: 'Ideal Volunteer', email: 'ideal@test.com', password: 'password123', role: 'volunteer', isOnline: true, status: 'active',
            volunteerProfile: {
                currentLocation: { type: 'Point', coordinates: [0.005, 0.005] }, // ~0.7km
                maxWeight: 100,
                vehicleType: 'van',
                tier: 'champion'
            }
        });

        // Vol 2: Within Radius but Further
        await User.create({
            name: 'Far Volunteer', email: 'far@test.com', password: 'password123', role: 'volunteer', isOnline: true, status: 'active',
            volunteerProfile: {
                currentLocation: { type: 'Point', coordinates: [0.05, 0.05] }, // ~7.8km
                maxWeight: 100,
                vehicleType: 'car',
                tier: 'hero'
            }
        });

        // Vol 3: Close but Low Capacity
        await User.create({
            name: 'Weak Volunteer', email: 'weak@test.com', password: 'password123', role: 'volunteer', isOnline: true, status: 'active',
            volunteerProfile: {
                currentLocation: { type: 'Point', coordinates: [0.01, 0.01] }, // ~1.5km
                maxWeight: 5,
                vehicleType: 'bicycle',
                tier: 'rookie'
            }
        });

        const res = await request(app)
            .get(`/api/v1/donations/${donationId}/potential-volunteers`)
            .set('Cookie', [ngoToken]);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(3);

        // Assert Vol 1 (Ideal) is #1
        expect(res.body[0].name).toBe('Ideal Volunteer');
    });

    it('should return an empty list if no volunteers are online', async () => {
        // Create an offline volunteer
        await User.create({
            name: 'Offline Volunteer', email: 'off@test.com', password: 'password123', role: 'volunteer', isOnline: false, status: 'active',
            volunteerProfile: { currentLocation: { type: 'Point', coordinates: [0, 0] }, maxWeight: 100 }
        });

        const res = await request(app)
            .get(`/api/v1/donations/${donationId}/potential-volunteers`)
            .set('Cookie', [ngoToken]);

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(0);
    });
});
