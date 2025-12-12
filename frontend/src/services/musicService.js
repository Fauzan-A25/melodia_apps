// services/musicService.js

const API_URL = 'https://melodia-backend-production.up.railway.app/api';

export const musicService = {
  // ==================== SONG ENDPOINTS ====================

  getAllSongs: async () => {
    const response = await fetch(`${API_URL}/songs`);
    if (!response.ok) throw new Error('Failed to fetch songs');
    return await response.json();
  },

  getSongById: async (id) => {
    const response = await fetch(`${API_URL}/songs/${id}`);
    if (!response.ok) throw new Error('Song not found');
    return await response.json();
  },

  searchSongs: async (query) => {
    const response = await fetch(
      `${API_URL}/songs/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  },

  searchByTitle: async (query) => {
    const response = await fetch(
      `${API_URL}/songs/search/title?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  },

  searchByArtist: async (query) => {
    const response = await fetch(
      `${API_URL}/songs/search/artist?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    return await response.json();
  },

  filterByGenre: async (genreName) => {
    const response = await fetch(
      `${API_URL}/songs/filter/genre?name=${encodeURIComponent(genreName)}`
    );
    if (!response.ok) throw new Error('Filter failed');
    return await response.json();
  },

  filterByYear: async (year) => {
    const response = await fetch(
      `${API_URL}/songs/filter/year?year=${year}`
    );
    if (!response.ok) throw new Error('Filter failed');
    return await response.json();
  },

  getStreamUrl: (songId) => `${API_URL}/songs/stream/${songId}`,

  /**
   * Admin delete any song
   * DELETE /api/admin/songs/{songId}
   */
  adminDeleteSong: async (songId) => {
    const response = await fetch(`${API_URL}/admin/songs/${songId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete song';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  // ==================== GENRE ENDPOINTS ====================

  /**
   * Get all genres (for dropdown in upload form)
   * GET /api/genres
   */
  getAllGenres: async () => {
    const response = await fetch(`${API_URL}/genres`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      // swallow body to free stream
      await response.text().catch(() => {});
      throw new Error('Failed to fetch genres');
    }

    return await response.json();
  },

  // ==================== ARTIST SONG ENDPOINTS ====================

  /**
   * Upload new song (Artist only)
   * POST /api/artist/songs/upload
   */
  uploadSong: async (formData) => {
    const response = await fetch(`${API_URL}/artist/songs/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to upload song';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  /**
   * Delete song (Artist can only delete their own songs)
   * DELETE /api/artist/songs/{songId}?artistId={artistId}
   */
  deleteSong: async (songId, artistId) => {
    const response = await fetch(
      `${API_URL}/artist/songs/${songId}?artistId=${artistId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to delete song';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  /**
   * Get artist's uploaded songs (filter di frontend)
   * Sekarang pakai artist.artistId, bukan accountId
   */
  getArtistSongs: async (artistId) => {
    const allSongs = await musicService.getAllSongs();
    return allSongs.filter(
      (song) => song.artist && song.artist.artistId === artistId
    );
  },

  // ==================== PLAYLIST ENDPOINTS ====================

  createPlaylist: async (userId, name, description = '') => {
    const response = await fetch(`${API_URL}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, description }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to create playlist' }));
      throw new Error(errorData.message || 'Failed to create playlist');
    }

    return await response.json();
  },

  getUserPlaylists: async (userId) => {
    if (!userId) {
      return [];
    }

    if (userId.startsWith('ADM')) {
      return [];
    }

    const response = await fetch(`${API_URL}/playlists/user/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch user playlists');
    }

    return await response.json();
  },

  getPlaylistById: async (playlistId) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}`);

    if (!response.ok) {
      throw new Error('Playlist not found');
    }

    return await response.json();
  },

  updatePlaylist: async (playlistId, userId, name, description) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, description }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to update playlist' }));
      throw new Error(errorData.message || 'Failed to update playlist');
    }

    return await response.json();
  },

  deletePlaylist: async (playlistId, userId) => {
    const response = await fetch(
      `${API_URL}/playlists/${playlistId}?userId=${userId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to delete playlist' }));
      throw new Error(errorData.message || 'Failed to delete playlist');
    }

    return await response.json();
  },

  addSongToPlaylist: async (playlistId, songId, userId) => {
    const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, userId }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to add song' }));
      throw new Error(
        errorData.message || 'Failed to add song to playlist'
      );
    }

    return await response.json();
  },

  removeSongFromPlaylist: async (playlistId, songId, userId) => {
    const response = await fetch(
      `${API_URL}/playlists/${playlistId}/songs/${songId}?userId=${userId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to remove song' }));
      throw new Error(
        errorData.message || 'Failed to remove song from playlist'
      );
    }

    return await response.json();
  },

  searchPlaylists: async (query) => {
    const response = await fetch(
      `${API_URL}/playlists/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    return await response.json();
  },

  getPlaylistSongs: async (playlistId) => {
    const response = await fetch(
      `${API_URL}/playlists/${playlistId}/songs`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist songs');
    }

    return await response.json();
  },

  // ==================== HISTORY ENDPOINTS ====================

  getUserHistory: async (userId) => {
    const response = await fetch(`${API_URL}/history/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return await response.json();
  },

  getPlayedSongs: async (userId) => {
    const response = await fetch(`${API_URL}/history/${userId}/songs`);

    if (!response.ok) {
      throw new Error('Failed to fetch played songs');
    }

    return await response.json();
  },

  getRecentlyPlayedSongs: async (userId, limit = 10) => {
    if (limit <= 0) {
      throw new Error('Limit must be positive');
    }

    const response = await fetch(
      `${API_URL}/history/${userId}/songs/recent?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent songs');
    }

    return await response.json();
  },

  addSongToHistory: async (userId, songId) => {
    const response = await fetch(`${API_URL}/history/${userId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to add song to history';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  removeSongFromHistory: async (userId, songId) => {
    const response = await fetch(
      `${API_URL}/history/${userId}/songs/${songId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      let errorMessage = 'Failed to remove song from history';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  clearUserHistory: async (userId) => {
    const response = await fetch(`${API_URL}/history/${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to clear history';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  },

  checkIfSongPlayed: async (userId, songId) => {
    const response = await fetch(
      `${API_URL}/history/${userId}/songs/${songId}/played`
    );

    if (!response.ok) {
      throw new Error('Failed to check song played status');
    }

    return await response.json();
  },

  getHistorySummary: async (userId) => {
    const response = await fetch(`${API_URL}/history/${userId}/summary`);

    if (!response.ok) {
      throw new Error('Failed to fetch history summary');
    }

    return await response.json();
  },
};
