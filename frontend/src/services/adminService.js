import { api } from './api';

export const adminService = {
  // --- Dashboard Stats ---
  getStats: async () => {
    const response = await api.get('/admin/stats');
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Song Management ---
  getAllSongs: async () => {
    const response = await api.get('/songs');
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Genre Management ---
  getAllGenres: async () => {
    const response = await api.get('/admin/genres');
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  createGenre: async (genreName, description = '') => {
    const baseUrl = await api.getURL();
    const params = new URLSearchParams({ name: genreName });
    if (description && description.trim()) {
      params.append('description', description.trim());
    }
    const response = await fetch(
      `${baseUrl}/admin/genres?${params.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to create genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  updateGenre: async (genreId, genreName, description = '') => {
    const baseUrl = await api.getURL();
    const params = new URLSearchParams({ newName: genreName });
    if (description && description.trim()) {
      params.append('description', description.trim());
    }
    const response = await fetch(
      `${baseUrl}/admin/genres/${genreId}?${params.toString()}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to update genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteGenre: async (genreId) => {
    const response = await api.delete(`/admin/genres/${genreId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- User Management ---
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getUsersByType: async (accountType) => {
    const response = await api.get(
      `/admin/users?type=${accountType}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${accountType}s`);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getBannedUsers: async () => {
    const response = await api.get('/admin/users/banned');
    if (!response.ok) {
      throw new Error('Failed to fetch banned users');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  banUser: async (accountId, reason) => {
    const response = await api.put(
      `/admin/users/${accountId}/ban?reason=${encodeURIComponent(reason)}`,
      {}
    );

    if (!response.ok) {
      let errorMessage = 'Failed to ban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  unbanUser: async (accountId) => {
    const response = await api.put(
      `/admin/users/${accountId}/unban`,
      {}
    );

    if (!response.ok) {
      let errorMessage = 'Failed to unban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteUser: async (accountId) => {
    const response = await api.delete(`/admin/users/${accountId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchUsers: async (query) => {
    const response = await api.get(
      `/admin/users/search?keyword=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error('Failed to search users');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Artist Management (metadata) ---
  /**
   * GET /api/admin/artists
   */
  getAllArtists: async () => {
    const response = await api.get('/admin/artists');
    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * POST /api/admin/artists
   * body: { artistName, bio }
   */
  createArtist: async (artistName, bio = '') => {
    const response = await api.post('/admin/artists', {
      artistName,
      bio
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create artist';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * DELETE /api/admin/artists/{artistId}
   */
  deleteArtist: async (artistId) => {
    const response = await api.delete(`/admin/artists/${artistId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete artist';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Search artists by keyword (name or bio)
   * GET /api/admin/artists/search?keyword={keyword}
   */
  searchArtists: async (keyword) => {
    const response = await api.get(
      `/admin/artists/search?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
      let errorMessage = 'Failed to search artists';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Artist (dropdown) & Song Management ---

  getArtistsForDropdown: async () => {
    const response = await api.get('/admin/songs/artists');
    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  uploadSong: async (data) => {
    const baseUrl = await api.getURL();
    const formData = new FormData();
    formData.append('audioFile', data.audioFile);
    formData.append('title', data.title);
    formData.append('artistId', data.artistId);
    formData.append('genreIds', JSON.stringify(data.genreIds));
    formData.append('releaseYear', String(data.releaseYear));
    
    // ✅ Validate and sanitize duration - use 0 as default if invalid
    const duration = (typeof data.duration === 'number' && data.duration > 0) 
      ? data.duration 
      : 0;
    formData.append('duration', String(duration));

    const response = await fetch(`${baseUrl}/admin/songs/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload song';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteSong: async (songId) => {
    const response = await api.delete(`/admin/songs/${songId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete song';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        // Error parsing response
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },
};

// ==================== HELPER FUNCTION ====================
export const handleApiError = (error) => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};