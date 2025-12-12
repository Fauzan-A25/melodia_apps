import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PlayerBar.module.css';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  X,
} from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musicService } from '../../services/musicService';
import { useUser } from '../../context/UserContext';

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

  const { user } = useUser();
  const audioRef = useRef(null);
  const isLoadingRef = useRef(false);
  const userIdRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    userIdRef.current =
      user?.accountId ||
      localStorage.getItem('userId') ||
      localStorage.getItem('accountId');
  }, [user]);

  // Load new song
  useEffect(() => {
    if (!currentSong || !audioRef.current) return;

    const audio = audioRef.current;

    const streamUrl = currentSong.filePath
      ? `${SUPABASE_URL}/storage/v1/object/public/songs/${currentSong.filePath}`
      : null;

    if (!streamUrl) {
      return;
    }

    isLoadingRef.current = true;
    audio.pause();
    audio.currentTime = 0;
    audio.src = streamUrl;
    audio.load();

    const handleLoadStart = () => {
      setIsLoading(true);
      setCurrentTime(0);
      setDuration(0);
    };

    const handleCanPlay = () => {
      if (!isLoadingRef.current) return;

      setIsLoading(false);
      isLoadingRef.current = false;

      audio
        .play()
        .then(() => {
          setGlobalIsPlaying(true);

          const songId = currentSong.songId || currentSong.id;
          const userId = userIdRef.current;

          if (userId && songId) {
            musicService
              .addSongToHistory(userId, songId)
              .catch(() => {});
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setGlobalIsPlaying(false);
          }
        });
    };

    const handleError = () => {
      setIsLoading(false);
      isLoadingRef.current = false;
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
    if (repeatMode === 'one') {
      // audio.loop akan meng-handle repeat one
      return;
    }
    playNext();
  }, [playNext, repeatMode]);

  // Time & ended listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      const dur = audio.duration;
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur);
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

  // Sync play/pause dengan global state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || isLoadingRef.current) return;

    if (globalIsPlaying) {
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') {
          setGlobalIsPlaying(false);
        }
      });
    } else {
      audio.pause();
    }
  }, [globalIsPlaying, currentSong, setGlobalIsPlaying]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = globalVolume / 100;
    }
  }, [globalVolume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !currentSong || isLoading) return;

    if (globalIsPlaying) {
      audio.pause();
      setGlobalIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setGlobalIsPlaying(true);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
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
    stopMusic();
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSong) return null;

  return (
    <div className={styles.playerBar}>
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        loop={repeatMode === 'one'}
      />

      {/* Track Info */}
      <div className={styles.trackInfo}>
        <div className={styles.albumCover}>
          {currentSong.coverEmoji || '🎵'}
        </div>
        <div className={styles.trackDetails}>
          <h4>{currentSong.title}</h4>
          <p>
            {currentSong.artist?.username ||
              currentSong.artistName ||
              'Unknown Artist'}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className={styles.playerControls}>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.controlBtn} ${
              isShuffled ? styles.active : ''
            }`}
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
            title={
              isLoading
                ? 'Loading...'
                : globalIsPlaying
                ? 'Pause'
                : 'Play'
            }
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
            className={`${styles.controlBtn} ${
              repeatMode !== 'off' ? styles.active : ''
            }`}
            onClick={toggleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            <Repeat size={18} />
            {repeatMode === 'one' && (
              <span className={styles.repeatBadge}>1</span>
            )}
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
