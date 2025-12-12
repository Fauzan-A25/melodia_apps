// src/utils/axiosInstance.js
import axios from 'axios';
import { authService } from '../services/authService';

const API_BASE_URL = 'https://melodia-backend-production.up.railway.app/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor - cek token sebelum request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = authService.getToken();
    
    if (token) {
      // Cek apakah token expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      
      // Jika token akan expired dalam 5 menit, refresh dulu
      if (expiryTime - now < 5 * 60 * 1000 && expiryTime > now) {
        try {
          console.log('🔄 Token akan expired, refreshing...');
          await authService.refreshToken();
          const newToken = authService.getToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          console.error('❌ Token refresh failed, logging out');
          window.location.href = '/auth';
          return Promise.reject(error);
        }
      } else if (now >= expiryTime) {
        // Token sudah expired
        console.error('❌ Token expired, logging out');
        await authService.logout();
        window.location.href = '/auth';
        return Promise.reject(new Error('Token expired'));
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - handle 401/403 dari backend
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Jika 401 dan belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Coba refresh token
        await authService.refreshToken();
        const newToken = authService.getToken();
        
        // Retry request dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh gagal, logout
        console.error('❌ Refresh failed, logging out');
        await authService.logout();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    
    // Jika 403 atau 401 setelah retry, logout
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('❌ Unauthorized, logging out');
      await authService.logout();
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
