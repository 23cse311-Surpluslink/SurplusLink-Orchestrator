import cron from 'node-cron';
import https from 'https';
import Donation from '../models/Donation.model.js';
import User from '../models/User.model.js';
import { findSuitableVolunteers } from '../services/matching.service.js';
import { reassignMission } from '../controllers/donation.controller.js';
import { createNotification } from './notification.js';

/**
 * @desc    Initialize Background Service Supervisor
 * @description Orchestrates system-wide health checks, logistics automation, and automated mission management.
 */
const setupCronJobs = () => {
    /**
     * Keep-alive Heartbeat
     * Frequency: Every 14 minutes (Optimized for Render/Heroku spin-down prevention)
     */
    cron.schedule('*/14 * * * *', () => {
        const backendUrl = process.env.RENDER_EXTERNAL_URL;
        if (backendUrl) {
            https.get(backendUrl, (res) => {
                console.log(`[Heartbeat] Ping successful: ${res.statusCode}`);
            }).on('error', (e) => {
                console.error(`[Heartbeat] Ping failed: ${e.message}`);
            });
        }
    });

    /**
     * Mission Safety Supervisor
     * Frequency: Every 5 minutes
     * Logic: Auto-unassigns volunteers who are inactive (15m+) or overdue (20m+ beyond ETA).
     */
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] System Supervisor: Checking for stalled missions...');
        try {
            const now = new Date();
            const fifteenMinsAgo = new Date(now.getTime() - 15 * 60000);
            const etaThreshold = 20 * 60000; // 20 minutes allowance

            const activeMissions = await Donation.find({
                status: 'assigned',
                deliveryStatus: { $nin: ['idle', 'delivered'] },
                volunteer: { $exists: true }
            }).populate('volunteer');

            for (const mission of activeMissions) {
                const vol = mission.volunteer;
                if (!vol) continue;

                const lastHeartbeat = vol.volunteerProfile?.lastLocationUpdate || vol.updatedAt;
                const isHeartbeatStalled = lastHeartbeat < fifteenMinsAgo;
                const isETAExceeded = mission.estimatedArrivalAt &&
                    (now.getTime() > new Date(mission.estimatedArrivalAt).getTime() + etaThreshold);

                if (isHeartbeatStalled || isETAExceeded) {
                    const reason = isHeartbeatStalled ? 'Heartbeat Timeout (Inactivity)' : 'ETA Violation (Overdue)';
                    console.log(`[Supervisor] Flagging mission ${mission._id} for reassignment: ${reason}`);
                    await reassignMission(mission._id, `System Supervisor: ${reason}`);
                }
            }
        } catch (error) {
            console.error('[Supervisor] Error in health checks:', error);
        }
    });

    /**
     * Automatic Expiration Watchdog
     * Frequency: Every 15 minutes
     * Logic: Marks donations as 'expired' if the current time exceeds expiryDate.
     */
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

    /**
     * Tiered Dispatch Expansion Engine
     * Frequency: Every 2 minutes
     * Logic: Expands radius to 20km for donations unclaimed for > 5 minutes.
     */
    cron.schedule('*/2 * * * *', async () => {
        console.log('[Cron] Checking for mission radius expansion...');
        try {
            const now = new Date();
            const fiveMinsAgo = new Date(now.getTime() - 5 * 60000);

            const stuckMissions = await Donation.find({
                status: 'assigned',
                deliveryStatus: 'idle',
                claimedAt: { $lt: fiveMinsAgo },
            });

            for (const donation of stuckMissions) {
                console.log(`[Cron] Expanding radius for donation ${donation._id}`);
                const expandedVolunteers = await findSuitableVolunteers(donation, 20000);

                if (expandedVolunteers.length > 0) {
                    const top3 = expandedVolunteers.slice(0, 3);
                    donation.dispatchedTo = top3.map(v => v._id);
                    donation.dispatchedAt = new Date();
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
