import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DonationCard } from '@/components/common/donation-card';
import { Donation } from '@/types';

// Mock formatters as they might depend on localized time
vi.mock('@/utils/formatters', () => ({
    getTimeUntil: () => '2h 30m',
    formatTime: () => '12:00 PM'
}));

const mockDonation: Donation = {
    id: '1',
    donorId: 'd1',
    donorName: 'Test Donor',
    title: 'Fresh Apples',
    foodType: 'Produce',
    quantity: '10kg',
    expiryTime: new Date().toISOString(),
    pickupWindow: 'Morning',
    location: 'Downtown',
    address: '123 Main St',
    status: 'active',
    createdAt: new Date().toISOString(),
    urgencyLevel: 'Standard',
    matchPercentage: 75
};

describe('SmartDonationCard', () => {
    it('renders correctly with standard urgency', () => {
        render(<DonationCard donation={mockDonation} />);
        expect(screen.getByText('Fresh Apples')).toBeDefined();
        expect(screen.getByText('Standard')).toBeDefined();
    });

    it('renders the "Critical" badge with pulse animation if urgencyLevel is Critical', () => {
        const criticalDonation = { ...mockDonation, urgencyLevel: 'Critical' as const };
        render(<DonationCard donation={criticalDonation} />);

        const badge = screen.getByText('Critical');
        expect(badge).toBeDefined();
        // Check for the class responsible for pulse (from your implementation)
        expect(badge.className).toContain('animate-pulse');
        expect(badge.className).toContain('bg-rose-500');
    });

    it('changes the Match Score ring color based on percentage (>80%)', () => {
        const highMatchDonation = { ...mockDonation, matchPercentage: 85 };
        render(<DonationCard donation={highMatchDonation} />);

        // Find the progress bar div. It has class based on percentage.
        // In our component: High (>80) is bg-emerald-500
        const matchBar = document.querySelector('.bg-emerald-500');
        expect(matchBar).not.toBeNull();
        expect(screen.getByText('85% Match')).toBeDefined();
    });

    it('changes the Match Score ring color based on percentage (<50%)', () => {
        const lowMatchDonation = { ...mockDonation, matchPercentage: 40 };
        render(<DonationCard donation={lowMatchDonation} />);

        // In our component: Low (<50) is bg-slate-400
        const matchBar = document.querySelector('.bg-slate-400');
        expect(matchBar).not.toBeNull();
        expect(screen.getByText('40% Match')).toBeDefined();
    });
});
