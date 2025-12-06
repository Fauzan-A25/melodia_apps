// components/Layout/PlayerBar.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PlayerBar.module.css';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, X } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

// ✅ GANTI dengan Supabase project URL kamu
const SUPABASE_URL = 'https://byqxamggdqsnikvkkivr.supabase.co';

const PlayerBar = () => {
  const { 
    currentSong, 
    playNext, 
    playPrevious, 
    stopMusic,
    isPlaying: globalIsPlaying,
    setIsPlaying: setGlobalIsPlaying,
    volume: globalVolume,
    changeVolume,
    toggleRepeat,
    toggleShuffle,
    repeatMode,
    isShuffled,
  } = useMusic();

  const audioRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Local state
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ==================== EFFECTS ====================

  // Load new song when currentSong changes
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;
    
    // ✅ Construct direct Supabase URL
    const streamUrl = currentSong.filePath
      ? `${SUPABASE_URL}/storage/v1/object/public/songs/${currentSong.filePath}`
      : null;

    if (!streamUrl) {
      console.error('❌ No file path for song:', currentSong);
      return;
    }

    console.log('🎵 Loading song:', {
      songId: currentSong.songId,
      title: currentSong.title,
      filePath: currentSong.filePath,
      streamUrl: streamUrl
    });
    
    // Abort previous load
    isLoadingRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    
    audio.src = streamUrl;
    audio.load();

    const handleLoadStart = () => {
      console.log('⏳ Loading started...');
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
    };

    const handleCanPlay = () => {
      if (!isLoadingRef.current) return;
      
      console.log('✅ Audio ready to play');
      setIsLoading(false);
      isLoadingRef.current = false;
      
      // Auto play new song
      audio.play()
        .then(() => {
          console.log('▶️ Playing...');
          setGlobalIsPlaying(true);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('❌ Play error:', err);
          }
        });
    };

    const handleError = (e) => {
      setIsLoading(false);
      isLoadingRef.current = false;
      console.error('❌ Audio load error:', {
        error: e,
        src: audio.src,
        networkState: audio.networkState,
        readyState: audio.readyState
      });
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      isLoadingRef.current = false;
    };
  }, [currentSong, setGlobalIsPlaying]);

  // Handle song end
  const handleSongEnd = useCallback(() => {
    console.log('🔚 Song ended, playing next...');
    setGlobalIsPlaying(false);
    playNext();
  }, [playNext, setGlobalIsPlaying]);

  // Update time when playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      const dur = audio.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
        console.log('⏱️ Duration:', Math.floor(dur), 'seconds');
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [handleSongEnd]);

  // Sync play/pause with global state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || isLoadingRef.current) return;

    if (globalIsPlaying) {
      audio.play().catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Play error:', err);
        }
      });
    } else {
      audio.pause();
    }
  }, [globalIsPlaying, currentSong]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = globalVolume / 100;
    }
  }, [globalVolume]);

  // ==================== HANDLERS ====================

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong || isLoading) return;

    if (globalIsPlaying) {
      audio.pause();
      setGlobalIsPlaying(false);
      console.log('⏸️ Paused');
    } else {
      audio.play()
        .then(() => {
          setGlobalIsPlaying(true);
          console.log('▶️ Playing');
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            console.error('Play error:', err);
            setGlobalIsPlaying(false);
          }
        });
    }
  };

  const handleProgressChange = (e) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e) => {
    changeVolume(Number(e.target.value));
  };

  const handleClose = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }
    isLoadingRef.current = false;
    console.log('❌ Player closed');
    stopMusic();
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ==================== RENDER ====================

  if (!currentSong) return null;

  return (
    <div className={styles.playerBar}>
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Track Info */}
      <div className={styles.trackInfo}>
        <div className={styles.albumCover}>🎵</div>
        <div className={styles.trackDetails}>
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist?.username || currentSong.artistName || 'Unknown Artist'}</p>
        </div>
        <button
          className={`${styles.likeBtn} ${isLiked ? styles.liked : ''}`}
          onClick={() => setIsLiked(!isLiked)}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Player Controls */}
      <div className={styles.playerControls}>
        <div className={styles.controlButtons}>
          <button 
            className={`${styles.controlBtn} ${isShuffled ? styles.active : ''}`}
            onClick={toggleShuffle}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button 
            className={styles.controlBtn} 
            onClick={playPrevious}
            title="Previous"
          >
            <SkipBack size={20} />
          </button>
          <button
            className={styles.playPauseBtn}
            onClick={togglePlayPause}
            disabled={isLoading}
            title={isLoading ? 'Loading...' : globalIsPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : globalIsPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>
          <button 
            className={styles.controlBtn} 
            onClick={playNext}
            title="Next"
          >
            <SkipForward size={20} />
          </button>
          <button 
            className={`${styles.controlBtn} ${repeatMode !== 'off' ? styles.active : ''}`}
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat size={18} />
            {repeatMode === 'one' && <span className={styles.repeatBadge}>1</span>}
          </button>
        </div>

        <div className={styles.progressSection}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            className={styles.progressInput}
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!duration}
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Section */}
      <div className={styles.volumeSection}>
        <Volume2 size={20} />
        <input
          className={styles.volumeInput}
          type="range"
          min={0}
          max={100}
          value={globalVolume}
          onChange={handleVolumeChange}
        />
        <button 
          className={styles.closeBtn} 
          onClick={handleClose} 
          title="Close player"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PlayerBar;
