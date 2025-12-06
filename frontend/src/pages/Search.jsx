import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Search.module.css';
import { Play, Album, User, Loader, Search as SearchIcon } from 'lucide-react';
import { musicService } from '../services/musicService';

const Search = () => {
  const [searchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Search ketika ada query dari URL
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

  const handlePlay = (song) => {
    console.log('Playing:', song.title);
  };

  // ✅ Empty state - belum ada query
  if (!queryFromUrl) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <SearchIcon size={64} className={styles.emptyIcon} />
          <h2>Search for Music</h2>
          <p>Type in the search bar above and press Enter to find songs, artists, or albums</p>
        </div>
      </div>
    );
  }

  // ✅ Loading state
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

  // ✅ Error state
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

  // ✅ No results
  if (searchResults.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noResults}>
          <SearchIcon size={64} className={styles.emptyIcon} />
          <h2>No results found</h2>
          <p>We couldn't find any results for "<strong>{queryFromUrl}</strong>"</p>
          <p className={styles.hint}>Try different keywords or check your spelling</p>
        </div>
      </div>
    );
  }

  // ✅ Results found
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Search Results for "<span className={styles.query}>{queryFromUrl}</span>"
        </h1>
        <p className={styles.resultCount}>
          {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
        </p>
      </header>

      <div className={styles.resultsList}>
        {searchResults.map(song => (
          <div className={styles.resultCard} key={song.songId}>
            <div className={styles.cover}>🎵</div>
            <div className={styles.songInfo}>
              <span className={styles.songTitle}>{song.title}</span>
              <span className={styles.songArtist}>
                <User size={13} /> {song.artistName}
              </span>
              {song.genres && song.genres.length > 0 && (
                <span className={styles.songGenre}>
                  <Album size={13} /> {song.genres.map(g => g.name).join(', ')}
                </span>
              )}
            </div>
            <button 
              className={styles.playBtn}
              onClick={() => handlePlay(song)}
              title="Play song"
            >
              <Play size={20} fill="currentColor" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
