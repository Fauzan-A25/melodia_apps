import styles from './TrackItem.module.css';
import { Play, Pause, MoreVertical, Heart } from 'lucide-react';
import { useState } from 'react';

const TrackItem = ({ track, isPlaying = false, onPlay, onPause, index }) => {
  const [isLiked, setIsLiked] = useState(track.liked || false);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause && onPause(track);
    } else {
      onPlay && onPlay(track);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <div className={`${styles.trackItem} ${isPlaying ? styles.playing : ''}`}>
      <div className={styles.indexSection}>
        {isPlaying ? (
          <button className={styles.playBtn} onClick={handlePlayPause}>
            <Pause size={16} />
          </button>
        ) : (
          <>
            <span className={styles.trackNumber}>{index + 1}</span>
            <button className={styles.playBtn} onClick={handlePlayPause}>
              <Play size={16} />
            </button>
          </>
        )}
      </div>

      <div className={styles.coverSection}>
        <div className={styles.cover}>{track.cover || '🎵'}</div>
      </div>

      <div className={styles.infoSection}>
        <h4 className={styles.title}>{track.title}</h4>
        <p className={styles.artist}>{track.artist}</p>
      </div>

      <div className={styles.albumSection}>
        <span className={styles.albumName}>{track.album}</span>
      </div>

      <div className={styles.durationSection}>
        <button 
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
          onClick={handleLike}
        >
          <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
        <span className={styles.duration}>{track.duration}</span>
        <button className={styles.moreBtn}>
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default TrackItem;
