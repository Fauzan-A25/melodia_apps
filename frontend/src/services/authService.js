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
  if (data.token) {
    localStorage.setItem('token', data.token);
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
};

// ==================== HELPER: Sync ke STORAGE_KEYS.USER_DATA & AUTH_TOKEN ====================
const syncAuthToUseAuthStorage = (data) => {
  const userData = {
    accountId: data.accountId,
    username: data.username,
    email: data.email,
    accountType: data.accountType,
  };

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
  localStorage.removeItem('bio'); // cleanup old data

  removeStorageItem(STORAGE_KEYS.AUTH_TOKEN);
  removeStorageItem(STORAGE_KEYS.USER_DATA);
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

    const response_body = await response.json();
    const data = response_body.data || response_body; // Handle ApiResponse wrapper

    if (!data.token) {
      throw new Error('Authentication token missing');
    }

    if (!data.accountId) {
      if (data.id) data.accountId = data.id;
      else if (data.userId) data.accountId = data.userId;
      else if (data.account_id) data.accountId = data.account_id;
      else throw new Error('Account ID missing from response');
    }

    saveAuthData(data);
    syncAuthToUseAuthStorage(data);

    return data;
  },

  // ==================== REGISTER USER ONLY ====================
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
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

    const response_body = await response.json();
    return response_body.data || response_body; // Handle ApiResponse wrapper
  },

  // ==================== LOGOUT ====================
  logout: async () => {
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
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuthData();
    }
  },

  // ==================== VALIDATE TOKEN ====================
  validateToken: async () => {
    const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');

    if (!token) {
      return false;
    }

    if (isTokenExpired(token)) {
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
        clearAuthData();
        return false;
      }

      const response_body = await response.json();
      const data = response_body.data || response_body; // Handle ApiResponse wrapper

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      clearAuthData();
      return false;
    }
  },

  // ==================== REFRESH TOKEN ====================
  refreshToken: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        clearAuthData();
        throw new Error('Token refresh failed');
      }

      const response_body = await response.json();
      const data = response_body.data || response_body; // Handle ApiResponse wrapper

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      throw error;
    }
  },

  // ==================== GET CURRENT USER ====================
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        clearAuthData();
        return null;
      }

      const response_body = await response.json();
      const data = response_body.data || response_body; // Handle ApiResponse wrapper

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // ==================== CHECK EXISTS ====================
  checkExists: async (usernameOrEmail) => {
    const response = await fetch(`${API_BASE_URL}/auth/check/${usernameOrEmail}`);
    const response_body = await response.json();
    const data = response_body.data || response_body; // Handle ApiResponse wrapper
    return data.exists;
  },

  // ==================== UPDATE PROFILE (User/Admin only) ====================
  updateProfile: async (profile) => {
    const payload = {
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

    const response_body = await response.json();
    const data = response_body.data || response_body; // Handle ApiResponse wrapper

    saveAuthData(data);
    syncAuthToUseAuthStorage(data);

    return data;
  },

  // ==================== CHANGE PASSWORD ====================
  changePassword: async (currentPassword, newPassword, username) => {
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

    return response.json();
  },

  // ==================== DELETE ACCOUNT ====================
  deleteAccount: async (username) => {
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
