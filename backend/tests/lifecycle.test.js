import request from 'supertest';
import { jest } from '@jest/globals';
import User from '../models/User.model.js';
import Donation from '../models/Donation.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

// Mock Cloudinary to avoid real uploads and prevent middleware errors
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

describe('Donation Lifecycle Integration Tests', () => {
    let app;
    let donorToken, ngoToken, volunteerToken;
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

        // Setup Actors
        await request(app).post('/api/v1/auth/signup').send({
            name: 'Donor', email: 'donor@test.com', password: 'password123', role: 'donor', organization: 'Farm'
        });
        const donorL = await request(app).post('/api/v1/auth/login').send({ email: 'donor@test.com', password: 'password123' });
        donorToken = donorL.headers['set-cookie'][0].split(';')[0];

        await request(app).post('/api/v1/auth/signup').send({
            name: 'NGO', email: 'ngo@test.com', password: 'password123', role: 'ngo', organization: 'FoodBank'
        });
        const ngoL = await request(app).post('/api/v1/auth/login').send({ email: 'ngo@test.com', password: 'password123' });
        ngoToken = ngoL.headers['set-cookie'][0].split(';')[0];

        await request(app).post('/api/v1/auth/signup').send({
            name: 'Volunteer', email: 'vol@test.com', password: 'password123', role: 'volunteer', volunteerProfile: { vehicleType: 'car' }
        });
        const volL = await request(app).post('/api/v1/auth/login').send({ email: 'vol@test.com', password: 'password123' });
        volunteerToken = volL.headers['set-cookie'][0].split(';')[0];

        // Ensure actors are active
        await User.updateMany({}, { status: 'active' });
        await User.findOneAndUpdate({ email: 'vol@test.com' }, { isOnline: true });
    });

    it('should follow the full lifecycle in strict order: active -> assigned -> picked_up -> delivered -> completed', async () => {
        // 1. Create Donation (active)
        const createRes = await request(app)
            .post('/api/v1/donations')
            .set('Cookie', [donorToken])
            .send({
                title: 'Life Saving Food',
                description: 'Essentials',
                foodType: 'Dry Goods',
                quantity: '20kg',
                expiryDate: new Date(Date.now() + 86400000).toISOString(),
                perishability: 'low',
                pickupWindow: {
                    start: new Date(Date.now() + 3600000).toISOString(),
                    end: new Date(Date.now() + 7200000).toISOString()
                },
                pickupAddress: 'Sector 5',
                coordinates: { coordinates: [0, 0] }
            });

        donationId = createRes.body.id || createRes.body._id;
        expect(createRes.status).toBe(201);
        expect(createRes.body.status).toBe('active');

        // PREVENT: Cannot pick up before assigned
        const earlyPickup = await request(app)
            .patch(`/api/v1/donations/${donationId}/pickup`)
            .set('Cookie', [volunteerToken]);
        // Updated expectation: 401 because volunteer is not assigned yet
        expect(earlyPickup.status).toBe(401);

        // 2. NGO Claims (assigned)
        const claimRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/claim`)
            .set('Cookie', [ngoToken]);
        expect(claimRes.status).toBe(200);
        expect(claimRes.body.status).toBe('assigned');

        // 3. Volunteer Accepts Mission
        const acceptRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/accept-mission`)
            .set('Cookie', [volunteerToken]);
        expect(acceptRes.status).toBe(200);
        expect(acceptRes.body.deliveryStatus).toBe('pending_pickup');

        // 4. Pickup Confirmation (picked_up)
        const pickupRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/pickup`)
            .set('Cookie', [volunteerToken])
            .attach('photo', Buffer.from('mocking'), 'proof.jpg');
        expect(pickupRes.status).toBe(200);
        expect(pickupRes.body.deliveryStatus).toBe('picked_up');

        // 5. Delivery Confirmation (delivered)
        const deliverRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/deliver`)
            .set('Cookie', [volunteerToken])
            .field('notes', 'Delivered at back door')
            .attach('photo', Buffer.from('mocking'), 'delivered.jpg');
        expect(deliverRes.status).toBe(200);
        expect(deliverRes.body.deliveryStatus).toBe('delivered');
        expect(deliverRes.body.status).toBe('assigned'); // Still assigned until verified

        // 6. Final Completion (completed)
        const completeRes = await request(app)
            .patch(`/api/v1/donations/${donationId}/complete`)
            .set('Cookie', [ngoToken])
            .send({ rating: 5, comment: 'Great job!' });

        expect(completeRes.status).toBe(200);
        expect(completeRes.body.status).toBe('completed');
    });

    it('should reject invalid state jumps (e.g., active direct to delivered)', async () => {
        const createRes = await request(app)
            .post('/api/v1/donations')
            .set('Cookie', [donorToken])
            .send({
                title: 'Jump Test',
                description: 'Short Lived',
                foodType: 'Dry Goods',
                quantity: '10kg',
                expiryDate: new Date(Date.now() + 86400000).toISOString(),
                perishability: 'low',
                pickupWindow: {
                    start: new Date(Date.now() + 3600000).toISOString(),
                    end: new Date(Date.now() + 7200000).toISOString()
                },
                pickupAddress: 'Sector 7',
                coordinates: { coordinates: [0, 0] }
            });
        const id = createRes.body.id || createRes.body._id;

        // Try to deliver immediately - expect 401 because unassigned
        const res = await request(app)
            .patch(`/api/v1/donations/${id}/deliver`)
            .set('Cookie', [volunteerToken])
            .attach('photo', Buffer.from('mocking'), 'delivered.jpg');

        expect(res.status).toBe(401);
    });
});
