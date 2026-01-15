import { UserRole, User } from '@/types';
import { getDemoUser } from '@/mockData/users';

const AUTH_KEY = 'surpluslink_auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
}

export const getAuthState = (): AuthState => {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse auth state');
  }
  return { isAuthenticated: false, user: null, role: null };
};

export const login = (role: UserRole): AuthState => {
  const user = getDemoUser(role);
  if (!user) {
    throw new Error('User not found');
  }
  
  const authState: AuthState = {
    isAuthenticated: true,
    user,
    role
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(authState));
  return authState;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthorized = (requiredRole: UserRole): boolean => {
  const { isAuthenticated, role } = getAuthState();
  return isAuthenticated && role === requiredRole;
};
