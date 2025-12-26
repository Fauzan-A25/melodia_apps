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
  
  // ✅ TAMBAHAN: State untuk terminal loading
  const [loadingMessage, setLoadingMessage] = useState('Initializing system...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  
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

    // ✅ Update loading message
    setLoadingMessage('Session expired. Clearing data...');
    setLoadingProgress(50);

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

    setLoadingMessage('Redirecting to login...');
    setLoadingProgress(100);

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
      
      // ✅ Step 1: Check for token
      setLoadingMessage('Checking authentication...');
      setLoadingProgress(10);
      
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = getStorageItem(STORAGE_KEYS.USER_DATA);

      // No token found
      if (!token) {
        setLoadingMessage('No session found');
        setLoadingProgress(100);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // ✅ Step 2: Validate token expiry (client-side)
      setLoadingMessage('Validating session token...');
      setLoadingProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Smooth UX
      
      const isValid = checkTokenExpiry();
      
      if (!isValid) {
        setLoadingMessage('Session expired');
        setLoadingProgress(50);
        await handleTokenExpired();
        setIsLoading(false);
        return;
      }

      // ✅ Step 3: Validate with backend (only on first init)
      if (!isInitializedRef.current) {
        setLoadingMessage('Verifying credentials with server...');
        setLoadingProgress(50);
        
        const isBackendValid = await authService.validateToken();
        
        if (!isBackendValid) {
          setLoadingMessage('Invalid session');
          setLoadingProgress(70);
          await handleTokenExpired();
          setIsLoading(false);
          return;
        }
        
        isInitializedRef.current = true;
      }

      // ✅ Step 4: Load user profile
      setLoadingMessage('Loading user profile...');
      setLoadingProgress(70);
      
      await new Promise(resolve => setTimeout(resolve, 300));

      // Set authenticated state
      if (userData) {
        setLoadingMessage(`Welcome back, ${userData.username}!`);
        setLoadingProgress(90);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        setLoadingMessage('Profile loaded successfully');
        setLoadingProgress(100);
      } else {
        // Fallback: get user from backend
        setLoadingMessage('Fetching user data...');
        setLoadingProgress(80);
        
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setLoadingMessage(`Welcome back, ${currentUser.username}!`);
          setLoadingProgress(95);
          
          setUser(currentUser);
          setIsAuthenticated(true);
          
          setLoadingMessage('Profile loaded successfully');
          setLoadingProgress(100);
        } else {
          setLoadingMessage('Failed to load profile');
          await handleTokenExpired();
        }
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Failed to initialize authentication');
      setLoadingMessage('Authentication failed');
      setLoadingProgress(100);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      // ✅ Small delay untuk smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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
      setLoadingMessage('Refreshing session...');
      setLoadingProgress(0);
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
      // ✅ Step 1: Authenticating
      setLoadingMessage('Authenticating...');
      setLoadingProgress(20);

      const data = await authService.login(usernameOrEmail, password);
      
      // ✅ Step 2: Verifying credentials
      setLoadingMessage('Verifying credentials...');
      setLoadingProgress(50);
      
      await new Promise(resolve => setTimeout(resolve, 200));

      // ✅ Step 3: Loading profile
      setLoadingMessage(`Loading profile for ${data.username}...`);
      setLoadingProgress(80);
      
      setUser(data);
      setIsAuthenticated(true);

      // ✅ Step 4: Success
      setLoadingMessage('Login successful!');
      setLoadingProgress(100);
      
      // Dispatch refresh event
      window.dispatchEvent(new CustomEvent('auth:refresh'));
      
      return { success: true, user: data };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setLoadingMessage('Login failed');
      setLoadingProgress(0);
      return { success: false, error: err.message };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, []);

  /**
   * Register new user (delegate to authService)
   */
  const register = useCallback(async (username, email, password, role, bio = '') => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Step 1: Creating account
      setLoadingMessage('Creating account...');
      setLoadingProgress(20);

      await authService.register(username, email, password, role, bio);
      
      // ✅ Step 2: Setting up profile
      setLoadingMessage('Setting up profile...');
      setLoadingProgress(50);
      
      await new Promise(resolve => setTimeout(resolve, 200));

      // ✅ Step 3: Auto-login after registration
      setLoadingMessage('Logging in...');
      setLoadingProgress(70);
      
      const loginResult = await login(username, password);

      if (loginResult.success) {
        setLoadingMessage('Registration complete!');
        setLoadingProgress(100);
      }
      
      return loginResult;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message);
      setLoadingMessage('Registration failed');
      setLoadingProgress(0);
      return { success: false, error: err.message };
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }, [login]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      // ✅ Step 1: Logging out
      setLoadingMessage('Logging out...');
      setLoadingProgress(30);

      // Clear monitoring interval
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }

      // Call backend logout
      await authService.logout();

      // ✅ Step 2: Clearing session
      setLoadingMessage('Clearing session data...');
      setLoadingProgress(70);

      // Clear storage
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);

      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      isInitializedRef.current = false;

      // ✅ Step 3: Success
      setLoadingMessage('Logged out successfully');
      setLoadingProgress(100);

      // Dispatch events
      window.dispatchEvent(new CustomEvent('auth:refresh'));
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      setLoadingMessage('Logout completed with errors');
      setLoadingProgress(100);
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

        setLoadingMessage('Updating profile...');
        setLoadingProgress(30);

        // Call backend update
        const accountType = user?.accountType || 'USER';
        const updatedUser = await authService.updateProfile(updates, accountType);

        setLoadingMessage('Saving changes...');
        setLoadingProgress(70);

        // Update local state and storage
        setStorageItem(STORAGE_KEYS.USER_DATA, updatedUser);
        setUser(updatedUser);

        setLoadingMessage('Profile updated successfully');
        setLoadingProgress(100);
        
        return { success: true, user: updatedUser };
      } catch (err) {
        const errorMessage = err.message || 'Failed to update profile.';
        console.error('Update profile error:', errorMessage);
        setError(errorMessage);
        setLoadingMessage('Update failed');
        setLoadingProgress(0);
        return { success: false, error: errorMessage };
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 300);
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
    // ✅ TAMBAHAN: Expose loading state untuk terminal
    loadingMessage,
    loadingProgress,
  };
};

export default useAuth;
