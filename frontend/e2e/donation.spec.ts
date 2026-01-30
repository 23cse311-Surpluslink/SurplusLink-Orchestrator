import { test, expect } from '@playwright/test';

test.describe('Donation Lifecycle', () => {
    test('Donor posts food, NGO claims and verifies it', async ({ page }) => {
        // 1. Login as Donor
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill('donor@test.com');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: 'Login' }).click();
        await expect(page).toHaveURL('/dashboard');

        // 2. Post Donation
        await page.getByRole('link', { name: 'Donate Food' }).click();
        await page.getByLabel('Title').fill('Fresh Apples');
        await page.getByLabel('Category').selectOption('raw');
        await page.getByLabel('Quantity').fill('10kg');
        // ... fill other fields (dates, etc) - simplified for example
        await page.getByRole('button', { name: 'Post Donation' }).click();

        await expect(page.getByText('Donation created successfully')).toBeVisible();

        // 3. Logout
        await page.getByRole('button', { name: 'Logout' }).click();

        // 4. Login as NGO
        await page.goto('/login');
        await page.getByPlaceholder('Email').fill('ngo@test.com');
        await page.getByPlaceholder('Password').fill('password123');
        await page.getByRole('button', { name: 'Login' }).click();

        // 5. Claim Donation
        await page.goto('/nearby-donations');
        await expect(page.getByText('Fresh Apples')).toBeVisible();
        await page.getByRole('button', { name: 'Claim' }).first().click();

        // 6. Verify Claimed
        await expect(page.getByText('Donation Secured Successfully')).toBeVisible();
    });
});
