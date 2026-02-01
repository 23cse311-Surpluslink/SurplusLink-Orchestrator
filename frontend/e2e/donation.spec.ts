import { test, expect } from '@playwright/test';

test.describe('Donation Lifecycle', () => {
    test('Donor posts food, NGO claims and verifies it', async ({ page, context }) => {
        test.setTimeout(120000); // 2 minutes
        // Mock Geolocation
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 12.9716, longitude: 77.5946 });

        // 1. Login as Donor
        await page.goto('/login');
        await page.getByRole('tab', { name: 'Sign In' }).click();
        await page.getByPlaceholder('you@example.com').fill('donor@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await page.waitForURL(/\/donor/);
        await expect(page).toHaveURL(/\/donor/);

        // 2. Post Donation
        await page.getByRole('link', { name: 'Post Donation' }).first().click();
        await page.waitForURL(/\/donor\/post/);

        await page.getByPlaceholder(/e.g., 20 Packets/i).fill('Fresh Apples');

        // Select Food Type
        await page.getByText(/select type/i).click();
        await page.getByRole('option', { name: 'Fresh Produce' }).click();

        await page.getByPlaceholder(/e.g., 5kg/i).fill('10kg');

        // Select Category
        await page.getByText(/select category/i).click();
        await page.getByRole('option', { name: 'Raw Ingredients' }).click();

        // Select Storage
        await page.getByText(/storage needs/i).click();
        await page.getByRole('option', { name: 'Dry / Room Temp' }).click();

        await page.getByPlaceholder(/provide more details/i).fill('Freshly harvested organic apples.');

        // Date/Time - using types since labels are not technically associated in the markup
        const today = new Date().toISOString().split('T')[0];
        await page.locator('input[type="date"]').fill(today);
        await page.locator('input[type="time"]').nth(0).fill('23:59'); // Expiry
        await page.locator('input[type="time"]').nth(1).fill('09:00'); // Start
        await page.locator('input[type="time"]').nth(2).fill('18:00'); // End

        await page.getByPlaceholder(/pickup address/i).fill('123 Test Street, Bangalore');

        await page.getByRole('button', { name: 'Publish Donation' }).click();

        await expect(page.getByText(/Donation Posted/i).first()).toBeVisible({ timeout: 15000 });

        // 3. Logout (Full session clear)
        await context.clearCookies();
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // 4. Login as NGO
        await page.getByRole('tab', { name: 'Sign In' }).click();

        await page.getByPlaceholder('you@example.com').fill('ngo@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForURL(/\/ngo/);

        // 5. Claim Donation
        await page.goto('/ngo/nearby');
        await page.waitForLoadState('networkidle');

        await expect(page.getByText('Fresh Apples')).toBeVisible();
        await page.getByRole('button', { name: 'Claim' }).first().click();

        // 6. Verify Claimed
        await expect(page.getByText(/Donation Secured/i).first()).toBeVisible();
    });
});
