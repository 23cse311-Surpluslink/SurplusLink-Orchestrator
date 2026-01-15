import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AuthState, getAuthState, login as authLogin, logout as authLogout } from '@/utils/auth';
import { UserRole } from '@/types';

interface AuthContextType extends AuthState {
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>(getAuthState);

    const login = useCallback((role: UserRole) => {
        const newState = authLogin(role);
        setAuthState(newState);
    }, []);

    const logout = useCallback(() => {
        authLogout();
        setAuthState({ isAuthenticated: false, user: null, role: null });
    }, []);

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
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
