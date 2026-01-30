import request from 'supertest';
import app from '../server.js';
import User from '../models/User.model.js';
import { connect, disconnect, clearDatabase } from './setup.js';

describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        await connect();
        process.env.JWT_SECRET = 'testsecret';
    });

    afterAll(async () => {
        await disconnect();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    describe('POST /api/v1/auth/signup', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'donor',
                    organization: 'Food Bank'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.email).toBe('test@example.com');
            
            // Verify User in DB
            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeTruthy();
            expect(user.role).toBe('donor');
        });

        it('should return 400 if user already exists', async () => {
            await User.create({
                name: 'Existing User',
                email: 'test@example.com',
                password: 'password123',
                role: 'donor',
                organization: 'Food Bank'
            });

            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'donor',
                    organization: 'Food Bank'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/user already exists/i);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123',
                    role: 'donor',
                    organization: 'Food Bank'
                });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie']).toBeDefined(); // Check for cookie (token)
        });

        it('should return 401 with invalid password', async () => {
            await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Login User',
                    email: 'login@example.com',
                    password: 'password123',
                    role: 'donor',
                    organization: 'Food Bank'
                });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
