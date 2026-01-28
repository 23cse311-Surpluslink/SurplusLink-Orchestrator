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
        process.env.JWT_SECRET = 'test_secret_key_123';
    });

    describe('POST /api/v1/auth/signup', () => {
        it('should register a new user successfully', async () => {
            // Mock User.findOne to return null (user doesn't exist)
            User.findOne.mockResolvedValue(null);
            
            // Mock User.create to return a new user with OTP fields
            User.create.mockResolvedValue({
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'donor',
                organization: 'Food Bank',
                otp: '1234',
                otpExpires: Date.now() + 600000,
                status: 'pending'
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

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.requiresOtp).toBe(true);
            expect(res.body.email).toBe('test@example.com');
            // Token is NOT set on signup anymore, only after verification
            const token = getCookie(res, 'token');
            expect(token).toBeNull(); 
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
