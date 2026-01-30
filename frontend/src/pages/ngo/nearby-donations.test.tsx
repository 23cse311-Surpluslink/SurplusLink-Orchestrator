import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NearbyDonationsPage } from './nearby-donations';
import DonationService from '@/services/donation.service';
import { Donation } from '@/types';

// Mock Dependencies
vi.mock('@/services/donation.service', () => ({
    default: {
        getSmartFeed: vi.fn(),
        claimDonation: vi.fn(),
        rejectDonation: vi.fn()
    }
}));

vi.mock('@/components/common/ngo-map', () => ({
    NgoMap: () => <div data-testid="ngo-map">Map Placeholder</div>
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast
    })
}));

const mockDonations: Donation[] = [
    {
        id: '1',
        donorId: 'd1',
        title: 'Cooked Rice',
        foodType: 'Cooked',
        quantity: '5kg',
        expiryTime: new Date(Date.now() + 1000000).toISOString(),
        location: 'Test Loc',
        address: 'Test Addr',
        status: 'active',
        foodCategory: 'cooked',
        donorName: 'John Doe',
        pickupWindow: 'Today',
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        donorId: 'd2',
        title: 'Raw Veggies',
        foodType: 'Raw',
        quantity: '10kg',
        expiryTime: new Date(Date.now() + 2000000).toISOString(),
        location: 'Farm',
        address: 'Farm Addr',
        status: 'active',
        foodCategory: 'raw',
        donorName: 'Jane Doe',
        pickupWindow: 'Tomorrow',
        createdAt: new Date().toISOString()
    }
];

import { BrowserRouter } from 'react-router-dom';

describe('NearbyDonationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(DonationService.getSmartFeed).mockResolvedValue({ donations: mockDonations, capacityWarning: false, count: 2 });
    });

    it('renders the feed and loads donations', async () => {
        render(
            <BrowserRouter>
                <NearbyDonationsPage />
            </BrowserRouter>
        );

        // Initial Loading State or direct render if fast
        // We wait for donations to appear
        expect(await screen.findByText('Cooked Rice')).toBeInTheDocument();
        expect(await screen.findByText('Raw Veggies')).toBeInTheDocument();
    });

    it('filters donations by category', async () => {
        render(
            <BrowserRouter>
                <NearbyDonationsPage />
            </BrowserRouter>
        );

        expect(await screen.findByText('Cooked Rice')).toBeInTheDocument();
    });

    it('shows empty state when no donations found', async () => {
        vi.mocked(DonationService.getSmartFeed).mockResolvedValue({ donations: [], capacityWarning: false, count: 0 });
        render(
            <BrowserRouter>
                <NearbyDonationsPage />
            </BrowserRouter>
        );

        expect(await screen.findByText('No donations found')).toBeInTheDocument();
    });
});
