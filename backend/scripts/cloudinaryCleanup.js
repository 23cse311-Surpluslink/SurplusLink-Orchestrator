import { cloudinary } from '../config/cloudinary.js';
import Donation from '../models/Donation.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const cleanupCloudinary = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        console.log('Fetching all images from Cloudinary (folder: surplus-link-verifications)...');

        // This only gets 1000 resources by default. For a larger scale, use pagination.
        const { resources } = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'surplus-link-verifications/',
            max_results: 500
        });

        console.log(`Found ${resources.length} images in Cloudinary.`);

        const allDonations = await Donation.find({}, 'photos pickupPhoto deliveryPhoto');

        // Collect all used URLs in DB
        const usedUrls = new Set();
        allDonations.forEach(donation => {
            if (donation.photos) donation.photos.forEach(p => usedUrls.add(p));
            if (donation.pickupPhoto) usedUrls.add(donation.pickupPhoto);
            if (donation.deliveryPhoto) usedUrls.add(donation.deliveryPhoto);
        });

        const orphanedPublicIds = [];

        for (const resource of resources) {
            // Cloudinary's secure_url or url might match our DB entries
            if (!usedUrls.has(resource.secure_url) && !usedUrls.has(resource.url)) {
                orphanedPublicIds.push(resource.public_id);
            }
        }

        if (orphanedPublicIds.length > 0) {
            console.log(`Deleting ${orphanedPublicIds.length} orphaned images...`);
            // Cloudinary limits delete to 100 at a time
            for (let i = 0; i < orphanedPublicIds.length; i += 100) {
                const chunk = orphanedPublicIds.slice(i, i + 100);
                await cloudinary.api.delete_resources(chunk);
            }
            console.log('Cleanup complete.');
        } else {
            console.log('No orphaned images found.');
        }

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

cleanupCloudinary();
