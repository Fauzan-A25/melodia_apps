/**
 * Application Constants for Melodia
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_TIMEOUT = 15000; // 15 seconds

// Audio Player Constants
export const AUDIO_FORMATS = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
export const MAX_VOLUME = 100;
export const MIN_VOLUME = 0;
export const DEFAULT_VOLUME = 70;

// Playlist Constants
export const MAX_PLAYLIST_NAME_LENGTH = 50;
export const MAX_TRACKS_PER_PLAYLIST = 500;

// Search Constants
export const MIN_SEARCH_QUERY_LENGTH = 2;
export const SEARCH_DEBOUNCE_DELAY = 300; // milliseconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'melodia_auth_token',
  USER_DATA: 'melodia_user_data',
  VOLUME: 'melodia_volume',
  PLAYBACK_POSITION: 'melodia_playback_position',
  CURRENT_TRACK: 'melodia_current_track',
  QUEUE: 'melodia_queue',
  THEME: 'melodia_theme',
};

// Player States
export const PLAYER_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LOADING: 'loading',
  ERROR: 'error',
};

// Repeat Modes
export const REPEAT_MODES = {
  OFF: 'off',
  ONE: 'one',
  ALL: 'all',
};

// Theme Colors
export const THEME_COLORS = {
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  secondary: '#6366f1',
  background: '#0a0e27',
  backgroundSecondary: '#1a1f3a',
  cardBackground: 'rgba(15, 23, 42, 0.6)',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  border: 'rgba(59, 130, 246, 0.2)',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  TRACK_NOT_FOUND: 'Track not found.',
  PLAYLIST_NOT_FOUND: 'Playlist not found.',
  INVALID_INPUT: 'Invalid input. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRACK_ADDED: 'Track added to playlist',
  PLAYLIST_CREATED: 'Playlist created successfully',
  PLAYLIST_DELETED: 'Playlist deleted successfully',
  TRACK_LIKED: 'Track added to favorites',
  TRACK_UNLIKED: 'Track removed from favorites',
};

// Routes
export const ROUTES = {
  HOME: '/home',
  SEARCH: '/search',
  LIBRARY: '/library',
  PLAYLIST: '/playlist',
  HISTORY: '/history',
  AUTH: '/auth',
  LOGIN: '/login',
  REGISTER: '/register',
};
