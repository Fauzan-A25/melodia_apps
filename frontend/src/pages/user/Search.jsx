import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Search.module.css';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';
import SongCard from '../../components/Music/SongCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const { playSong, currentSong, togglePlay } = useMusic();

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [searchResults, setSearchResults] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load latest songs on mount
  const loadLatestSongs = useCallback(async () => {
    try {
      setLoading(true);
      const allSongs = await musicService.getAllSongs();
      const sorted = [...allSongs].reverse(); // Latest first
      setLatestSongs(sorted);
    } catch (err) {
      console.error('Error loading latest songs:', err);
      setLatestSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLatestSongs();
  }, [loadLatestSongs]);

  // Bentuk playlist siap play
  const playableResults = useMemo(() => {
    // Jika ada query dan ada hasil search, gunakan search results
    // Jika tidak ada query, gunakan latest songs
    const songsToUse = queryFromUrl ? searchResults : latestSongs;

    return songsToUse.map((song) => {
      const songId = song.songId || song.id;

      return {
        ...song,
        songId,
        id: songId,
        title: song.title,
        artist:
          song.artist?.name ||
          song.artist?.username ||
          song.artistName ||
          song.artistUsername ||
          'Unknown Artist',
        coverEmoji: song.coverEmoji || '🎵',
        cover: song.coverEmoji || '🎵',
        audioUrl: musicService.getStreamUrl(songId),
        genres: song.genres || [],
      };
    });
  }, [searchResults, latestSongs, queryFromUrl]);

  // Search ketika ada query dari URL
  useEffect(() => {
    if (queryFromUrl) {
      setSearchQuery(queryFromUrl);
      performSearch(queryFromUrl);
    } else {
      setSearchResults([]);
    }
  }, [queryFromUrl]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const results = await musicService.searchSongs(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      console.error('Error searching songs:', err);
      setError('Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();

    if (trimmed) {
      setSearchParams({ q: trimmed });
    } else {
      setSearchParams({});
      setSearchResults([]);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear search if input is empty
    if (!value.trim()) {
      setSearchParams({});
      setSearchResults([]);
    }
  };

  // ✅ Play handler untuk SongCard
  const handlePlay = (song) => {
    const targetId = song.songId || song.id;
    const currentId = currentSong?.songId || currentSong?.id;

    // Toggle play/pause if same song
    if (currentId && currentId === targetId) {
      togglePlay();
      return;
    }

    // Play new song
    if (!playableResults || playableResults.length === 0) return;

    const foundIndex = playableResults.findIndex(
      (s) => (s.songId || s.id) === targetId
    );
    const startIndex = foundIndex >= 0 ? foundIndex : 0;

    playSong(playableResults[startIndex], playableResults, startIndex);
  };

  // ✅ Logic baru
  const isSearching = queryFromUrl && queryFromUrl.trim() !== '';
  const hasSearchResults = isSearching && searchResults.length > 0;
  const noSearchResults = isSearching && searchResults.length === 0;
  const showLatestSongs = !isSearching && latestSongs.length > 0;

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <h1 className={styles.mainTitle}>Find it!</h1>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <div className={styles.searchInputWrapper}>
            <SearchIcon size={20} className={styles.searchInputIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search some music..."
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>
        </form>
      </div>

      {/* Results Header */}
      {(hasSearchResults || showLatestSongs) && (
        <header className={styles.header}>
          <h2 className={styles.title}>
            {isSearching ? (
              <span className={styles.query}>{queryFromUrl}</span>
            ) : (
              'Latest Songs'
            )}
          </h2>
          <p className={styles.subtitle}>
            {isSearching
              ? 'do you find what you looking for?'
              : 'Discover the newest music additions'}
          </p>
        </header>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingState}>
          <Loader size={48} className={styles.spinner} />
          <p>
            {isSearching
              ? `Searching for "${queryFromUrl}"...`
              : 'Loading songs...'}
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <p>Please try again</p>
        </div>
      )}

      {/* No Results - hanya tampil saat search tidak ketemu */}
      {noSearchResults && !loading && (
        <div className={styles.noResults}>
          <SearchIcon size={64} className={styles.emptyIcon} />
          <h2>No results found</h2>
          <p>
            We couldn't find any results for "
            <strong>{queryFromUrl}</strong>"
          </p>
          <p className={styles.hint}>
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Results Grid - tampil saat ada search results ATAU latest songs */}
      {!loading && (hasSearchResults || showLatestSongs) && (
        <div className={styles.resultsGrid}>
          {playableResults.map((track) => (
            <SongCard
              key={track.songId || track.id}
              track={{
                id: track.songId || track.id,
                songId: track.songId || track.id,
                title: track.title,
                artist: track.artist,
                cover: track.cover || track.coverEmoji || '🎵',
                coverEmoji: track.coverEmoji || '🎵',
                duration: track.duration,
                audioUrl: track.audioUrl,
              }}
              onPlay={() => handlePlay(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
