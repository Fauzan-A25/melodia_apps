// src/services/authService.js
import { api } from './api';  // ✅ Import api object
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
  localStorage.removeItem('bio');

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
    try {
      const response = await api.post('/auth/login', {
        username: usernameOrEmail,
        password,
      });

      if (!response.ok) {
        let errorMessage = `Login failed (${response.status})`;
        try {
          const error = await response.json();
          // ✅ Check if account is banned
          if (error.errorCode === 'ACCOUNT_BANNED' || response.status === 403) {
            errorMessage = error.error || 'Akun Anda telah di-ban dan tidak dapat login.';
          } else {
            errorMessage = error.error || error.message || errorMessage;
          }
        } catch {
          if (response.status === 401) {
            errorMessage = 'Invalid credentials';
          } else if (response.status === 403) {
            errorMessage = 'Akun Anda telah di-ban dan tidak dapat login.';
          }
        }
        throw new Error(errorMessage);
      }

      const response_body = await response.json();
      const data = response_body.data || response_body;

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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // ==================== REGISTER USER ONLY ====================
  register: async (username, email, password) => {
    try {
      const response = await api.post('/auth/register/user', {
        username,
        email,
        password,
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
      return response_body.data || response_body;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // ==================== LOGOUT ====================
  logout: async () => {
    try {
      const token = getStorageItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');

      if (token) {
        // Pakai api wrapper dengan manual headers karena endpoint khusus
        const baseUrl = await api.getURL();
        await fetch(`${baseUrl}/auth/logout`, {
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
      const baseUrl = await api.getURL();
      const response = await fetch(`${baseUrl}/auth/validate`, {
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
      const data = response_body.data || response_body;

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
      const baseUrl = await api.getURL();
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        // ✅ Check if banned
        if (response.status === 403) {
          try {
            const error = await response.json();
            if (error.errorCode === 'ACCOUNT_BANNED') {
              clearAuthData();
              throw new Error(error.error || 'Akun Anda telah di-ban dan tidak dapat login.');
            }
          } catch (e) {
            if (e.message.includes('di-ban')) throw e;
          }
        }
        clearAuthData();
        throw new Error('Token refresh failed');
      }

      const response_body = await response.json();
      const data = response_body.data || response_body;

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
      const response = await api.get('/auth/me');

      if (!response.ok) {
        // ✅ Check if banned
        if (response.status === 403) {
          try {
            const error = await response.json();
            if (error.errorCode === 'ACCOUNT_BANNED') {
              clearAuthData();
              throw new Error(error.error || 'Akun Anda telah di-ban.');
            }
          } catch (e) {
            if (e.message.includes('di-ban')) throw e;
          }
        }
        clearAuthData();
        return null;
      }

      const response_body = await response.json();
      const data = response_body.data || response_body;

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
    try {
      const response = await api.get(`/auth/check/${usernameOrEmail}`);
      const response_body = await response.json();
      const data = response_body.data || response_body;
      return data.exists;
    } catch (error) {
      console.error('Check exists error:', error);
      return false;
    }
  },

  // ==================== UPDATE PROFILE (User/Admin only) ====================
  updateProfile: async (profile) => {
    try {
      const payload = {
        username: profile.username,
        email: profile.email,
      };

      const response = await api.put('/auth/profile', payload);

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
      const data = response_body.data || response_body;

      saveAuthData(data);
      syncAuthToUseAuthStorage(data);

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // ==================== CHANGE PASSWORD ====================
  changePassword: async (currentPassword, newPassword, username) => {
    try {
      const response = await api.post('/auth/change-password', {
        username,
        currentPassword,
        newPassword,
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
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // ==================== DELETE ACCOUNT ====================
  deleteAccount: async (username) => {
    try {
      const response = await api.delete(`/auth/account/${username}`);

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
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
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
