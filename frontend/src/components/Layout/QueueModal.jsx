// components/Player/QueueModal.jsx - FIXED
import styles from './QueueModal.module.css';
import { X, Music, Play } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

const QueueModal = ({ isOpen, onClose }) => {
  const { getCurrentQueue, playSong, currentSong } = useMusic();
  
  if (!isOpen) return null;

  // ✅ FIX: Safely get queue data dengan fallback
  const queueData = getCurrentQueue();
  const queue = queueData?.queue || [];
  const currentIndex = queueData?.currentIndex || 0;

  const handlePlaySong = (song, index) => {
    playSong(song, queue, index);
  };

  // ✅ Calculate remaining songs safely
  const remainingSongs = queue.length > currentIndex + 1 
    ? queue.length - currentIndex - 1 
    : 0;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Queue</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Playing */}
        {currentSong && (
          <div className={styles.currentSection}>
            <h3>Now Playing</h3>
            <div className={`${styles.queueItem} ${styles.currentItem}`}>
              <div className={styles.songNumber}>
                <Music size={16} />
              </div>
              <div className={styles.songCover}>
                {currentSong.coverEmoji || currentSong.cover || '🎵'}
              </div>
              <div className={styles.songInfo}>
                <h4>{currentSong.title}</h4>
                <p>
                  {currentSong.artist?.username ||
                    currentSong.artist?.name ||
                    currentSong.artistName ||
                    currentSong.artist ||
                    'Unknown Artist'}
                </p>
              </div>
              <span className={styles.playingBadge}>Playing</span>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className={styles.queueSection}>
          <h3>
            Next in Queue ({remainingSongs} {remainingSongs === 1 ? 'song' : 'songs'})
          </h3>
          <div className={styles.queueList}>
            {queue.length === 0 ? (
              <p className={styles.emptyText}>No songs in queue</p>
            ) : remainingSongs === 0 ? (
              <p className={styles.emptyText}>No more songs in queue</p>
            ) : (
              queue.map((song, index) => {
                // Skip current and previous songs
                if (index <= currentIndex) return null;
                
                const songId = song.songId || song.id;
                const currentSongId = currentSong?.songId || currentSong?.id;
                const isCurrentSong = songId === currentSongId;

                return (
                  <div
                    key={`${songId}-${index}`}
                    className={`${styles.queueItem} ${
                      isCurrentSong ? styles.currentItem : ''
                    }`}
                    onClick={() => handlePlaySong(song, index)}
                  >
                    <div className={styles.songNumber}>
                      {index - currentIndex}
                    </div>
                    <div className={styles.songCover}>
                      {song.coverEmoji || song.cover || '🎵'}
                    </div>
                    <div className={styles.songInfo}>
                      <h4>{song.title}</h4>
                      <p>
                        {song.artist?.username ||
                          song.artist?.name ||
                          song.artistName ||
                          song.artist ||
                          'Unknown Artist'}
                      </p>
                    </div>
                    <button
                      className={styles.playBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song, index);
                      }}
                      title="Play this song"
                    >
                      <Play size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueModal;
