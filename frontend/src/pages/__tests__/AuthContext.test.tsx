import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/api';

// Mock API
vi.mock('@/lib/api', () => ({
    default: {
        post: vi.fn(() => Promise.resolve({ data: {} })),
        get: vi.fn(() => Promise.resolve({ data: { id: '1', name: 'Test', role: 'donor' } })),
        put: vi.fn(() => Promise.resolve({ data: {} })),
    }
}));

// Mock Toast
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() })
}));

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('clears user state and is authenticated false on logout', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        // Simulate being logged in
        localStorage.setItem('surpluslink_auth', JSON.stringify({
            isAuthenticated: true,
            user: { id: '1', name: 'Test', role: 'donor' },
            role: 'donor'
        }));

        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for initial verification to complete (it should keep it logged in)
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.isAuthenticated).toBe(true);

        // Perform logout
        await act(async () => {
            await result.current.logout();
        });

        // After logout, it MUST be false
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('surpluslink_auth')).toBeNull();
    });
});
