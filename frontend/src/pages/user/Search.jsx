import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Search.module.css';
import {
  Play,
  Pause,
  Album,
  User,
  Loader,
  Search as SearchIcon,
} from 'lucide-react';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';

const Search = () => {
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';

  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
  } = useMusic();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bentuk playlist siap play dari searchResults
  const playableResults = useMemo(
    () =>
      (searchResults || []).map((song) => {
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
      }),
    [searchResults]
  );

  // Search ketika ada query dari URL
  useEffect(() => {
    if (queryFromUrl) {
      performSearch(queryFromUrl);
    } else {
      setSearchResults([]);
    }
  }, [queryFromUrl]);

  const performSearch = async (searchQuery) => {
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

  // ✅ Play / Pause handler
  const handlePlay = (song, index) => {
    const targetId = song.songId || song.id;
    const currentId = currentSong?.songId || currentSong?.id;

    // Jika lagu ini adalah yang sedang main → toggle play/pause
    if (currentId && currentId === targetId) {
      togglePlay();
      return;
    }

    // Kalau lagu lain → mulai play dari lagu ini dalam queue search
    if (!playableResults || playableResults.length === 0) return;

    const foundIndex = playableResults.findIndex(
      (s) => (s.songId || s.id) === targetId
    );
    const startIndex = foundIndex >= 0 ? foundIndex : index || 0;

    playSong(playableResults[startIndex], playableResults, startIndex);
  };

  // Empty state - belum ada query
  if (!queryFromUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <SearchIcon size={64} className={styles.emptyIcon} />
          <h2>Search for Music</h2>
          <p>
            Type in the search bar above and press Enter to find songs, artists, or
            albums
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <Loader size={48} className={styles.spinner} />
          <p>Searching for "{queryFromUrl}"...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <p>Please try again</p>
        </div>
      </div>
    );
  }

  // No results
  if (searchResults.length === 0) {
    return (
      <div className={styles.container}>
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
      </div>
    );
  }

  // Results found
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Search Results for "
          <span className={styles.query}>{queryFromUrl}</span>"
        </h1>
        <p className={styles.resultCount}>
          {searchResults.length} result
          {searchResults.length !== 1 ? 's' : ''} found
        </p>
      </header>

      <div className={styles.resultsList}>
        {searchResults.map((song, index) => {
          const songId = song.songId || song.id;
          const currentId = currentSong?.songId || currentSong?.id;
          const isCurrentPlaying = currentId && currentId === songId && isPlaying;

          return (
            <div className={styles.resultCard} key={songId}>
              <div className={styles.cover}>🎵</div>
              <div className={styles.songInfo}>
                <span className={styles.songTitle}>{song.title}</span>
                <span className={styles.songArtist}>
                  <User size={13} />{' '}
                  {song.artistName ||
                    song.artist?.name ||
                    song.artist?.username ||
                    'Unknown Artist'}
                </span>
                {song.genres && song.genres.length > 0 && (
                  <span className={styles.songGenre}>
                    <Album size={13} />{' '}
                    {song.genres.map((g) => g.name || g).join(', ')}
                  </span>
                )}
              </div>
              <button
                className={`${styles.playBtn} ${
                  isCurrentPlaying ? styles.playBtnPlaying : ''
                }`}
                onClick={() => handlePlay(song, index)}
                title={isCurrentPlaying ? 'Pause' : 'Play'}
              >
                {isCurrentPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Search;
