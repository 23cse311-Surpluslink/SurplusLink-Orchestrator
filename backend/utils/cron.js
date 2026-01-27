import cron from 'node-cron';
import https from 'https';

const setupCronJobs = () => {
    // Schedule a job to run every 14 minutes
    cron.schedule('*/14 * * * *', () => {
        console.log('Running a task every 14 minutes');
        
        const backendUrl = process.env.RENDER_EXTERNAL_URL; // Render provides this URL
        if (!backendUrl) {
            console.log('Backend URL not found to ping');
            return;
        }

        https.get(backendUrl, (res) => {
            if (res.statusCode === 200) {
                console.log('Server pinged successfully');
            } else {
                console.error(`Failed to ping server: ${res.statusCode}`);
            }
        }).on('error', (e) => {
            console.error(`Error pinging server: ${e.message}`);
        });
    });
};

export default setupCronJobs;
