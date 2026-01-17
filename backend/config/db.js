import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error('---------------------------------------------------');
        console.error('NOT CONNECTED: check your MONGODB_URI in backend/.env');
        console.error('Current URI:', process.env.MONGODB_URI);
        console.error('---------------------------------------------------');
        process.exit(1);
    }
};

export default connectDB;
