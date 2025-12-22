// context/MusicContext.jsx
import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  // ==================== LIBRARY & PLAYLISTS ====================
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // ==================== PLAYER STATE ====================
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'one', 'all'
  const [isShuffled, setIsShuffled] = useState(false);

  // ==================== LIBRARY METHODS ====================

  const addToLibrary = useCallback((track) => {
    setLibrary((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      if (exists) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromLibrary = useCallback((trackId) => {
    setLibrary((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  // ==================== PLAYLIST METHODS ====================

  const createPlaylist = useCallback((name, description = '') => {
    const newPlaylist = {
      id: Date.now(),
      name,
      description,
      tracks: [],
      createdAt: new Date().toISOString(),
      cover: '🎵',
      color: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

  const addToPlaylist = useCallback((playlistId, track) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          const exists = playlist.tracks.find((t) => t.id === track.id);
          if (exists) return playlist;
          return {
            ...playlist,
            tracks: [...playlist.tracks, track],
          };
        }
        return playlist;
      }),
    );
  }, []);

  const removeFromPlaylist = useCallback((playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            tracks: playlist.tracks.filter((t) => t.id !== trackId),
          };
        }
        return playlist;
      }),
    );
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
  }, []);

  const updatePlaylist = useCallback((playlistId, updates) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return { ...playlist, ...updates };
        }
        return playlist;
      }),
    );
  }, []);

  const getPlaylistById = useCallback(
    (playlistId) => {
      return playlists.find((p) => p.id === playlistId) || null;
    },
    [playlists],
  );

  // ==================== FAVORITES METHODS ====================

  const addToFavorites = useCallback((track) => {
    setFavorites((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      if (exists) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromFavorites = useCallback((trackId) => {
    setFavorites((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const toggleFavorite = useCallback((track) => {
    setFavorites((prev) => {
      const exists = prev.find((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [...prev, track];
    });
  }, []);

  const isFavorite = useCallback(
    (trackId) => {
      return favorites.some((t) => t.id === trackId);
    },
    [favorites],
  );

  // ==================== HISTORY METHODS ====================

  const addToHistory = useCallback((track) => {
    const historyEntry = {
      ...track,
      playedAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const filtered = prev.filter((t) => t.id !== track.id);
      return [historyEntry, ...filtered].slice(0, 50);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // ==================== SEARCH ====================

  const searchTracks = useCallback(
    (query) => {
      if (!query || query.length < 2) return [];
      const lowerQuery = query.toLowerCase();
      return library.filter(
        (track) =>
          track.title.toLowerCase().includes(lowerQuery) ||
          track.artist.toLowerCase().includes(lowerQuery) ||
          track.album?.toLowerCase().includes(lowerQuery),
      );
    },
    [library],
  );

  // ==================== PLAYER METHODS ====================

  const playSong = useCallback(
    (song, songList = [], index = 0) => {
      setCurrentSong(song);
      setQueue(songList);
      setCurrentIndex(index);
      setIsPlaying(true);
      addToHistory(song);
    },
    [addToHistory],
  );

  const playNext = useCallback(
    () => {
      if (!queue || queue.length === 0) {
        return;
      }

      if (repeatMode === 'one') {
        // Dengan audio.loop di PlayerBar, tidak perlu berubah lagu
        return;
      }

      let nextIndex = currentIndex;

      if (isShuffled && queue.length > 1) {
        let randomIndex = currentIndex;
        while (randomIndex === currentIndex) {
          randomIndex = Math.floor(Math.random() * queue.length);
        }
        nextIndex = randomIndex;
      } else if (currentIndex < queue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }

      setCurrentIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      addToHistory(queue[nextIndex]);
    },
    [currentIndex, queue, repeatMode, isShuffled, addToHistory],
  );

  const playPrevious = useCallback(
    () => {
      if (!queue || queue.length === 0) {
        return;
      }

      if (currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        setCurrentSong(queue[prevIndex]);
        addToHistory(queue[prevIndex]);
      } else if (repeatMode === 'all') {
        const lastIndex = queue.length - 1;
        setCurrentIndex(lastIndex);
        setCurrentSong(queue[lastIndex]);
        addToHistory(queue[lastIndex]);
      }
    },
    [currentIndex, queue, repeatMode, addToHistory],
  );

  const stopMusic = useCallback(() => {
    setCurrentSong(null);
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  // ✅ NEW: Get current queue information
  const getCurrentQueue = useCallback(() => {
    return {
      currentSong,
      currentIndex,
      queue,
      totalSongs: queue.length,
      remainingSongs: queue.slice(currentIndex + 1),
      previousSongs: queue.slice(0, currentIndex),
    };
  }, [currentSong, currentIndex, queue]);

  // ==================== MEMOIZED VALUE ====================

  const value = useMemo(
    () => ({
      // Library & Playlists
      library,
      playlists,
      history,
      favorites,
      addToLibrary,
      removeFromLibrary,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      updatePlaylist,
      getPlaylistById,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      addToHistory,
      clearHistory,
      searchTracks,

      // Player State
      currentSong,
      queue,
      currentIndex,
      isPlaying,
      volume,
      isMuted,
      repeatMode,
      isShuffled,

      // Player Controls
      playSong,
      playNext,
      playPrevious,
      stopMusic,
      togglePlay,
      changeVolume,
      toggleMute,
      toggleRepeat,
      toggleShuffle,
      addToQueue,
      clearQueue,
      setIsPlaying,
      getCurrentQueue, // ✅ Export this method
    }),
    [
      library,
      playlists,
      history,
      favorites,
      currentSong,
      queue,
      currentIndex,
      isPlaying,
      volume,
      isMuted,
      repeatMode,
      isShuffled,
      addToLibrary,
      removeFromLibrary,
      createPlaylist,
      addToPlaylist,
      removeFromPlaylist,
      deletePlaylist,
      updatePlaylist,
      getPlaylistById,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      addToHistory,
      clearHistory,
      searchTracks,
      playSong,
      playNext,
      playPrevious,
      stopMusic,
      togglePlay,
      changeVolume,
      toggleMute,
      toggleRepeat,
      toggleShuffle,
      addToQueue,
      clearQueue,
      getCurrentQueue, // ✅ Add to dependencies
    ],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

/**
 * Custom hook to use music context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};

// Alias untuk backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export const useMusicContext = useMusic;
// eslint-disable-next-line react-refresh/only-export-components
export const usePlayerContext = useMusic;
