import { useEffect, useState } from 'react';
import styles from './History.module.css';
import { Clock, User, Play } from 'lucide-react';
import { musicService } from '../../services/musicService';

const History = ({ userId }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) {
        setLoading(false);
        setError('User not logged in');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Ambil semua lagu yang pernah diputar
        const response = await musicService.getPlayedSongs(userId);
        // Response dari backend: { userId, totalSongs, songs: [...] }
        setSongs(response.songs || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [userId]);

  const handlePlay = (song) => {
    // Di sini bisa trigger pemutar lagu global / context
    console.log('Play song from history:', song);
  };

  if (loading) {
    return (
      <div className={styles.historyContainer}>
        <header className={styles.header}>
          <Clock size={32} className={styles.headerIcon} />
          <h1 className={styles.title}>History</h1>
        </header>
        <div className={styles.listArea}>
          <div className={styles.empty}>Loading history...</div>
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
          <div className={styles.empty}>{error}</div>
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
              <div className={styles.card} key={track.songId || track.id}>
                {/* Kalau backend punya cover/artwork url, pakai img, sementara pakai emoji fallback */}
                <div className={styles.cover}>
                  {track.coverEmoji || '🎵'}
                </div>

                <div className={styles.info}>
                  <span className={styles.titleTrack}>{track.title}</span>

                  <span className={styles.artist}>
                    <User size={13} /> {track.artist?.name || track.artistName || 'Unknown Artist'}
                  </span>

                  {/* Jika History belum simpan waktu play, bisa di-hide atau pakai placeholder */}
                  {track.playedAt && (
                    <span className={styles.playedAt}>
                      Played at {track.playedAt}
                    </span>
                  )}
                </div>

                <button
                  className={styles.playBtn}
                  onClick={() => handlePlay(track)}
                >
                  <Play size={17} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>No history yet.</div>
        )}
      </div>
    </div>
  );
};

export default History;
