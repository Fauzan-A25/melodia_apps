const API_BASE_URL = 'https://melodia-backend-production.up.railway.app/api';

export const adminService = {
  // --- Dashboard Stats ---
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch admin stats');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Genre Management ---
  getAllGenres: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/genres`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch genres');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  createGenre: async (genreName, description) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: genreName, description }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing create genre response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  updateGenre: async (genreId, genreName, description) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres/${genreId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: genreName, description }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing update genre response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteGenre: async (genreId) => {
    const response = await fetch(`${API_BASE_URL}/admin/genres/${genreId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete genre';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing delete genre response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- User Management ---
  getAllUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getUsersByType: async (accountType) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users?type=${accountType}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch ${accountType}s`);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getBannedUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/users/banned`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch banned users');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  banUser: async (accountId, reason) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${accountId}/ban`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      },
    );

    if (!response.ok) {
      let errorMessage = 'Failed to ban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing ban user response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  unbanUser: async (accountId) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/${accountId}/unban`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) {
      let errorMessage = 'Failed to unban user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing unban user response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteUser: async (accountId) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${accountId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete user';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        console.log('Error parsing delete user response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchUsers: async (query) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/users/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
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
    const response = await fetch(`${API_BASE_URL}/admin/artists`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
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
    const response = await fetch(`${API_BASE_URL}/admin/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistName, bio }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create artist';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        console.log('Error parsing create artist response');
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
    const response = await fetch(`${API_BASE_URL}/admin/artists/${artistId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete artist';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || errorMessage;
      } catch {
        console.log('Error parsing delete artist response');
      }
      throw new Error(errorMessage);
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // --- Artist (dropdown) & Song Management ---

  getArtistsForDropdown: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/songs/artists`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch artists');
    }
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  uploadSong: async (data) => {
    const formData = new FormData();
    formData.append('audioFile', data.audioFile);
    formData.append('title', data.title);
    formData.append('artistId', data.artistId);
    formData.append('genreIds', JSON.stringify(data.genreIds));
    formData.append('releaseYear', String(data.releaseYear));
    formData.append('duration', String(data.duration));

    const response = await fetch(`${API_BASE_URL}/admin/songs/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload song';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        console.log('Error parsing upload song response');
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deleteSong: async (songId) => {
    const response = await fetch(`${API_BASE_URL}/admin/songs/${songId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete song';
      try {
        const error = await response.json();
        errorMessage = error.error || error.message || errorMessage;
      } catch {
        console.log('Error parsing delete song response');
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
