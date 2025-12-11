// src/services/authService.js
const API_BASE_URL = 'https://melodia-backend-production.up.railway.app/api';

import { setStorageItem, removeStorageItem, getStorageItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

// ==================== HELPER: Get Auth Header ====================
const getAuthHeader = () => {
  const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== HELPER: Save Auth Data (legacy keys) ====================
const saveAuthData = (data) => {
  console.log('💾 Saving auth data (legacy keys):', data);

  if (data.token) {
    localStorage.setItem('token', data.token);
    console.log('✅ JWT token saved (legacy key)');
  }

  if (data.accountId) {
    localStorage.setItem('userId', data.accountId);
    localStorage.setItem('accountId', data.accountId);
  }

  if (data.username) {
    localStorage.setItem('username', data.username);
  }

  if (data.email) {
    localStorage.setItem('email', data.email);
  }

  if (data.accountType) {
    localStorage.setItem('role', data.accountType);
    localStorage.setItem('accountType', data.accountType);
  }

  if (data.bio) {
    localStorage.setItem('bio', data.bio);
  }
};

// ==================== HELPER: Sync ke STORAGE_KEYS.USER_DATA & AUTH_TOKEN ====================
const syncAuthToUseAuthStorage = (data) => {
  // Bentuk userData yang dibaca useAuth.initializeAuth()
  const userData = {
    accountId: data.accountId,
    username: data.username,
    email: data.email,
    accountType: data.accountType,
    bio: data.bio ?? null,
  };

  console.log('💾 Sync to STORAGE_KEYS.USER_DATA:', userData);

  setStorageItem(STORAGE_KEYS.USER_DATA, userData);
  if (data.token) {
    setStorageItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
  }
};

// ==================== HELPER: Clear Auth Data ====================
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('accountId');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('accountType');
  localStorage.removeItem('email');
  localStorage.removeItem('bio');

  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER_DATA);

  console.log('✅ Auth data cleared from localStorage + STORAGE_KEYS');
};

// ==================== HELPER: Check Token Expiry ====================
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const authService = {
  // ==================== LOGIN ====================
  login: async (usernameOrEmail, password) => {
    console.log('🔐 Attempting login for:', usernameOrEmail);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameOrEmail,
        password,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Login failed (${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        if (response.status === 401) {
          errorMessage = 'Invalid credentials';
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    console.log('📦 Login response from backend:', data);

    if (!data.token) {
      console.error('❌ JWT token not found in response!');
      throw new Error('Authentication token missing');
    }

    if (!data.accountId) {
      console.error('⚠️ WARNING: accountId not found in login response!');
      if (data.id) data.accountId = data.id;
      else if (data.userId) data.accountId = data.userId;
      else if (data.account_id) data.accountId = data.account_id;
      else throw new Error('Account ID missing from response');
    }

    // Legacy keys (dipakai Sidebar, dll)
    saveAuthData(data);
    // ✅ Sinkron ke storage versi useAuth
    syncAuthToUseAuthStorage(data);

    console.log('✅ Login successful, token & userData saved');
    return data;
  },

  // ==================== REGISTER ====================
  register: async (username, email, password, role, bio = '') => {
    console.log('📝 Attempting registration:', { username, email, role });

    const endpoint =
      role === 'artist'
        ? `${API_BASE_URL}/auth/register/artist`
        : `${API_BASE_URL}/auth/register/user`;

    const body =
      role === 'artist'
        ? { username, email, password, bio }
        : { username, email, password };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errorMessage = `Registration failed (${response.status})`;
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        errorMessage = 'Registration failed';
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Registration successful:', data);

    return data;
  },

  // ==================== LOGOUT ====================
  logout: async () => {
    console.log('🚪 Attempting logout...');

    try {
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');

      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            ...getAuthHeader(),
          },
        });
      }

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('⚠️ Logout request failed:', error);
    } finally {
      clearAuthData();
    }
  },

  // ==================== VALIDATE TOKEN ====================
  validateToken: async () => {
    console.log('🔍 Validating token...');

    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');

    if (!token) {
      console.log('❌ No token found');
      return false;
    }

    if (isTokenExpired(token)) {
      console.log('❌ Token expired (client-side check)');
      clearAuthData();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        console.log('❌ Token invalid (server-side check)');
        clearAuthData();
        return false;
      }

      const data = await response.json();
      console.log('✅ Token valid');

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      clearAuthData();
      return false;
    }
  },

  // ==================== REFRESH TOKEN ====================
  refreshToken: async () => {
    console.log('🔄 Refreshing token...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        console.log('❌ Token refresh failed');
        clearAuthData();
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      console.log('✅ Token refreshed successfully');

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return data;
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      clearAuthData();
      throw error;
    }
  },

  // ==================== GET CURRENT USER ====================
  getCurrentUser: async () => {
    console.log('👤 Getting current user...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        console.log('❌ Failed to get current user');
        clearAuthData();
        return null;
      }

      const data = await response.json();
      console.log('✅ Current user retrieved:', data);

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return data;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  },

  // ==================== CHECK EXISTS ====================
  checkExists: async (usernameOrEmail) => {
    const response = await fetch(`${API_BASE_URL}/auth/check/${usernameOrEmail}`);
    const data = await response.json();
    return data.exists;
  },

  // ==================== UPDATE PROFILE ====================
  updateProfile: async (profile, accountType) => {
    console.log('📝 Updating profile...');

    const payload =
      accountType === 'ARTIST'
        ? {
            username: profile.username,
            email: profile.email,
            bio: profile.bio ?? '',
          }
        : {
            username: profile.username,
            email: profile.email,
          };

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let msg = `Update profile failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || err.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    const data = await response.json();
    console.log('✅ Profile updated');

    saveAuthData(data);
    syncAuthToUseAuthStorage(data);

    return data;
  },

  // ==================== CHANGE PASSWORD ====================
  changePassword: async (currentPassword, newPassword, username) => {
    console.log('🔑 Changing password...');

    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });

    if (!response.ok) {
      let msg = `Change password failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || err.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    console.log('✅ Password changed successfully');
    return response.json();
  },

  // ==================== DELETE ACCOUNT ====================
  deleteAccount: async (username) => {
    console.log('🗑️ Deleting account...');

    const response = await fetch(`${API_BASE_URL}/auth/account/${username}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      let msg = `Delete account failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err.error || err.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    console.log('✅ Account deleted successfully');
    clearAuthData();
    return true;
  },

  // ==================== HELPER: Check if logged in ====================
  isAuthenticated: () => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');
    if (!token) return false;
    return !isTokenExpired(token);
  },

  // ==================== HELPER: Get stored token ====================
  getToken: () => {
    return getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');
  },
};
