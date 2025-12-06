// pages/Home.jsx
import { useState, useEffect } from 'react';
import { Play, Pause, Loader } from 'lucide-react';
import styles from './Home.module.css';
import AlbumCard from '../components/Music/AlbumCard';
import { musicService } from '../services/musicService';
import { useMusic } from '../context/MusicContext';

const Home = () => {
  const { playSong, currentSong, isPlaying } = useMusic();

  // Music state
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [popularThisWeek, setPopularThisWeek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    try {
      setLoading(true);
      const allSongs = await musicService.getAllSongs();
      
      setRecentlyPlayed(allSongs.slice(0, 4));
      setRecommended(allSongs.slice(4, 8));
      setPopularThisWeek(allSongs.slice(0, 6));
      
    } catch (err) {
      setError('Failed to load songs');
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Play song handler
  const handlePlay = (track, playlist, index) => {
    playSong(track, playlist, index);
  };

  // Check if this track is currently playing
  const isCurrentlyPlaying = (trackId) => {
    return currentSong?.songId === trackId && isPlaying;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
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
        <button onClick={loadSongs} className={styles.retryBtn}>
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
        <div className={styles.cardGrid}>
          {recentlyPlayed.map((track, index) => (
            <AlbumCard 
              key={track.songId} 
              track={{
                id: track.songId,
                title: track.title,
                artist: track.artistName,
                cover: '🎵',
                duration: formatDuration(track.duration)
              }}
              onPlay={() => handlePlay(track, recentlyPlayed, index)}
            />
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recommended For You</h2>
        <div className={styles.cardGrid}>
          {recommended.map((track, index) => (
            <AlbumCard 
              key={track.songId} 
              track={{
                id: track.songId,
                title: track.title,
                artist: track.artistName,
                cover: '🎸',
                duration: formatDuration(track.duration)
              }}
              onPlay={() => handlePlay(track, recommended, index)}
            />
          ))}
        </div>
      </section>

      {/* Popular This Week Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Popular This Week</h2>
        <div className={styles.trackList}>
          {popularThisWeek.map((track, index) => {
            const isPlaying = isCurrentlyPlaying(track.songId);
            
            return (
              <div 
                key={track.songId} 
                className={`${styles.trackItem} ${isPlaying ? styles.playing : ''}`}
              >
                <span className={styles.trackNumber}>{index + 1}</span>
                <div className={styles.trackCover}>🎵</div>
                <div className={styles.trackInfo}>
                  <h4>{track.title}</h4>
                  <p>{track.artistName}</p>
                </div>
                <span className={styles.trackDuration}>
                  {formatDuration(track.duration)}
                </span>
                <button 
                  className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
                  onClick={() => handlePlay(track, popularThisWeek, index)}
                  aria-label={isPlaying ? 'Playing' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={16} />
                  ) : (
                    <Play size={16} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Home;
