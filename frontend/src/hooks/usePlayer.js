import { useState, useRef, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { STORAGE_KEYS, PLAYER_STATES, REPEAT_MODES, DEFAULT_VOLUME } from '../utils/constants';
import { clamp } from '../utils/helper';

/**
 * Custom hook for music player management
 * @returns {object} Player state and controls
 */
const usePlayer = () => {
  const audioRef = useRef(new Audio());

  // Player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerState, setPlayerState] = useState(PLAYER_STATES.IDLE);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => getStorageItem(STORAGE_KEYS.VOLUME, DEFAULT_VOLUME));
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState(REPEAT_MODES.OFF);
  const [isShuffled, setIsShuffled] = useState(false);

  // Load track
  const loadTrack = useCallback((track) => {
    if (!track) return;

    const audio = audioRef.current;
    audio.src = track.url || track.src;
    audio.volume = volume / 100;

    setCurrentTrack(track);
    setStorageItem(STORAGE_KEYS.CURRENT_TRACK, track);
  }, [volume]);

  // Play
  const play = useCallback(async () => {
    try {
      await audioRef.current.play();
      setPlayerState(PLAYER_STATES.PLAYING);
    } catch (error) {
      console.error('Play error:', error);
      setPlayerState(PLAYER_STATES.ERROR);
    }
  }, []);

  // Play next
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      nextIndex = repeatMode === REPEAT_MODES.ALL ? 0 : currentIndex;
    }

    setCurrentIndex(nextIndex);
    loadTrack(queue[nextIndex]);
    play();
  }, [queue, currentIndex, repeatMode, loadTrack, play]);

  // Handle track end - PINDAHKAN KE ATAS sebelum useEffect
  const handleTrackEnd = useCallback(() => {
    if (repeatMode === REPEAT_MODES.ONE) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (currentIndex < queue.length - 1) {
      playNext();
    } else if (repeatMode === REPEAT_MODES.ALL) {
      setCurrentIndex(0);
      loadTrack(queue[0]);
    } else {
      setPlayerState(PLAYER_STATES.IDLE);
    }
  }, [repeatMode, currentIndex, queue, playNext, loadTrack]);

  // Initialize audio element
  useEffect(() => {
    const audio = audioRef.current;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setPlayerState(PLAYER_STATES.IDLE);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setPlayerState(PLAYER_STATES.ERROR);
    };

    const handleLoadStart = () => {
      setPlayerState(PLAYER_STATES.LOADING);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [handleTrackEnd]); // Tambahkan handleTrackEnd ke dependency array

  // Pause
  const pause = useCallback(() => {
    audioRef.current.pause();
    setPlayerState(PLAYER_STATES.PAUSED);
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (playerState === PLAYER_STATES.PLAYING) {
      pause();
    } else {
      play();
    }
  }, [playerState, play, pause]);

  // Play specific track
  const playTrack = useCallback((track, trackQueue = []) => {
    if (trackQueue.length > 0) {
      setQueue(trackQueue);
      const index = trackQueue.findIndex(t => t.id === track.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
    
    loadTrack(track);
    play();
  }, [loadTrack, play]);

  // Play previous
  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    // If more than 3 seconds played, restart current track
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = repeatMode === REPEAT_MODES.ALL ? queue.length - 1 : 0;
    }

    setCurrentIndex(prevIndex);
    loadTrack(queue[prevIndex]);
    play();
  }, [queue, currentIndex, currentTime, repeatMode, loadTrack, play]);

  // Seek to time
  const seekTo = useCallback((time) => {
    const clampedTime = clamp(time, 0, duration);
    audioRef.current.currentTime = clampedTime;
    setCurrentTime(clampedTime);
  }, [duration]);

  // Change volume
  const changeVolume = useCallback((newVolume) => {
    const clampedVolume = clamp(newVolume, 0, 100);
    audioRef.current.volume = clampedVolume / 100;
    setVolume(clampedVolume);
    setStorageItem(STORAGE_KEYS.VOLUME, clampedVolume);
    
    if (clampedVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    const modes = [REPEAT_MODES.OFF, REPEAT_MODES.ALL, REPEAT_MODES.ONE];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  }, [repeatMode]);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffled(!isShuffled);
    // TODO: Implement shuffle logic
  }, [isShuffled]);

  // Add to queue
  const addToQueue = useCallback((track) => {
    setQueue(prevQueue => [...prevQueue, track]);
    setStorageItem(STORAGE_KEYS.QUEUE, [...queue, track]);
  }, [queue]);

  // Clear queue
  const clearQueue = useCallback(() => {
    setQueue([]);
    setStorageItem(STORAGE_KEYS.QUEUE, []);
  }, []);

  return {
    // State
    currentTrack,
    queue,
    currentIndex,
    playerState,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isPlaying: playerState === PLAYER_STATES.PLAYING,
    isLoading: playerState === PLAYER_STATES.LOADING,
    
    // Controls
    play,
    pause,
    togglePlay,
    playTrack,
    playNext,
    playPrevious,
    seekTo,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
    clearQueue,
  };
};

export default usePlayer;
