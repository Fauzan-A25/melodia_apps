// src/hooks/useAuth.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { authService } from '../services/authService';

/**
 * Custom hook for authentication management with token monitoring
 * @returns {object} Auth state and methods
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const tokenCheckIntervalRef = useRef(null);
  const isInitializedRef = useRef(false);

  /**
   * Check if token is expired
   * @returns {boolean} true if valid, false if expired
   */
  const checkTokenExpiry = useCallback(() => {
    const token = authService.getToken();
    
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      
      if (now >= expiryTime) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  }, []);

  /**
   * Handle token expiration - logout and redirect
   */
  const handleTokenExpired = useCallback(async () => {
    // Clear monitoring interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    // Clear auth data
    removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeStorageItem(STORAGE_KEYS.USER_DATA);
    
    // Clear legacy localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('accountId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('accountType');
    localStorage.removeItem('email');
    localStorage.removeItem('bio');

    setUser(null);
    setIsAuthenticated(false);
    setError('Your session has expired. Please login again.');

    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Redirect to auth page
    navigate('/auth', { replace: true });
  }, [navigate]);

  /**
   * Initialize authentication state
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA);

      // No token found
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Check if token is expired (client-side)
      const isValid = checkTokenExpiry();
      
      if (!isValid) {
        await handleTokenExpired();
        setIsLoading(false);
        return;
      }

      // Validate token with backend (only on first init)
      if (!isInitializedRef.current) {
        const isBackendValid = await authService.validateToken();
        
        if (!isBackendValid) {
          await handleTokenExpired();
          setIsLoading(false);
          return;
        }
        
        isInitializedRef.current = true;
      }

      // Set authenticated state
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Fallback: get user from backend
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          await handleTokenExpired();
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Failed to initialize authentication');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenExpiry, handleTokenExpired]);

  /**
   * Setup token monitoring interval
   */
  useEffect(() => {
    // Clear existing interval
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }

    // Only monitor if authenticated
    if (isAuthenticated && user) {
      tokenCheckIntervalRef.current = setInterval(() => {
        const isValid = checkTokenExpiry();
        
        if (!isValid) {
          handleTokenExpired();
        }
      }, 60000); // Check every 1 minute
    }

    // Cleanup on unmount or when auth state changes
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, checkTokenExpiry, handleTokenExpired]);

  /**
   * Initialize auth on mount
   */
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Listen for auth refresh events
   */
  useEffect(() => {
    const handleAuthRefresh = () => {
      setIsLoading(true);
      initializeAuth();
    };

    window.addEventListener('auth:refresh', handleAuthRefresh);
    return () => window.removeEventListener('auth:refresh', handleAuthRefresh);
  }, [initializeAuth]);

  /**
   * Listen for tab visibility changes
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        const isValid = checkTokenExpiry();
        
        if (!isValid) {
          await handleTokenExpired();
          return;
        }

        // Optional: validate with backend
        try {
          const isBackendValid = await authService.validateToken();
          if (!isBackendValid) {
            await handleTokenExpired();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          await handleTokenExpired();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, checkTokenExpiry, handleTokenExpired]);

  /**
   * Login user (delegate to authService)
   */
  const login = useCallback(async (usernameOrEmail, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await authService.login(usernameOrEmail, password);
      
      setUser(data);
      setIsAuthenticated(true);
      
      // Dispatch refresh event
      window.dispatchEvent(new CustomEvent('auth:refresh'));
      
      return { success: true, user: data };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user (delegate to authService)
   */
  const register = useCallback(async (username, email, password, role, bio = '') => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.register(username, email, password, role, bio);
      
      // Auto-login after registration
      const loginResult = await login(username, password);
      
      return loginResult;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // Clear monitoring interval
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }

      // Call backend logout
      await authService.logout();

      // Clear storage
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);

      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      isInitializedRef.current = false;

      // Dispatch events
      window.dispatchEvent(new CustomEvent('auth:refresh'));
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(
    async (updates) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!updates || Object.keys(updates).length === 0) {
          throw new Error('No updates provided');
        }

        // Call backend update
        const accountType = user?.accountType || 'USER';
        const updatedUser = await authService.updateProfile(updates, accountType);

        // Update local state and storage
        setStorageItem(STORAGE_KEYS.USER_DATA, updatedUser);
        setUser(updatedUser);
        
        return { success: true, user: updatedUser };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update profile.';
        console.error('Update profile error:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
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

  /**
   * Clear error message
   */
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
