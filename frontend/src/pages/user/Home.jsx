// pages/Home.jsx
import { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
import styles from './Home.module.css';
import SongCard from '../../components/Music/SongCard';
import AlbumCard from '../../components/Music/AlbumCard';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';
import { useUser } from '../../context/UserContext';

const Home = () => {
  const { playSong } = useMusic();
  const { user, loading: authLoading } = useUser();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [showAllLatest, setShowAllLatest] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Latest Songs
      const allSongs = await musicService.getAllSongs();
      const sortedLatest = [...allSongs].reverse();
      setLatestSongs(sortedLatest);

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
            8
          );
          const songs =
            historyResp.songs ||
            historyResp.recentSongs ||
            historyResp ||
            [];
          setRecentlyPlayed(songs);
        } catch (e) {
          console.error('Failed to load recently played:', e);
          setRecentlyPlayed([]);
        } finally {
          setHistoryLoading(false);
        }
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, loadData]);

  const handlePlay = useCallback(
    (track, playlist, index) => {
      playSong(track, playlist, index);
    },
    [playSong]
  );

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
      {/* Recently Played */}
      {!historyLoading && recentlyPlayed.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recently Played</h2>
          <div className={styles.cardGrid}>
            {recentlyPlayed.slice(0, 8).map((track, index) => (
              <SongCard
                key={track.songId || track.id}
                track={{
                  id: track.songId || track.id,
                  songId: track.songId || track.id,
                  title: track.title,
                  artist:
                    track.artist?.name ||
                    track.artist?.username ||
                    track.artistName ||
                    'Unknown Artist',
                  cover: track.coverEmoji || '🎵',
                  coverEmoji: track.coverEmoji || '🎵',
                  duration: track.duration,
                  audioUrl: musicService.getStreamUrl(
                    track.songId || track.id
                  ),
                }}
                onPlay={() => handlePlay(track, recentlyPlayed, index)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Albums</h2>
          {albums.length > 8 && (
            <button
              className={styles.moreBtn}
              onClick={() => setShowAllAlbums((prev) => !prev)}
            >
              {showAllAlbums ? 'Show Less' : 'View All'}
            </button>
          )}
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
            {(showAllAlbums ? albums : albums.slice(0, 8)).map((album) => (
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

      {/* Latest Songs */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Latest Songs</h2>
          {latestSongs.length > 8 && (
            <button
              className={styles.moreBtn}
              onClick={() => setShowAllLatest((prev) => !prev)}
            >
              {showAllLatest ? 'Show Less' : 'View All'}
            </button>
          )}
        </div>

        {latestSongs.length === 0 ? (
          <p className={styles.emptyText}>No songs available.</p>
        ) : (
          <div className={styles.cardGrid}>
            {(showAllLatest ? latestSongs : latestSongs.slice(0, 8)).map(
              (track, index) => (
                <SongCard
                  key={track.songId || track.id}
                  track={{
                    id: track.songId || track.id,
                    songId: track.songId || track.id,
                    title: track.title,
                    artist:
                      track.artist?.name ||
                      track.artist?.username ||
                      track.artistName ||
                      'Unknown Artist',
                    cover: track.coverEmoji || '🎵',
                    coverEmoji: track.coverEmoji || '🎵',
                    duration: track.duration,
                    audioUrl: musicService.getStreamUrl(
                      track.songId || track.id
                    ),
                  }}
                  onPlay={() =>
                    handlePlay(
                      track,
                      showAllLatest ? latestSongs : latestSongs.slice(0, 8),
                      index
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
