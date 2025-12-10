import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { User } from '@/types/kyc';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, mobile: string, password: string, name?: string) => Promise<{ success: boolean; error?: string; applicationId?: string }>;
  logout: () => void;
  loginWithApplicationId: (applicationId: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'kyc_current_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, []);

  const register = useCallback(async (
    email: string, 
    mobile: string, 
    password: string, 
    name?: string
  ): Promise<{ success: boolean; error?: string; applicationId?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.register(email, mobile, password, name);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
        setIsLoading(false);
        return { success: true, applicationId: response.applicationId };
      } else {
        setIsLoading(false);
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }, []);

  const loginWithApplicationId = useCallback(async (applicationId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.loginWithApplicationId(applicationId, password);
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: response.error || 'Application ID not found' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithApplicationId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
