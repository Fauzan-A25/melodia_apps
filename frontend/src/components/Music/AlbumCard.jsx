// components/Music/AlbumCard.jsx - COMPLETE dengan TITIK 3 BESAR 52px
import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './AlbumCard.module.css';
import { Play, Pause, MoreVertical, Plus, Check } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musicService } from '../../services/musicService';

const AlbumCard = ({ track, onPlay }) => {
  const { currentSong, isPlaying } = useMusic();
  const [showMenu, setShowMenu] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [menuPosition, setMenuPosition] = useState('right');
  
  const menuRef = useRef(null);
  const cardRef = useRef(null);
  
  const userId = localStorage.getItem('userId');
  const isCurrentlyPlaying = currentSong?.songId === track.id && isPlaying;

  const fetchUserPlaylists = useCallback(async () => {
    try {
      setLoadingPlaylists(true);
      const data = await musicService.getUserPlaylists(userId);
      setUserPlaylists(data || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [userId]);

  useEffect(() => {
    if (showMenu && userId) {
      fetchUserPlaylists();
    }
  }, [showMenu, userId, fetchUserPlaylists]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(track);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      if (rect.left < 300) {
        setMenuPosition('left');
      } else if (viewportWidth - rect.right < 300) {
        setMenuPosition('right');
      } else {
        setMenuPosition('right');
      }
    }
    
    setShowMenu(!showMenu);
  };

  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    
    if (!userId || !track.id) {
      alert('Cannot add song to playlist');
      return;
    }

    try {
      setAddingToPlaylist(playlistId);
      await musicService.addSongToPlaylist(playlistId, track.id, userId);
      
      setTimeout(() => {
        setAddingToPlaylist(null);
        setShowMenu(false);
      }, 500);
    } catch (err) {
      console.error('Error adding to playlist:', err);
      alert('Failed to add song to playlist: ' + err.message);
      setAddingToPlaylist(null);
    }
  };

  const isSongInPlaylist = (playlist) => {
    return playlist.songs?.some(song => song.songId === track.id) || false;
  };

  return (
    <div 
      ref={cardRef}
      className={`${styles.albumCard} ${isCurrentlyPlaying ? styles.playing : ''}`} 
      onClick={handlePlay}
    >
      <div className={styles.coverWrapper}>
        <div className={styles.cover}>{track.cover}</div>
        
        <button 
          className={`${styles.playButton} ${isCurrentlyPlaying ? styles.active : ''}`}
          onClick={handlePlay}
          aria-label={isCurrentlyPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {isCurrentlyPlaying ? (
            <Pause size={20} fill="#1e3a8a" />
          ) : (
            <Play size={20} fill="#1e3a8a" />
          )}
        </button>

        {/* ✅ TITIK 3 BESAR 52px */}
        <div className={styles.menuContainer}>
          <button 
            className={`${styles.menuButton} ${isCurrentlyPlaying ? styles.playingMenu : ''}`}
            onClick={handleMenuClick}
            aria-label="More options"
          >
            <MoreVertical size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{track.title}</h3>
        <p className={styles.artist}>{track.artist}</p>
      </div>

      {/* ✅ DROPDOWN MENU */}
      {showMenu && (
        <div 
          className={`${styles.dropdownMenu} ${styles[menuPosition]}`}
          ref={menuRef} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuHeader}>
            <span>Add to playlist</span>
          </div>

          {loadingPlaylists ? (
            <div className={styles.menuLoading}>Loading playlists...</div>
          ) : userPlaylists.length === 0 ? (
            <div className={styles.menuEmpty}>
              <p>No playlists yet</p>
              <button 
                className={styles.createPlaylistBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  window.location.href = '/playlist';
                }}
              >
                Create Playlist
              </button>
            </div>
          ) : (
            <div className={styles.menuList}>
              {userPlaylists.map((playlist) => {
                const inPlaylist = isSongInPlaylist(playlist);
                const isAdding = addingToPlaylist === playlist.playlistId;

                return (
                  <button
                    key={playlist.playlistId}
                    className={`${styles.menuItem} ${inPlaylist ? styles.inPlaylist : ''}`}
                    onClick={(e) => !inPlaylist && handleAddToPlaylist(playlist.playlistId, e)}
                    disabled={inPlaylist || isAdding}
                  >
                    <span className={styles.playlistIcon}>{playlist.cover || '🎵'}</span>
                    <span className={styles.playlistName}>{playlist.name}</span>
                    {inPlaylist ? (
                      <Check size={16} className={styles.checkIcon} />
                    ) : isAdding ? (
                      <span className={styles.loadingDot}>...</span>
                    ) : (
                      <Plus size={16} className={styles.plusIcon} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumCard;
