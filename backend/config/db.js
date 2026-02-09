import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Index Scrubber: Drop legacy indices that block deployment
        try {
            const usersCollection = conn.connection.collection('users');
            const indexes = await usersCollection.indexes();
            const hasBadIndex = indexes.some(idx => idx.name === 'coordinates_2dsphere');
            
            if (hasBadIndex) {
                console.log('[DB] Dropping legacy coordinates_2dsphere index...');
                await usersCollection.dropIndex('coordinates_2dsphere');
                console.log('[DB] Legacy index dropped successfully.');
            }
        } catch (idxError) {
            console.warn('[DB] Index scrubber skipped/failed:', idxError.message);
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
