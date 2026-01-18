/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AuthState, getAuthState, logout as authLogout, setAuthData, getProfile } from '@/utils/auth';
import { User } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface LoginResponse {
    success: boolean;
    token: string;
    data: {
        id: string;
        name: string;
        email: string;
        role: string;
        organization?: string;
        status: string;
        createdAt: string;
    };
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (data: Record<string, any>) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getAuthState);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const verifySession = useCallback(async () => {
        const token = localStorage.getItem('surpluslink_token');
        if (token) {
            try {
                const user = await getProfile();
                const newState = setAuthData(user, token);
                setAuthState(newState);
            } catch (error) {
                console.error('Session verification failed:', error);
                authLogout();
                setAuthState({ isAuthenticated: false, user: null, role: null });
            }
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post<any>('/auth/login', { email, password });
        const { token, ...user } = response.data;
        const newState = setAuthData(user as User, token);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Welcome back!",
            description: `Successfully signed in as ${user.role}`,
        });
    }, [toast]);

    const signup = useCallback(async (signupData: Record<string, any>) => {
        const response = await api.post<any>('/auth/signup', signupData);
        const { token, ...user } = response.data;
        const newState = setAuthData(user as User, token);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Account created!",
            description: `Welcome to SurplusLink as a ${user.role}!`,
        });
    }, [toast]);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            authLogout();
            setAuthState({ isAuthenticated: false, user: null, role: null });
            toast({
                title: "Logged out",
                description: "You have been safely signed out.",
            });
        }
    }, [toast]);

    return (
        <AuthContext.Provider value={{ ...authState, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
