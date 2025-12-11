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

  getStreamUrl: (songId) => {
    return `${API_URL}/songs/stream/${songId}`;
  },
  
  /**
   * Admin delete any song
   * DELETE /api/admin/songs/{songId}
   */
  adminDeleteSong: async (songId) => {
    try {
      const response = await fetch(
        `${API_URL}/admin/songs/${songId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
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
    } catch (error) {
      console.error('Error deleting song (admin):', error);
      throw error;
    }
  },


  // ==================== GENRE ENDPOINTS ====================

  /**
   * Get all genres (for dropdown in upload form)
   * GET /api/genres
   */
  getAllGenres: async () => {
    try {
      const response = await fetch(`${API_URL}/genres`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Genres HTTP status:', response.status);
        const text = await response.text();
        console.error('Genres response body:', text);
        throw new Error('Failed to fetch genres');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  },

  // ==================== ARTIST SONG ENDPOINTS ====================

  /**
   * Upload new song (Artist only)
   * POST /api/artist/songs/upload
   * @param {FormData} formData - Must contain: audioFile, title, genreId, releaseYear, duration, artistId
   */
  uploadSong: async (formData) => {
    try {
      const response = await fetch(`${API_URL}/artist/songs/upload`, {
        method: 'POST',
        body: formData, // Browser will set Content-Type automatically
      });

      if (!response.ok) {
        // Kadang backend kirim plain text, jadi aman pakai try-catch
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
    } catch (error) {
      console.error('Error uploading song:', error);
      throw error;
    }
  },

  /**
   * Delete song (Artist can only delete their own songs)
   * DELETE /api/artist/songs/{songId}?artistId={artistId}
   */
  deleteSong: async (songId, artistId) => {
    try {
      const response = await fetch(
        `${API_URL}/artist/songs/${songId}?artistId=${artistId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
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
    } catch (error) {
      console.error('Error deleting song:', error);
      throw error;
    }
  },

  /**
   * Get artist's uploaded songs (filter di frontend)
   */
  getArtistSongs: async (artistId) => {
    try {
      const allSongs = await musicService.getAllSongs();
      return allSongs.filter(
        (song) => song.artist && song.artist.accountId === artistId
      );
    } catch (error) {
      console.error('Error fetching artist songs:', error);
      throw error;
    }
  },

  // ==================== PLAYLIST ENDPOINTS ====================

  /**
   * Create new playlist
   * POST /api/playlists
   */
  createPlaylist: async (userId, name, description = '') => {
    try {
      const response = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create playlist' }));
        throw new Error(errorData.message || 'Failed to create playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  },

  /**
   * Get all playlists by user
   * GET /api/playlists/user/{userId}
   */
  /**
   * Get all playlists by user
   * GET /api/playlists/user/{userId}
   */
  getUserPlaylists: async (userId) => {
    try {
      // ✅ VALIDATION: Cek apakah userId valid dan bukan admin
      if (!userId) {
        console.warn('getUserPlaylists: No userId provided');
        return [];
      }

      // ✅ SKIP untuk admin (ID dimulai dengan ADM)
      if (userId.startsWith('ADM')) {
        console.warn('getUserPlaylists: Skipping for admin user');
        return [];
      }

      console.log('Fetching playlists for userId:', userId);
      const response = await fetch(`${API_URL}/playlists/user/${userId}`);
      
      if (!response.ok) {
        // ✅ Handle 404 gracefully (user belum punya playlist)
        if (response.status === 404) {
          console.log('No playlists found for user (404)');
          return [];
        }
        throw new Error('Failed to fetch user playlists');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user playlists:', error);
      // ✅ Return empty array instead of throwing
      return [];
    }
  },

  /**
   * Get playlist by ID
   * GET /api/playlists/{playlistId}
   */
  getPlaylistById: async (playlistId) => {
    try {
      const response = await fetch(`${API_URL}/playlists/${playlistId}`);
      
      if (!response.ok) {
        throw new Error('Playlist not found');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching playlist:', error);
      throw error;
    }
  },

  /**
   * Update playlist (name, description)
   * PUT /api/playlists/{playlistId}
   */
  updatePlaylist: async (playlistId, userId, name, description) => {
    try {
      const response = await fetch(`${API_URL}/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update playlist' }));
        throw new Error(errorData.message || 'Failed to update playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating playlist:', error);
      throw error;
    }
  },

  /**
   * Delete playlist
   * DELETE /api/playlists/{playlistId}?userId={userId}
   */
  deletePlaylist: async (playlistId, userId) => {
    try {
      const response = await fetch(
        `${API_URL}/playlists/${playlistId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete playlist' }));
        throw new Error(errorData.message || 'Failed to delete playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  },

  /**
   * Add song to playlist
   * POST /api/playlists/{playlistId}/songs
   */
  addSongToPlaylist: async (playlistId, songId, userId) => {
    try {
      const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to add song' }));
        throw new Error(errorData.message || 'Failed to add song to playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      throw error;
    }
  },

  /**
   * Remove song from playlist
   * DELETE /api/playlists/{playlistId}/songs/{songId}?userId={userId}
   */
  removeSongFromPlaylist: async (playlistId, songId, userId) => {
    try {
      const response = await fetch(
        `${API_URL}/playlists/${playlistId}/songs/${songId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to remove song' }));
        throw new Error(errorData.message || 'Failed to remove song from playlist');
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      throw error;
    }
  },

  /**
   * Search playlists by name
   * GET /api/playlists/search?query={query}
   */
  searchPlaylists: async (query) => {
    try {
      const response = await fetch(
        `${API_URL}/playlists/search?query=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw error;
    }
  },

  /**
   * Get all songs in a playlist
   * GET /api/playlists/{playlistId}/songs
   */
  getPlaylistSongs: async (playlistId) => {
    try {
      const response = await fetch(`${API_URL}/playlists/${playlistId}/songs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist songs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      throw error;
    }
  },

  // ==================== HISTORY ENDPOINTS ====================

  /**
   * Get user history info
   * GET /api/history/{userId}
   * Returns summary even if history is empty
   */
  getUserHistory: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/history/${userId}`);
      
      // ✅ Always succeeds (returns empty summary if no history)
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  },

  /**
   * Get all played songs
   * GET /api/history/{userId}/songs
   * Returns empty list if no history, not 404
   */
  getPlayedSongs: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/history/${userId}/songs`);
      
      // ✅ Always succeeds (returns empty list if no history)
      if (!response.ok) {
        throw new Error('Failed to fetch played songs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching played songs:', error);
      throw error;
    }
  },

  /**
   * Get recently played songs
   * GET /api/history/{userId}/songs/recent?limit=10
   */
  getRecentlyPlayedSongs: async (userId, limit = 10) => {
    try {
      if (limit <= 0) {
        throw new Error('Limit must be positive');
      }
      
      const response = await fetch(
        `${API_URL}/history/${userId}/songs/recent?limit=${limit}`
      );
      
      // ✅ Always succeeds (returns empty list if no history)
      if (!response.ok) {
        throw new Error('Failed to fetch recent songs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recently played songs:', error);
      throw error;
    }
  },

  /**
   * Add song to history (when user plays a song)
   * POST /api/history/{userId}/songs
   * Body: { songId }
   */
  addSongToHistory: async (userId, songId) => {
    try {
      const response = await fetch(`${API_URL}/history/${userId}/songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
        }),
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
    } catch (error) {
      console.error('Error adding song to history:', error);
      throw error;
    }
  },

  /**
   * Remove song from history
   * DELETE /api/history/{userId}/songs/{songId}
   */
  removeSongFromHistory: async (userId, songId) => {
    try {
      const response = await fetch(
        `${API_URL}/history/${userId}/songs/${songId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
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
    } catch (error) {
      console.error('Error removing song from history:', error);
      throw error;
    }
  },

  /**
   * Clear all history
   * DELETE /api/history/{userId}
   * Success even if history doesn't exist (idempotent)
   */
  clearUserHistory: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/history/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // ✅ Always succeeds (idempotent operation)
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
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },

  /**
   * Check if song has been played
   * GET /api/history/{userId}/songs/{songId}/played
   */
  checkIfSongPlayed: async (userId, songId) => {
    try {
      const response = await fetch(
        `${API_URL}/history/${userId}/songs/${songId}/played`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check song played status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking if song played:', error);
      throw error;
    }
  },

  /**
   * Get history summary (for dashboard)
   * GET /api/history/{userId}/summary
   */
  getHistorySummary: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/history/${userId}/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch history summary');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching history summary:', error);
      throw error;
    }
  },
};
