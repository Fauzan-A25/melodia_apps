// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Custom hook for authentication management
 * @returns {object} Auth state and methods
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fungsi init dipisah supaya bisa dipanggil ulang dari event
  const initializeAuth = useCallback(() => {
    try {
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Jalankan sekali saat mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 3. Dengarkan event global untuk refresh setelah authService.login / logout
  useEffect(() => {
    const handleAuthRefresh = () => {
      setIsLoading(true);
      initializeAuth();
    };

    window.addEventListener('auth:refresh', handleAuthRefresh);
    return () => window.removeEventListener('auth:refresh', handleAuthRefresh);
  }, [initializeAuth]);

  /**
   * Login user (tidak dipakai, gunakan authService.login)
   */
  const login = useCallback(async () => {
    setIsLoading(false);
    return { success: false, error: 'Use authService.login for real authentication' };
  }, []);

  /**
   * Register new user (tidak dipakai, gunakan authService.register)
   */
  const register = useCallback(async () => {
    setIsLoading(false);
    return { success: false, error: 'Use authService.register for real registration' };
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    try {
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);

      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      window.dispatchEvent(new CustomEvent('auth:refresh'));

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update user profile (hanya update state + storage lokal)
   */
  const updateProfile = useCallback(
    async (updates) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!updates || Object.keys(updates).length === 0) {
          throw new Error('No updates provided');
        }

        const updatedUser = { ...user, ...updates };

        setStorageItem(STORAGE_KEYS.USER_DATA, updatedUser);
        setUser(updatedUser);
        setIsLoading(false);

        return { success: true, user: updatedUser };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update profile.';
        setError(errorMessage);
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
    },
    [user],
  );

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback(
    (role) => {
      return user?.accountType === role || user?.role === role;
    },
    [user],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    clearError,
  };
};

export default useAuth;
