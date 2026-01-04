// pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { Loader, Play, Pause } from 'lucide-react';
import styles from './Home.module.css';
import AlbumCard from '../../components/Music/AlbumCard';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';
import { useUser } from '../../context/UserContext';

const Home = () => {
  // eslint-disable-next-line no-unused-vars
  const { playSong, pauseSong, currentSong, isPlaying } = useMusic();
  const { user, loading: authLoading } = useUser();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Albums
      try {
        setAlbumsLoading(true);
        const allAlbums = await musicService.getAllAlbums();

        const mappedAlbums = allAlbums.map((album) => ({
          ...album,
          artistName:
            album.artist?.name ||
            album.artistName ||
            album.artistUsername ||
            album.artist?.username ||
            'Unknown Artist',
          artistId: album.artist?.artistId || album.artistId || null,
          songCount: album.songCount || album.songs?.length || 0,
        }));

        const sortedAlbums = [...mappedAlbums].sort(
          (a, b) => (b.releaseYear || 0) - (a.releaseYear || 0)
        );
        setAlbums(sortedAlbums);
      } catch (e) {
        console.error('Failed to load albums:', e);
        setAlbums([]);
      } finally {
        setAlbumsLoading(false);
      }

      // Recently Played
      const effectiveUserId =
        user?.accountId ||
        localStorage.getItem('userId') ||
        localStorage.getItem('accountId');

      if (!effectiveUserId) {
        setRecentlyPlayed([]);
        setHistoryLoading(false);
      } else {
        try {
          const historyResp = await musicService.getRecentlyPlayedSongs(
            effectiveUserId,
            6
          );
          const songs =
            historyResp.songs ||
            historyResp.recentSongs ||
            historyResp ||
            [];
          
          // ✅ FIX: Normalize songs data
          const normalizedSongs = songs.map(song => ({
            ...song,
            id: song.songId || song.id,
            songId: song.songId || song.id,
            // ✅ FIX: Extract artist name as STRING
            artistName: typeof song.artist === 'object' 
              ? (song.artist?.name || song.artist?.artistName || song.artist?.username || 'Unknown Artist')
              : (song.artist || song.artistName || 'Unknown Artist')
          }));
          

          setRecentlyPlayed(normalizedSongs);
        } catch (e) {
          console.error('Failed to load recently played:', e);
          setRecentlyPlayed([]);
        } finally {
          setHistoryLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, loadData]);

  const isTrackPlaying = useCallback((track) => {
    if (!currentSong || !isPlaying) return false;
    return currentSong?.songId === track?.id && isPlaying;
  }, [currentSong, isPlaying]);

  const handlePlay = useCallback((track) => {
    if (!track || !track.id) {
      return;
    }
    
    playSong(track, recentlyPlayed, recentlyPlayed.findIndex(t => t.id === track.id));
  }, [playSong, recentlyPlayed]);

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size={48} className={styles.spinner} />
        <p>Loading your music...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button onClick={loadData} className={styles.retryBtn}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      {/* Listen Again */}
      {!historyLoading && recentlyPlayed.length > 0 && (
        <section className={styles.heroSection}>
          <h2 className={styles.heroTitle}>Listen Again</h2>
          <div className={styles.heroScroll}>
            {recentlyPlayed.map((track) => {
              const playing = isTrackPlaying(track);

              return (
                <div 
                  key={track.id || track.songId} 
                  className={styles.heroCard}
                  onClick={() => handlePlay(track)}
                >
                  <div
                    className={`${styles.heroCardInner} ${
                      playing ? styles.heroCardPlaying : ''
                    }`}
                  >
                    <div className={styles.heroCover}>
                      <span className={styles.heroCoverEmoji}>
                        {track.coverEmoji || track.cover || '🎵'}
                      </span>
                    </div>
                    <div className={styles.heroInfo}>
                      <h3 className={styles.heroTrackTitle}>{track.title}</h3>
                      {/* ✅ FIX: Render STRING, not object */}
                      <p className={styles.heroTrackArtist}>
                        {track.artistName || 'Unknown Artist'}
                      </p>
                    </div>
                    <button
                      className={`${styles.heroPlayBtn} ${
                        playing ? styles.heroPlayBtnActive : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(track);
                      }}
                      aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`}
                    >
                      {playing ? (
                        <Pause size={24} fill="currentColor" strokeWidth={0} />
                      ) : (
                        <Play size={24} fill="currentColor" strokeWidth={0} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Albums Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Album Collection</h2>
        </div>

        {albumsLoading ? (
          <div className={styles.loadingInline}>
            <Loader size={20} className={styles.spinnerSmall} />
            <span>Loading albums...</span>
          </div>
        ) : albums.length === 0 ? (
          <p className={styles.emptyText}>No albums available.</p>
        ) : (
          <div className={styles.cardGrid}>
            {albums.slice(0, 12).map((album) => (
              <AlbumCard
                key={album.albumId}
                album={{
                  albumId: album.albumId,
                  id: album.albumId,
                  title: album.title,
                  artistName: album.artistName,
                  artistId: album.artistId,
                  coverEmoji: album.coverEmoji || '💿',
                  cover: album.coverEmoji || '💿',
                  releaseDate: album.releaseDate,
                  year: album.releaseYear,
                  songs: album.songs || [],
                  songCount: album.songCount,
                  genres: album.genres || [],
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
