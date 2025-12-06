import styles from './TrackList.module.css';
import TrackItem from './TrackItem';
import { useState } from 'react';

const TrackList = ({ tracks = [], title = 'Tracks' }) => {
  const [currentPlaying, setCurrentPlaying] = useState(null);

  const handlePlay = (track) => {
    setCurrentPlaying(track.id);
    console.log('Playing:', track);
    // TODO: Integrate with usePlayer hook
  };

  const handlePause = (track) => {
    setCurrentPlaying(null);
    console.log('Paused:', track);
    // TODO: Integrate with usePlayer hook
  };

  return (
    <div className={styles.trackListContainer}>
      {title && <h3 className={styles.listTitle}>{title}</h3>}
      
      <div className={styles.headerRow}>
        <span className={styles.headerIndex}>#</span>
        <span className={styles.headerCover}></span>
        <span className={styles.headerTitle}>Title</span>
        <span className={styles.headerAlbum}>Album</span>
        <span className={styles.headerDuration}>Duration</span>
      </div>

      <div className={styles.trackList}>
        {tracks.length > 0 ? (
          tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              isPlaying={currentPlaying === track.id}
              onPlay={handlePlay}
              onPause={handlePause}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No tracks available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackList;
