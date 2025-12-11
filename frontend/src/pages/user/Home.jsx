// pages/Home.jsx
import { useState, useEffect } from 'react';
import { Play, Pause, Loader } from 'lucide-react';
import styles from './Home.module.css';
import AlbumCard from '../../components/Music/AlbumCard';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';
import { useUser } from '../../context/UserContext';

const Home = () => {
  const { playSong, currentSong, isPlaying } = useMusic();
  const { user, loading: authLoading } = useUser();

  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [latestSongs, setLatestSongs] = useState([]);
  const [showAllLatest, setShowAllLatest] = useState(false);

  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // 1) Ambil semua lagu (untuk "Latest Songs")
      const allSongs = await musicService.getAllSongs();

      // Jika backend mengembalikan dari lama → baru, kita balik supaya terbaru di atas
      const sortedLatest = [...allSongs].reverse();
      setLatestSongs(sortedLatest);

      // 2) Ambil Recently Played dari history (jika user ada)
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
            8 // ambil maksimal 8 lagu terakhir
          );

          // Sesuaikan dengan bentuk DTO backend-mu
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
  };

  const handlePlay = (track, playlist, index) => {
    playSong(track, playlist, index);
  };

  const isCurrentlyPlaying = (trackId) => {
    const id = currentSong?.songId || currentSong?.id;
    return id === trackId && isPlaying;
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    <>
      {/* Recently Played Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recently Played</h2>

        {historyLoading ? (
          <div className={styles.loadingInline}>
            <Loader size={20} className={styles.spinnerSmall} />
            <span>Loading history...</span>
          </div>
        ) : recentlyPlayed.length === 0 ? (
          <p className={styles.emptyText}>No recently played songs yet.</p>
        ) : (
          <div className={styles.cardGrid}>
            {recentlyPlayed.slice(0, 8).map((track, index) => (
              <AlbumCard
                key={track.songId || track.id}
                track={{
                  id: track.songId || track.id,
                  title: track.title,
                  artist:
                    track.artist?.name ||
                    track.artist?.username ||
                    track.artistName ||
                    'Unknown Artist',
                  cover: track.coverEmoji || '🎵',
                  duration: formatDuration(track.duration),
                }}
                onPlay={() =>
                  handlePlay(track, recentlyPlayed, index)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Latest Songs Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Latest Songs</h2>
          {latestSongs.length > 8 && (
            <button
              className={styles.moreBtn}
              onClick={() => setShowAllLatest((prev) => !prev)}
            >
              {showAllLatest ? 'Tampilkan Beberapa' : 'Lihat Semua'}
            </button>
          )}
        </div>

        {latestSongs.length === 0 ? (
          <p className={styles.emptyText}>No songs available.</p>
        ) : (
          <div className={styles.trackList}>
            {(showAllLatest ? latestSongs : latestSongs.slice(0, 8)).map(
              (track, index) => {
                const playing = isCurrentlyPlaying(
                  track.songId || track.id
                );

                return (
                  <div
                    key={track.songId || track.id}
                    className={`${styles.trackItem} ${
                      playing ? styles.playing : ''
                    }`}
                  >
                    <span className={styles.trackNumber}>
                      {index + 1}
                    </span>
                    <div className={styles.trackCover}>
                      {track.coverEmoji || '🎵'}
                    </div>
                    <div className={styles.trackInfo}>
                      <h4>{track.title}</h4>
                      <p>
                        {track.artist?.name ||
                          track.artist?.username ||
                          track.artistName ||
                          'Unknown Artist'}
                      </p>
                    </div>
                    <span className={styles.trackDuration}>
                      {formatDuration(track.duration)}
                    </span>
                    <button
                      className={`${styles.playBtn} ${
                        playing ? styles.playing : ''
                      }`}
                      onClick={() =>
                        handlePlay(
                          track,
                          showAllLatest ? latestSongs : latestSongs,
                          index
                        )
                      }
                      aria-label={playing ? 'Playing' : 'Play'}
                    >
                      {playing ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;
