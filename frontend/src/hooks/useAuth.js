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

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA);

        if (token && userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} Login result
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Invalid credentials');
      // }
      // 
      // const data = await response.json();
      // const { token, user: userData } = data;

      // Mock response for demo - simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate password validation
      if (password === 'wrong') {
        throw new Error('Invalid email or password');
      }

      const mockUser = {
        id: 1,
        email,
        username: email.split('@')[0],
        avatar: '👤',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();

      // Store auth data
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      setStorageItem(STORAGE_KEYS.USER_DATA, mockUser);

      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoading(false);

      return { success: true, user: mockUser };
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {Promise<object>} Registration result
   */
  const register = useCallback(async (email, password, username) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!email || !password || !username) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters');
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/auth/register`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, username }),
      // });
      // 
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Registration failed');
      // }
      // 
      // const data = await response.json();
      // const { token, user: userData } = data;

      // Mock response for demo - simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockUser = {
        id: Date.now(),
        email,
        username,
        avatar: '👤',
        createdAt: new Date().toISOString(),
      };
      const mockToken = 'mock_token_' + Date.now();

      // Store auth data
      setStorageItem(STORAGE_KEYS.AUTH_TOKEN, mockToken);
      setStorageItem(STORAGE_KEYS.USER_DATA, mockUser);

      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoading(false);

      return { success: true, user: mockUser };
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout user
   * @returns {object} Logout result
   */
  const logout = useCallback(() => {
    try {
      // Clear storage
      removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeStorageItem(STORAGE_KEYS.USER_DATA);

      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);

      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update user profile
   * @param {object} updates - User data updates
   * @returns {Promise<object>} Update result
   */
  const updateProfile = useCallback(async (updates) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No updates provided');
      }

      // TODO: Replace with actual API call
      // const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      // const response = await fetch(`${API_BASE_URL}/users/profile`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(updates),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to update profile');
      // }
      // 
      // const data = await response.json();
      // const updatedUser = data.user;

      // Mock response for demo
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...updates };

      setStorageItem(STORAGE_KEYS.USER_DATA, updatedUser);
      setUser(updatedUser);
      setIsLoading(false);

      return { success: true, user: updatedUser };
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.message || 'Failed to update profile.';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Methods
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    clearError,
  };
};

export default useAuth;