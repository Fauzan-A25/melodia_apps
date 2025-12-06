import styles from './History.module.css';
import { Clock, User, Play } from 'lucide-react';

// Data dummy pemutaran lagu—bisa diganti dari backend atau state
const mockHistory = [
  { id: 1, title: 'Midnight Dreams', artist: 'Luna Wave', playedAt: '2025-11-20 18:45', cover: '⭐' },
  { id: 2, title: 'Ocean Breeze', artist: 'Coastal Vibe', playedAt: '2025-11-22 10:09', cover: '🌊' },
  { id: 3, title: 'Rainy Days', artist: 'Jazz Collective', playedAt: '2025-11-22 13:15', cover: '☔' },
  { id: 4, title: 'Urban Jungle', artist: 'City Beats', playedAt: '2025-11-22 14:05', cover: '🏙️' },
  { id: 5, title: 'Starlight', artist: 'Cosmic Band', playedAt: '2025-11-22 18:30', cover: '🌌' },
];

const History = () => {
  return (
    <div className={styles.historyContainer}>
      <header className={styles.header}>
        <Clock size={32} className={styles.headerIcon} />
        <h1 className={styles.title}>History</h1>
      </header>
      <div className={styles.listArea}>
        {mockHistory.length > 0 ? (
          <div className={styles.list}>
            {mockHistory.map((track) => (
              <div className={styles.card} key={track.id}>
                <div className={styles.cover}>{track.cover}</div>
                <div className={styles.info}>
                  <span className={styles.titleTrack}>{track.title}</span>
                  <span className={styles.artist}><User size={13} /> {track.artist}</span>
                  <span className={styles.playedAt}>Played at {track.playedAt}</span>
                </div>
                <button className={styles.playBtn}><Play size={17} /></button>
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
