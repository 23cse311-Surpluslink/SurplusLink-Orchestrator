import mongoose from 'mongoose';
import User from '../models/User.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const seedE2E = async () => {
    try {
        console.log('Connecting to MongoDB for seeding...');
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!uri) throw new Error('No MongoDB URI provided');
        await mongoose.connect(uri);
        console.log('Connected.');

        await User.deleteMany({ email: { $in: ['donor@test.com', 'ngo@test.com'] } });

        await User.create({
            name: 'Test Donor',
            email: 'donor@test.com',
            password: 'password123',
            role: 'donor',
            status: 'active',
            organization: 'Test Donor Shop'
        });

        await User.create({
            name: 'Test NGO',
            email: 'ngo@test.com',
            password: 'password123',
            role: 'ngo',
            status: 'active',
            organization: 'Test NGO Org'
        });

        console.log('E2E Test users seeded successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

seedE2E();
