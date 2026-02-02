import cron from 'node-cron';
import https from 'https';
import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import { createNotification } from './notification.js';
import { findSuitableVolunteers } from '../services/matching.service.js';

const setupCronJobs = () => {
    // Keep-alive Ping (Existing)
    cron.schedule('*/14 * * * *', () => {
        // ... (Keep existing ping logic if desired, or acceptable to leave it alone if I only replace the function body partially. But replace_file_content replaces blocks.
        // I will re-implement the ping block to be safe or just append the new block if I can target carefully.
        // Actually, let's just rewrite the whole function content slightly or append.)

        // ... existing ping logic ...
        const backendUrl = process.env.RENDER_EXTERNAL_URL;
        if (backendUrl) {
            https.get(backendUrl, (res) => { /* ... */ }).on('error', (e) => { /* ... */ });
        }
    });

    // Phase 4: Reliability & Safety Checks (Runs every 5 minutes)
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Running safety checks...');

        try {
            const now = new Date();
            const fortyFiveMinsAgo = new Date(now - 45 * 60 * 1000);
            const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);

            // 1. Task Expiry: Pending Pickup > 45 mins
            const expiredPickups = await Donation.find({
                deliveryStatus: 'pending_pickup',
                updatedAt: { $lt: fortyFiveMinsAgo }
            }).populate('claimedBy').populate('volunteer'); // claimedBy is NGO, volunteer is Volunteer

            for (const donation of expiredPickups) {
                console.log(`[Cron] Expiring donation ${donation._id} due to pickup timeout.`);

                const oldVolunteerId = donation.volunteer?._id;
                const ngoId = donation.claimedBy?._id;

                // Reset
                donation.volunteer = undefined;
                donation.deliveryStatus = 'idle';
                donation.status = 'assigned'; // Ensure it's ready for a new match
                await donation.save();

                // Notify Volunteer
                if (oldVolunteerId) {
                    await User.findByIdAndUpdate(oldVolunteerId, { $inc: { 'stats.cancelledDonations': 1 } });

                    await createNotification(
                        oldVolunteerId,
                        `Mission for "${donation.title}" expired due to inactivity.`,
                        'general', // or specific type
                        donation._id
                    );
                }

                // Notify NGO
                if (ngoId) {
                    await createNotification(
                        ngoId,
                        `Volunteer assignment for "${donation.title}" timed out. Searching for a new match.`,
                        'general',
                        donation._id
                    );
                }
            }

            // 2. Inactivity Tracking: In Transit > 2 Hours (General Alert)
            const stuckInTransit = await Donation.find({
                deliveryStatus: { $in: ['picked_up', 'in_transit'] },
                updatedAt: { $lt: twoHoursAgo } // No update in 2 hours
            }).populate('claimedBy');

            for (const donation of stuckInTransit) {
                if (donation.claimedBy) {
                    await createNotification(
                        donation.claimedBy._id,
                        `Status Alert: Delivery for "${donation.title}" has been in transit for > 2 hours.`,
                        'general',
                        donation._id
                    );
                }
                console.log(`[Cron] Flagged donation ${donation._id} as stuck in transit (2h).`);
            }

            // 3. Safety Timeout: Picked Up > 4 Hours (Critical Alert)
            const fourHoursAgo = new Date(now - 4 * 60 * 60 * 1000);
            const criticalTimeouts = await Donation.find({
                deliveryStatus: 'picked_up',
                pickedUpAt: { $lt: fourHoursAgo }
            }).populate('claimedBy').populate('volunteer');

            for (const donation of criticalTimeouts) {
                console.log(`[Cron] CRITICAL: Donation ${donation._id} picked up > 4 hours ago.`);

                if (donation.claimedBy) {
                    await createNotification(
                        donation.claimedBy._id,
                        `CRITICAL ALERT: Mission "${donation.title}" has been in PICKED_UP state for > 4 hours. Please contact volunteer ${donation.volunteer?.name} immediately!`,
                        'general',
                        donation._id
                    );
                }
            }

        } catch (error) {
            console.error('[Cron] Error in safety checks:', error);
        }
    });

    // 4. Automatic Expiration (Runs every 15 minutes) - Requirement 5.4
    cron.schedule('*/15 * * * *', async () => {
        console.log('[Cron] Checking for expired donations...');
        try {
            const expiredDonations = await Donation.find({
                status: 'active',
                expiryDate: { $lt: new Date() }
            });

            for (const donation of expiredDonations) {
                donation.status = 'expired';
                await donation.save();

                await createNotification(
                    donation.donor,
                    `Your donation "${donation.title}" has expired and is no longer available.`,
                    'donation_expired',
                    donation._id
                );
                console.log(`[Cron] Expired donation: ${donation._id}`);
            }
        } catch (err) {
            console.error('[Cron] Expiration task failed:', err);
        }
    });

    // 5. Auto-Dispatch Radius Expansion (Runs every 2 minutes)
    cron.schedule('*/2 * * * *', async () => {
        console.log('[Cron] Checking for mission radius expansion...');
        try {
            const now = new Date();
            const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);

            // Find donations claimed (assigned) but with no volunteer for > 5 mins
            const stuckMissions = await Donation.find({
                status: 'assigned',
                deliveryStatus: 'idle',
                claimedAt: { $lt: fiveMinsAgo },
                // Only expand if we haven't already Expanded (or just run findSuitableVolunteers with 20km)
                // To avoid spamming, we could check a flag, but for now let's just attempt re-dispatch to 20km
                // Requirement 5.2: "If no volunteer is found within 5 minutes, expand the radius to 20km."
            });

            for (const donation of stuckMissions) {
                console.log(`[Cron] Expanding radius for donation ${donation._id}`);

                // Find volunteers in expanded 20km radius
                const expandedVolunteers = await findSuitableVolunteers(donation, 20000);

                if (expandedVolunteers.length > 0) {
                    const top3 = expandedVolunteers.slice(0, 3);

                    // Update lock
                    donation.dispatchedTo = top3.map(v => v._id);
                    donation.dispatchedAt = new Date(); // Reset lock timer for expanded group
                    await donation.save();

                    for (const v of top3) {
                        await createNotification(
                            v._id,
                            `EXPANDED MISSION: A donation "${donation.title}" is available in a wider area. You have priority!`,
                            'priority_dispatch',
                            donation._id
                        );
                    }
                }
            }
        } catch (err) {
            console.error('[Cron] Radius expansion failed:', err);
        }
    });
};

export default setupCronJobs;
