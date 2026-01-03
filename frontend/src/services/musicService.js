// services/musicService.js
import { api } from './api';

export const musicService = {
  // ==================== SONG ENDPOINTS ====================

  getAllSongs: async () => {
    const response = await api.get('/songs');
    if (!response.ok) throw new Error('Failed to fetch songs');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getSongById: async (id) => {
    const response = await api.get(`/songs/${id}`);
    if (!response.ok) throw new Error('Song not found');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchSongs: async (query) => {
    const response = await api.get(
      `/songs/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchByTitle: async (query) => {
    const response = await api.get(
      `/songs/search/title?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchByArtist: async (query) => {
    const response = await api.get(
      `/songs/search/artist?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Search failed');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  filterByGenre: async (genreName) => {
    const response = await api.get(
      `/songs/filter/genre?name=${encodeURIComponent(genreName)}`
    );
    if (!response.ok) throw new Error('Filter failed');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  filterByYear: async (year) => {
    const response = await api.get(
      `/songs/filter/year?year=${year}`
    );
    if (!response.ok) throw new Error('Filter failed');
    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getStreamUrl: async () => {
    const baseUrl = await api.getURL();
    return (songId) => `${baseUrl}/songs/stream/${songId}`;
  },

  // ==================== PLAYLIST ENDPOINTS ====================

  createPlaylist: async (userId, name, description = '') => {
    const response = await api.post('/playlists', { userId, name, description });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to create playlist' }));
      throw new Error(errorData.message || 'Failed to create playlist');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getUserPlaylists: async (userId) => {
    if (!userId) {
      return [];
    }

    if (userId.startsWith('ADM')) {
      return [];
    }

    const response = await api.get(`/playlists/user/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error('Failed to fetch user playlists');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getPlaylistById: async (playlistId) => {
    const response = await api.get(`/playlists/${playlistId}`);

    if (!response.ok) {
      throw new Error('Playlist not found');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  updatePlaylist: async (playlistId, userId, name, description) => {
    const response = await api.put(`/playlists/${playlistId}`, {
      userId, name, description
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to update playlist' }));
      throw new Error(errorData.message || 'Failed to update playlist');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  deletePlaylist: async (playlistId, userId) => {
    const response = await api.delete(
      `/playlists/${playlistId}?userId=${userId}`
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to delete playlist' }));
      throw new Error(errorData.message || 'Failed to delete playlist');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  addSongToPlaylist: async (playlistId, songId, userId) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, {
      songId, userId
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to add song' }));
      throw new Error(
        errorData.message || 'Failed to add song to playlist'
      );
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  removeSongFromPlaylist: async (playlistId, songId, userId) => {
    const response = await api.delete(
      `/playlists/${playlistId}/songs/${songId}?userId=${userId}`
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Failed to remove song' }));
      throw new Error(
        errorData.message || 'Failed to remove song from playlist'
      );
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  searchPlaylists: async (query) => {
    const response = await api.get(
      `/playlists/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getPlaylistSongs: async (playlistId) => {
    const response = await api.get(
      `/playlists/${playlistId}/songs`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch playlist songs');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // ==================== HISTORY ENDPOINTS ====================

  getUserHistory: async (userId) => {
    const response = await api.get(`/history/${userId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getPlayedSongs: async (userId) => {
    const response = await api.get(`/history/${userId}/songs`);

    if (!response.ok) {
      throw new Error('Failed to fetch played songs');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getRecentlyPlayedSongs: async (userId, limit = 10) => {
    if (limit <= 0) {
      throw new Error('Limit must be positive');
    }

    const response = await api.get(
      `/history/${userId}/songs/recent?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent songs');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  addSongToHistory: async (userId, songId) => {
    const response = await api.post(`/history/${userId}/songs`, {
      songId
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

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  removeSongFromHistory: async (userId, songId) => {
    const response = await api.delete(
      `/history/${userId}/songs/${songId}`
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

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  clearUserHistory: async (userId) => {
    const response = await api.delete(`/history/${userId}`);

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

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  checkIfSongPlayed: async (userId, songId) => {
    const response = await api.get(
      `/history/${userId}/songs/${songId}/played`
    );

    if (!response.ok) {
      throw new Error('Failed to check song played status');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  getHistorySummary: async (userId) => {
    const response = await api.get(`/history/${userId}/summary`);

    if (!response.ok) {
      throw new Error('Failed to fetch history summary');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  // ==================== ALBUM ENDPOINTS ====================

  /**
   * Get all albums (for home page)
   * GET /api/albums
   */
  getAllAlbums: async () => {
    const response = await api.get(`/albums`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch albums';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Get album by ID (for album detail page)
   * GET /api/albums/{albumId}
   */
  getAlbumById: async (albumId) => {
    const response = await api.get(`/albums/${albumId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch album';
      if (response.status === 404) {
        errorMessage = 'Album not found';
      } else {
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Get all songs in an album (for music player)
   * GET /api/albums/{albumId}/songs
   */
  getAlbumSongs: async (albumId) => {
    const response = await api.get(`/albums/${albumId}/songs`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch album songs';
      if (response.status === 404) {
        errorMessage = 'Album not found';
      } else {
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMessage = errorData.message;
        } catch {
          const text = await response.text();
          if (text) errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Get albums by artist
   * GET /api/albums/artist/{artistId}
   */
  getAlbumsByArtist: async (artistId) => {
    const response = await api.get(`/albums/artist/${artistId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch artist albums';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Search albums by title
   * GET /api/albums/search?title={query}
   */
  searchAlbums: async (query) => {
    const response = await api.get(
      `/albums/search?title=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      let errorMessage = 'Album search failed';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Filter albums by genre
   * GET /api/albums/genre/{genreName}
   */
  filterAlbumsByGenre: async (genreName) => {
    const response = await api.get(
      `/albums/genre/${encodeURIComponent(genreName)}`
    );

    if (!response.ok) {
      let errorMessage = 'Failed to filter albums by genre';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Filter albums by release year
   * GET /api/albums/year/{year}
   */
  filterAlbumsByYear: async (year) => {
    const response = await api.get(`/albums/year/${year}`);

    if (!response.ok) {
      let errorMessage = 'Failed to filter albums by year';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Create new album
   * POST /api/albums?title={title}&artistId={artistId}&releaseYear={year}&genreNames={genres}
   */
  createAlbum: async (title, artistId, releaseYear, genreNames = []) => {
    const params = new URLSearchParams({
      title,
      artistId,
      releaseYear: releaseYear.toString(),
    });

    // ✅ Add multiple genreNames
    if (genreNames && genreNames.length > 0) {
      genreNames.forEach(genre => params.append('genreNames', genre));
    }

    const response = await api.post(`/albums?${params.toString()}`, {});

    if (!response.ok) {
      let errorMessage = 'Failed to create album';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Update album
   * PUT /api/albums/{albumId}?title={newTitle}&releaseYear={newYear}
   */
  updateAlbum: async (albumId, title = null, releaseYear = null) => {
    const params = new URLSearchParams();

    if (title && title.trim()) params.append('title', title);
    if (releaseYear) params.append('releaseYear', releaseYear.toString());

    const response = await api.put(
      `/albums/${albumId}?${params.toString()}`, {}
    );

    if (!response.ok) {
      let errorMessage = 'Failed to update album';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Delete album
   * DELETE /api/albums/{albumId}
   */
  deleteAlbum: async (albumId) => {
    const response = await api.delete(`/albums/${albumId}`);

    if (!response.ok) {
      let errorMessage = 'Failed to delete album';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    // ✅ Handle 204 No Content response
    if (response.status === 204) {
      return { message: 'Album deleted successfully' };
    }

    const responseBody = await response.json();
    try {
      return responseBody.data || responseBody;
    } catch {
      return { message: 'Album deleted successfully' };
    }
  },

  /**
   * Add song to album
   * POST /api/albums/{albumId}/songs/{songId}
   */
  addSongToAlbum: async (albumId, songId) => {
    const response = await api.post(
      `/albums/${albumId}/songs/${songId}`, {}
    );

    if (!response.ok) {
      let errorMessage = 'Failed to add song to album';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    // ✅ Return response data or default message
    const responseBody = await response.json();
    try {
      return responseBody.data || responseBody;
    } catch {
      return { message: 'Song added to album successfully' };
    }
  },

  /**
   * Remove song from album
   * DELETE /api/albums/{albumId}/songs/{songId}
   */
  removeSongFromAlbum: async (albumId, songId) => {
    const response = await api.delete(
      `/albums/${albumId}/songs/${songId}`
    );

    if (!response.ok) {
      let errorMessage = 'Failed to remove song from album';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    // ✅ Return response data or default message
    const responseBody = await response.json();
    try {
      return responseBody.data || responseBody;
    } catch {
      return { message: 'Song removed from album successfully' };
    }
  },

  // ==================== ALBUM STATISTICS ====================

  /**
   * Get total albums count
   * GET /api/albums/stats/count
   */
  getAlbumsCount: async () => {
    const response = await api.get(`/albums/stats/count`);

    if (!response.ok) {
      throw new Error('Failed to fetch albums count');
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },

  /**
   * Get total songs in album
   * GET /api/albums/{albumId}/stats/songs
   */
  getAlbumSongCount: async (albumId) => {
    const response = await api.get(`/albums/${albumId}/stats/songs`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch song count';
      try {
        const errorData = await response.json();
        if (errorData?.message) errorMessage = errorData.message;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    const responseBody = await response.json();
    return responseBody.data || responseBody;
  },
};
