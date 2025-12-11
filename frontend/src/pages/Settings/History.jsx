// src/pages/Settings/History.jsx
import { useEffect, useState } from 'react';
import styles from './History.module.css';
import { Clock, User, Play } from 'lucide-react';
import { musicService } from '../../services/musicService';
import { useUser } from '../../context/UserContext';

const History = () => {
  const { user, loading: authLoading } = useUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (authLoading) return;

      const effectiveUserId =
        user?.accountId ||
        localStorage.getItem('userId') ||
        localStorage.getItem('accountId');

      if (!effectiveUserId) {
        setLoading(false);
        setError('User not logged in');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // ✅ DTO: { userId, songs: [...] }
        const response = await musicService.getPlayedSongs(effectiveUserId);
        setSongs(response.songs || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user, authLoading]);

  const handlePlay = (song) => {
    console.log('Play song from history:', song);
    // TODO: Integrate dengan MusicContext untuk putar lagu
  };

  if (authLoading || loading) {
    return (
      <div className={styles.historyContainer}>
        <header className={styles.header}>
          <Clock size={32} className={styles.headerIcon} />
          <h1 className={styles.title}>History</h1>
        </header>
        <div className={styles.listArea}>
          <div className={styles.empty}>⏳ Loading history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.historyContainer}>
        <header className={styles.header}>
          <Clock size={32} className={styles.headerIcon} />
          <h1 className={styles.title}>History</h1>
        </header>
        <div className={styles.listArea}>
          <div className={styles.empty}>❌ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <header className={styles.header}>
        <Clock size={32} className={styles.headerIcon} />
        <h1 className={styles.title}>History</h1>
      </header>

      <div className={styles.listArea}>
        {songs.length > 0 ? (
          <div className={styles.list}>
            {songs.map((track) => (
              <div className={styles.card} key={track.id || track.songId}>
                <div className={styles.cover}>
                  {track.coverEmoji || '🎵'}
                </div>

                <div className={styles.info}>
                  <span className={styles.titleTrack}>
                    {track.title || 'Untitled'}
                  </span>

                  <span className={styles.artist}>
                    <User size={13} />{' '}
                    {track.artist?.name ||
                      track.artistName ||
                      'Unknown Artist'}
                  </span>

                  {/* Jika DTO belum punya playedAt, tidak akan crash */}
                  {track.playedAt && (
                    <span className={styles.playedAt}>
                      Played at{' '}
                      {new Date(track.playedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                <button
                  className={styles.playBtn}
                  onClick={() => handlePlay(track)}
                  title="Play song"
                >
                  <Play size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>📭 No history yet.</div>
        )}
      </div>
    </div>
  );
};

export default History;
