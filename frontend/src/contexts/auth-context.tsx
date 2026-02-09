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

import { updateVolunteerStatus, updateVolunteerProfile, updateVolunteerLocation } from '@/services/user.service';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (data: Record<string, any>) => Promise<any>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User> | FormData) => Promise<void>;
    toggleOnlineStatus: (isOnline: boolean) => Promise<void>;
    updateVolunteerVehicle: (vehicleType: string, maxWeight: number) => Promise<void>;
    sendOTP: (email: string) => Promise<any>;
    verifyOTP: (email: string, otp: string) => Promise<User>;
    refreshUser: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getAuthState);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const verifySession = useCallback(async () => {
        try {
            const user = await getProfile();
            const newState = setAuthData(user);
            setAuthState(newState);
        } catch (error) {
            console.error('Session verification failed:', error);
            authLogout();
            setAuthState({ isAuthenticated: false, user: null, role: null });
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        verifySession();
    }, [verifySession]);

    useEffect(() => {
        let interval: any;

        if (authState.isAuthenticated && authState.role === 'volunteer' && authState.user?.isOnline) {
            const sendLocation = () => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        updateVolunteerLocation(latitude, longitude).catch(console.error);
                    },
                    (error) => console.error('Location error:', error),
                    { enableHighAccuracy: true }
                );
            };

            sendLocation();
            interval = setInterval(sendLocation, 60000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [authState.isAuthenticated, authState.role, authState.user?.isOnline]);

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post<any>('/auth/login', { email, password });
        const user = response.data;
        const newState = setAuthData(user as User);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Welcome back!",
            description: `Successfully signed in as ${user.role}`,
        });
    }, [toast]);

    const signup = useCallback(async (signupData: Record<string, any>) => {
        const response = await api.post<any>('/auth/signup', signupData);

        if (response.data.requiresOtp) {
            toast({
                title: "Verification Sent",
                description: "Please check your email for the verification code.",
            });
            return response.data;
        }

        const user = response.data;
        const newState = setAuthData(user as User);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Account created!",
            description: `Welcome to SurplusLink as a ${user.role}!`,
        });
        return user;
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

    const updateProfile = useCallback(async (data: Partial<User> | FormData) => {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const response = await api.put<any>('/users/profile', data, { headers });
        const updatedUser = response.data;
        const newState = setAuthData(updatedUser as User);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Profile Updated",
            description: "Your information has been successfully updated.",
        });
    }, [toast]);

    const toggleOnlineStatus = useCallback(async (isOnline: boolean) => {
        const updatedUser = await updateVolunteerStatus(isOnline);
        const newState = setAuthData(updatedUser);
        setAuthState(newState);
        toast({
            variant: "success",
            title: isOnline ? "You are now Online" : "You are now Offline",
            description: isOnline ? "You can now receive mission alerts." : "Mission discovery paused.",
        });
    }, [toast]);

    const updateVolunteerVehicle = useCallback(async (vehicleType: string, maxWeight: number) => {
        const updatedUser = await updateVolunteerProfile({ vehicleType, maxWeight });
        const newState = setAuthData(updatedUser);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Equipment Updated",
            description: `Vehicle set to ${vehicleType} with ${maxWeight}kg capacity.`,
        });
    }, [toast]);

    const sendOTP = useCallback(async (email: string) => {
        try {
            const response = await api.post('/auth/send-otp', { email });
            toast({
                title: "OTP Sent",
                description: "Please check your email for the verification code.",
            });
            return response.data;
        } catch (error: any) {
            console.error('sendOTP error details:');
            console.dir(error);
            throw error;
        }
    }, [toast]);

    const verifyOTP = useCallback(async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { email, otp });
        const user = response.data;
        const newState = setAuthData(user as User);
        setAuthState(newState);
        toast({
            variant: "success",
            title: "Verified!",
            description: `Successfully signed in as ${user.role}`,
        });
        return user;
    }, [toast]);

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            signup,
            logout,
            updateProfile,
            toggleOnlineStatus,
            updateVolunteerVehicle,
            sendOTP,
            verifyOTP,
            refreshUser: verifySession,
            isLoading
        }}>
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
