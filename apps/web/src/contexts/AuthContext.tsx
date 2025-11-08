import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, ApiClientError } from '../lib/api-client';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'inspector' | 'viewer';
  organizationId: string;
  permissions: string[];
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Try to get current user with existing token
        const userData = await apiClient.get<User>('/auth/me');
        setUser(userData);
      } catch (err) {
        // Token might be expired, try to refresh
        try {
          await refreshAuthInternal();
        } catch {
          // Refresh failed, clear auth state
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up token refresh interval (13 minutes, tokens expire in 15)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        await refreshAuthInternal();
      } catch (err) {
        console.error('Token refresh failed:', err);
        clearAuth();
      }
    }, 13 * 60 * 1000); // 13 minutes

    return () => clearInterval(interval);
  }, [user]);

  const clearAuth = () => {
    setUser(null);
    apiClient.setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshAuthInternal = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    });

    // Update tokens
    apiClient.setToken(response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    // Fetch updated user data
    const userData = await apiClient.get<User>('/auth/me');
    setUser(userData);
  };

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
        '/auth/login',
        data
      );

      // Store tokens
      apiClient.setToken(response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      // Set user
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.error.message
          : 'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ user: User; tokens: AuthTokens }>(
        '/auth/register',
        data
      );

      // Store tokens
      apiClient.setToken(response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      // Set user
      setUser(response.user);
    } catch (err) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.error.message
          : 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  const refreshAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      await refreshAuthInternal();
    } catch (err) {
      const errorMessage =
        err instanceof ApiClientError
          ? err.error.message
          : 'Failed to refresh authentication';
      setError(errorMessage);
      clearAuth();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((p) => hasPermission(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshAuth,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
