import { test, expect } from '@playwright/test';

test.describe('Donation Lifecycle', () => {
    test('Donor posts food, NGO claims and verifies it', async ({ page }) => {
        // 1. Login as Donor
        await page.goto('/login');
        // Switch to the Sign In tab first
        await page.getByRole('tab', { name: 'Sign In' }).click();
        await page.getByPlaceholder('you@example.com').fill('donor@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL(/\/donor/);

        // 2. Post Donation
        await page.getByRole('link', { name: 'Donate Food' }).click();
        await page.getByLabel('Title').fill('Fresh Apples');
        await page.getByLabel('Category').selectOption('raw');
        await page.getByLabel('Quantity').fill('10kg');
        await page.getByRole('button', { name: 'Post Donation' }).click();

        await expect(page.getByText('Donation created successfully')).toBeVisible();

        // 3. Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // 4. Login as NGO
        await page.goto('/login');
        await page.getByRole('tab', { name: 'Sign In' }).click();
        await page.getByPlaceholder('you@example.com').fill('ngo@test.com');
        await page.getByPlaceholder('Enter your password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();
        await expect(page).toHaveURL(/\/ngo/);

        // 5. Claim Donation
        await page.goto('/nearby-donations');
        await expect(page.getByText('Fresh Apples')).toBeVisible();
        await page.getByRole('button', { name: 'Claim' }).first().click();

        // 6. Verify Claimed
        await expect(page.getByText('Donation Secured Successfully')).toBeVisible();
    });
});
