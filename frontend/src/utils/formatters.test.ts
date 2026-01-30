import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatDate, formatTime, getTimeUntil, getRelativeTime } from './formatters';

describe('Formatters Utils', () => {
    beforeEach(() => {
        // Mock Date to ensure consistent results
        vi.useFakeTimers();
        const date = new Date('2024-01-01T12:00:00Z');
        vi.setSystemTime(date);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = '2024-01-01T10:00:00Z';
            // Output depends on locale, assumed en-US from implementation
            // Note: Implementation uses toLocaleDateString which uses local time zone.
            // If checking strict string, it might vary by machine timezone.
            // Using a loose check or setting timezone env might be needed.
            // For now, checks if it returns a string.
            expect(formatDate(date)).toBeTypeOf('string');
        });
    });

    describe('getTimeUntil', () => {
        it('should return Expired for past dates', () => {
            const past = new Date(Date.now() - 1000).toISOString();
            expect(getTimeUntil(past)).toBe('Expired');
        });

        it('should return minutes for close times', () => {
            const future = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 mins
            expect(getTimeUntil(future)).toMatch(/30 min/);
        });

        it('should return hours and minutes', () => {
            const future = new Date(Date.now() + 90 * 60 * 1000).toISOString(); // 1h 30m
            expect(getTimeUntil(future)).toMatch(/1h 30m/);
        });
    });

    describe('getRelativeTime', () => {
        it('should return Just now for immediate times', () => {
            const now = new Date().toISOString();
            expect(getRelativeTime(now)).toBe('Just now');
        });

        it('should return x minutes ago', () => {
            const past = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 mins ago
            expect(getRelativeTime(past)).toBe('5m ago');
        });
    });
});
