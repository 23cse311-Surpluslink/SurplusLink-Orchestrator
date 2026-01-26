import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../login-page';

vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        },
    };
});

const mockLogin = vi.fn();
const mockSignup = vi.fn();

vi.mock('@/contexts/auth-context', () => ({
    useAuth: () => ({
        login: mockLogin,
        signup: mockSignup,
        isAuthenticated: false,
        role: null,
    }),
}));

vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

describe('LoginPage Component', () => {

    it('switches to Sign In tab and validates form submission', async () => {
        const user = userEvent.setup();

        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();

        const signInTab = screen.getByRole('tab', { name: /sign in/i });
        await user.click(signInTab);
        const signInButtons = screen.getAllByText('Sign In');

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
        });


        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');

        const submitBtn = screen.getByRole('button', { name: 'Sign In' });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    it('handles Registration flow', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const nameInput = screen.getByLabelText('Full Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

    

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@user.com');
        await user.type(passwordInput, 'securePass123');


        const orgInput = screen.getByLabelText('Store / Business Name');
        await user.type(orgInput, 'Pizza Hut');

        const createBtn = screen.getByRole('button', { name: /create account/i });
        await user.click(createBtn);

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith(expect.objectContaining({
                name: 'New User',
                email: 'new@user.com',
                organization: 'Pizza Hut',
                role: 'donor'
            }));
        });
    });
});
