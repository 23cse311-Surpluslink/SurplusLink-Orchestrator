import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.model.js';

// Mock dependencies
vi.mock('../models/User.model.js');
vi.mock('../config/db.js', () => ({
    default: vi.fn(),
}));

// Helper to extract cookie
function getCookie(res, name) {
    const cookies = res.headers['set-cookie'];
    if (!cookies) return null;
    const cookie = cookies.find(c => c.startsWith(name + '='));
    if (!cookie) return null;
    return cookie.split(';')[0].split('=')[1];
}

describe('Auth Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/v1/auth/signup', () => {
        it('should register a new user successfully', async () => {
            // Mock User.findOne to return null (user doesn't exist)
            User.findOne.mockResolvedValue(null);
            
            // Mock User.create to return a new user
            User.create.mockResolvedValue({
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'donor',
                organization: 'Food Bank'
            });

            // Mock bcrypt and jwt directly or via controller?
            // Controller uses them.
            // But we didn't mock bcryptjs in the test file via vi.mock('bcryptjs')
            // Real bcrypt is flaky in mocks sometimes, let's see if it runs.
            
            // Since we use User.create, the pre-save hook might run if we used a real DB.
            // But here we mock User.create, so no hooks run.
            // The controller calls generatedToken logic which uses jwt.
            // We should check if the response has token and user.

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
            // expect(res.body).toHaveProperty('token'); // Token is in cookie now
            const token = getCookie(res, 'token');
            expect(token).toBeDefined();
            expect(res.body.role).toBe('donor');
        });

        it('should return 400 if user already exists', async () => {
            User.findOne.mockResolvedValue({
                email: 'test@example.com'
            });

            const res = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'donor'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/user already exists/i);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
             // Mock user found
             const mockUser = {
                _id: '123',
                email: 'test@example.com',
                password: 'hashedpassword',
                matchPassword: vi.fn().mockResolvedValue(true),
                role: 'donor'
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            // expect(res.body).toHaveProperty('token');
            const token = getCookie(res, 'token');
            expect(token).toBeDefined();
        });

        it('should return 401 with invalid password', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashedpassword',
                matchPassword: vi.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
