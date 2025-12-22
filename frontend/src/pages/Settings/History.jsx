// src/pages/Settings/History.jsx
import { useEffect, useState, useMemo } from 'react';
import styles from './History.module.css';
import { Clock, User, Play, Pause } from 'lucide-react';
import { musicService } from '../../services/musicService';
import { useUser } from '../../context/UserContext';
import { useMusic } from '../../context/MusicContext';

const History = () => {
  const { user, loading: authLoading } = useUser();
  const {
    playSong,
    currentSong,
    isPlaying,
    setIsPlaying: setGlobalIsPlaying,
  } = useMusic();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (authLoading) return;

      const effectiveUserId =
        user?.accountId ||
        localStorage.getItem('userId') ||
        localStorage.getItem('accountId');

      if (!effectiveUserId) {
        setLoading(false);
        setError('User not logged in');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await musicService.getPlayedSongs(effectiveUserId);
        setSongs(response.songs || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user, authLoading]);

  const isTrackPlaying = (track) => {
    const trackId = track.songId || track.id;
    const currentId = currentSong?.songId || currentSong?.id;
    return !!trackId && !!currentId && trackId === currentId && isPlaying;
  };

  const historyPlaylist = useMemo(
    () =>
      (songs || []).map((track) => ({
        ...track,
        songId: track.songId || track.id,
        id: track.songId || track.id,
        title: track.title,
        artist:
          track.artist?.name ||
          track.artistName ||
          track.artist?.username ||
          'Unknown Artist',
        coverEmoji: track.coverEmoji || '🎵',
        cover: track.coverEmoji || '🎵',
        audioUrl: musicService.getStreamUrl(track.songId || track.id),
      })),
    [songs]
  );

  const handlePlay = (songIndex) => {
    const playlist = historyPlaylist;
    const song = playlist[songIndex];
    if (!song) return;

    const currentId = currentSong?.songId || currentSong?.id;
    const clickedId = song.songId || song.id;

    // klik lagu yang sama & sedang main -> pause
    if (clickedId && currentId && clickedId === currentId && isPlaying) {
      setGlobalIsPlaying(false);
      return;
    }

    const songWithPlaylist = {
      ...song,
      playlist,
    };

    playSong(songWithPlaylist, null, songIndex);
  };

  if (authLoading || loading) {
    return (
      <div className={styles.historyContainer}>
        <header className={styles.header}>
          <Clock size={32} className={styles.headerIcon} />
          <h1 className={styles.title}>History</h1>
        </header>
        <div className={styles.listArea}>
          <div className={styles.empty}>⏳ Loading history...</div>
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
          <div className={styles.empty}>❌ {error}</div>
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
            {songs.map((track, index) => {
              const playing = isTrackPlaying(track);

              return (
                <div
                  className={`${styles.card} ${
                    playing ? styles.playingCard : ''
                  }`}
                  key={track.id || track.songId}
                >
                  <div className={styles.cover}>
                    {track.coverEmoji || '🎵'}
                  </div>

                  <div className={styles.info}>
                    <span className={styles.titleTrack}>
                      {track.title || 'Untitled'}
                    </span>

                    <span className={styles.artist}>
                      <User size={13} />{' '}
                      {track.artist?.name ||
                        track.artistName ||
                        track.artist?.username ||
                        'Unknown Artist'}
                    </span>

                    {track.playedAt && (
                      <span className={styles.playedAt}>
                        Played at{' '}
                        {new Date(track.playedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    className={`${styles.playBtn} ${
                      playing ? styles.playingBtn : ''
                    }`}
                    onClick={() => handlePlay(index)}
                    title={playing ? 'Pause' : 'Play song'}
                  >
                    {playing ? (
                      <Pause size={18} strokeWidth={2.5} />
                    ) : (
                      <Play size={18} strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>📭 No history yet.</div>
        )}
      </div>
    </div>
  );
};

export default History;
