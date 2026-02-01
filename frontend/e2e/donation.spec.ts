import { test, expect } from '@playwright/test';

test.describe('Donation Lifecycle', () => {
    test('Donor posts food, NGO claims and verifies it', async ({ page, context }) => {
        // Mock Geolocation
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });

        // 1. Login as Donor
        await page.goto('/login');
        await page.getByRole('tab', { name: 'Sign In' }).click();
        await page.getByPlaceholder('you@example.com').fill('donor@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL(/\/donor/);

        // 2. Post Donation
        await page.getByRole('link', { name: 'Post Donation' }).first().click();
        await page.getByLabel(/title/i).fill('Fresh Apples');

        // Select Food Type
        await page.getByRole('combobox').first().click();
        await page.getByRole('option', { name: 'Fresh Produce' }).click();

        await page.getByPlaceholder(/e.g., 5kg/i).fill('10kg');

        // Select Category
        await page.getByText(/select category/i).click();
        await page.getByRole('option', { name: 'Raw Ingredients' }).click();

        // Select Storage
        await page.getByText(/storage needs/i).click();
        await page.getByRole('option', { name: 'Dry / Room Temp' }).click();

        await page.getByPlaceholder(/provide more details/i).fill('Freshly harvested organic apples.');

        // Date/Time
        const today = new Date().toISOString().split('T')[0];
        await page.getByLabel(/expiry date/i).fill(today);
        await page.getByLabel(/expiry time/i).fill('23:59');
        await page.getByLabel(/start time/i).fill('09:00');
        await page.getByLabel(/end time/i).fill('18:00');
        await page.getByPlaceholder(/pickup address/i).fill('123 Test Street, Bangalore');

        await page.getByRole('button', { name: 'Publish Donation' }).click();

        await expect(page.getByText(/Donation Posted/i)).toBeVisible();

        // 3. Logout (Simulated for speed)
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.goto('/login');

        // 4. Login as NGO
        await page.getByRole('tab', { name: 'Sign In' }).click();
        await page.getByPlaceholder('you@example.com').fill('ngo@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL(/\/ngo/);

        // 5. Claim Donation
        await page.goto('/ngo/nearby');
        await expect(page.getByText('Fresh Apples')).toBeVisible();
        await page.getByRole('button', { name: 'Claim' }).first().click();

        // 6. Verify Claimed
        await expect(page.getByText(/Donation Secured/i)).toBeVisible();
    });
});
