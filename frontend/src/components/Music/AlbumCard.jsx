// components/Music/AlbumCard.jsx - FIXED
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AlbumCard.module.css';
import { Play, Pause, Music, Loader } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musicService } from '../../services/musicService';

const AlbumCard = ({ album, onViewAlbum }) => {
  const navigate = useNavigate();
  const {
    playSong,
    currentSong,
    isPlaying,
    setIsPlaying: setGlobalIsPlaying,
  } = useMusic();

  const [isHovered, setIsHovered] = useState(false);
  const [loadingPlay, setLoadingPlay] = useState(false);

  // Check if this album is currently playing
  const isAlbumPlaying =
    !!currentSong?.album?.albumId &&
    currentSong.album.albumId === album?.albumId &&
    isPlaying;

  const handleClick = useCallback(() => {
    if (onViewAlbum) {
      onViewAlbum(album);
    } else if (album?.albumId) {
      navigate(`/album/${album.albumId}`);
    }
  }, [onViewAlbum, album, navigate]);

  const startAlbumPlayback = useCallback(
    async (e) => {
      e.stopPropagation();

      if (!album?.albumId) {
        console.error('Album ID not found');
        return;
      }

      try {
        setLoadingPlay(true);

        // 1) Fetch all songs from album
        const albumSongs = await musicService.getAlbumSongs(album.albumId);

        if (!albumSongs || albumSongs.length === 0) {
          alert('This album has no songs');
          setLoadingPlay(false);
          return;
        }

        // 2) Map to player format
        const playlist = albumSongs.map((song) => ({
          ...song,
          songId: song.songId,
          id: song.songId,
          title: song.title,
          artist:
            song.artist?.name ||
            song.artistName ||
            song.artistUsername ||
            album.artistName ||
            'Unknown Artist',
          artistId:
            song.artist?.artistId ||
            song.artistId ||
            album.artistId ||
            null,
          coverEmoji: song.coverEmoji || album.coverEmoji || '🎵',
          cover: song.coverEmoji || album.coverEmoji || '🎵',
          audioUrl: musicService.getStreamUrl(song.songId),
          album: {
            albumId: album.albumId,
            title: album.title,
            coverEmoji: album.coverEmoji,
          },
          genres: song.genres || album.genres || [],
          releaseDate: song.releaseDate || album.releaseDate,
        }));

        // ✅ FIX: Play dengan format yang benar untuk MusicContext
        // playSong(song, songList, index)
        await playSong(playlist[0], playlist, 0);
      } catch (err) {
        console.error('Error playing album:', err);
        alert('Failed to play album: ' + err.message);
      } finally {
        setLoadingPlay(false);
      }
    },
    [album, playSong]
  );

  const handlePlayClick = useCallback(
    async (e) => {
      e.stopPropagation();

      if (loadingPlay) return;

      // If this album is currently playing, pause it
      if (isAlbumPlaying) {
        setGlobalIsPlaying(false);
        return;
      }

      // Otherwise, start playing the album
      await startAlbumPlayback(e);
    },
    [isAlbumPlaying, loadingPlay, setGlobalIsPlaying, startAlbumPlayback]
  );

  if (!album || !album.albumId) {
    return null;
  }

  const songCount = album.songs?.length || album.songCount || 0;
  const albumYear = album.releaseDate
    ? new Date(album.releaseDate).getFullYear()
    : album.year;

  const displayArtist = album.artistName || 'Unknown Artist';

  return (
    <div
      className={`${styles.albumCard} ${isAlbumPlaying ? styles.playing : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.coverWrapper}>
        <div className={styles.cover}>
          {album.coverEmoji || album.cover || '💿'}
        </div>

        <button
          className={`${styles.playButton} ${
            isHovered || isAlbumPlaying ? styles.visible : ''
          } ${isAlbumPlaying ? styles.active : ''}`}
          onClick={handlePlayClick}
          disabled={loadingPlay}
          aria-label={
            loadingPlay
              ? 'Loading...'
              : isAlbumPlaying
              ? `Pause ${album.title}`
              : `Play ${album.title}`
          }
        >
          {loadingPlay ? (
            <Loader size={24} className={styles.spinner} />
          ) : isAlbumPlaying ? (
            <Pause size={24} fill="white" />
          ) : (
            <Play size={24} fill="#1e3a8a" />
          )}
        </button>

        {songCount > 0 && (
          <div className={styles.songCount}>
            <Music size={14} />
            <span>{songCount}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{album.title || 'Untitled Album'}</h3>
        <p className={styles.artist}>{displayArtist}</p>
        {albumYear && <p className={styles.year}>{albumYear}</p>}
      </div>
    </div>
  );
};

export default AlbumCard;
