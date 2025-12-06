import styles from './PlaylistCard.module.css';
import { Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlaylistCard = ({ 
  playlistId,
  title, 
  description, 
  cover, 
  color, 
  tracks = [],
  songCount = 0,
  onDelete
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (playlistId) {
      navigate(`/playlist/${playlistId}`);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation(); // Prevent card click
    console.log('Play playlist:', playlistId);
    // TODO: Implement play functionality
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onDelete) {
      onDelete();
    }
  };

  const displayTracks = tracks && tracks.length > 0 ? tracks : [];
  const totalSongs = songCount || displayTracks.length;

  return (
    <div 
      className={styles.card} 
      style={{ background: color || 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
      onClick={handleCardClick}
    >
      {/* ✅ Delete Button - Pojok Kanan Atas */}
      <button 
        className={styles.deleteBtn}
        onClick={handleDeleteClick}
        title="Delete playlist"
        aria-label="Delete playlist"
      >
        <Trash2 size={18} />
      </button>

      <div className={styles.coverWrapper}>
        <div className={styles.cover}>{cover}</div>
        <button 
          className={styles.playBtn}
          onClick={handlePlayClick}
          aria-label="Play playlist"
        >
          <Play size={20} fill="currentColor" />
        </button>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        {description && <p className={styles.desc}>{description}</p>}
        {totalSongs > 0 && (
          <p className={styles.songCount}>
            {totalSongs} {totalSongs === 1 ? 'song' : 'songs'}
          </p>
        )}
      </div>

      {displayTracks.length > 0 && (
        <div className={styles.trackPreview}>
          {displayTracks.slice(0, 3).map((track, i) => (
            <span className={styles.trackItem} key={track.songId || track.id || i}>
              {track.title}
            </span>
          ))}
          {displayTracks.length > 3 && (
            <span className={styles.more}>+{displayTracks.length - 3} more</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PlaylistCard;
