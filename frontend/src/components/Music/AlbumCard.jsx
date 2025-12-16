// components/Music/AlbumCard.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const userId = localStorage.getItem('userId');
  const isCurrentlyPlaying = currentSong?.songId === track?.id && isPlaying;

  // ✅ Validate track prop
  useEffect(() => {
    if (!track || !track.id) {
      console.error('AlbumCard: Invalid track prop', track);
    }
  }, [track]);

  // Fetch user playlists
  const fetchUserPlaylists = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoadingPlaylists(true);
      const data = await musicService.getUserPlaylists(userId);
      setUserPlaylists(data || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setUserPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [userId]);

  // Load playlists when menu opens
  useEffect(() => {
    if (showMenu && userId) {
      fetchUserPlaylists();
    }
  }, [showMenu, userId, fetchUserPlaylists]);

  // Listen for playlist created event
  useEffect(() => {
    const handleRefresh = () => {
      if (showMenu && userId) {
        fetchUserPlaylists();
      }
    };

    window.addEventListener('playlist:created', handleRefresh);
    return () => window.removeEventListener('playlist:created', handleRefresh);
  }, [showMenu, userId, fetchUserPlaylists]);

  // Calculate menu position
  useEffect(() => {
    if (!showMenu || !buttonRef.current) return;

    const calculatePosition = () => {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 320;
      const menuHeight = 420;
      const spacing = 8;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = buttonRect.bottom + spacing;
      let left = buttonRect.right - menuWidth;

      // Adjust if menu goes off left edge
      if (left < spacing) {
        left = buttonRect.left;
      }

      // Adjust if menu goes off right edge
      if (left + menuWidth > viewportWidth - spacing) {
        left = viewportWidth - menuWidth - spacing;
      }

      // Adjust if menu goes off bottom edge
      if (top + menuHeight > viewportHeight - spacing) {
        top = buttonRect.top - menuHeight - spacing;
      }

      // Adjust if menu goes off top edge
      if (top < spacing) {
        top = spacing;
      }

      setMenuPosition({ top, left });
    };

    calculatePosition();

    window.addEventListener('scroll', calculatePosition, true);
    window.addEventListener('resize', calculatePosition);

    return () => {
      window.removeEventListener('scroll', calculatePosition, true);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [showMenu]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
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

  // Handle play button click
  const handlePlay = useCallback((e) => {
    e?.stopPropagation();
    if (onPlay && track) {
      onPlay(track);
    }
  }, [onPlay, track]);

  // Handle menu button click
  const handleMenuClick = useCallback((e) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  }, []);

  // Handle add to playlist
  const handleAddToPlaylist = async (playlistId, e) => {
    e.stopPropagation();
    
    if (!userId || !track?.id) {
      alert('Cannot add song to playlist');
      return;
    }

    try {
      setAddingToPlaylist(playlistId);
      await musicService.addSongToPlaylist(playlistId, track.id, userId);
      
      // Show success state briefly
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

  // Check if song is in playlist
  const isSongInPlaylist = useCallback((playlist) => {
    if (!playlist?.songs || !track?.id) return false;
    return playlist.songs.some(song => song.songId === track.id);
  }, [track?.id]);

  // Render dropdown menu
  const renderDropdownMenu = () => {
    if (!showMenu) return null;

    const menuContent = (
      <div 
        className={styles.dropdownMenu}
        ref={menuRef}
        style={{
          position: 'fixed',
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.menuHeader}>
          <span>Add to playlist</span>
        </div>

        {loadingPlaylists ? (
          <div className={styles.menuLoading}>
            <div className={styles.spinner}>⏳</div>
            <p>Loading playlists...</p>
          </div>
        ) : userPlaylists.length === 0 ? (
          <div className={styles.menuEmpty}>
            <p>No playlists available</p>
            <span className={styles.emptyHint}>Create a playlist first</span>
          </div>
        ) : (
          <div className={styles.menuList}>
            {/* ✅ FIXED: Added key prop to each playlist item */}
            {userPlaylists.map((playlist) => {
              const inPlaylist = isSongInPlaylist(playlist);
              const isAdding = addingToPlaylist === playlist.playlistId;

              return (
                <button
                  key={playlist.playlistId} // ✅ KEY PROP ADDED
                  className={`${styles.menuItem} ${inPlaylist ? styles.inPlaylist : ''}`}
                  onClick={(e) => !inPlaylist && handleAddToPlaylist(playlist.playlistId, e)}
                  disabled={inPlaylist || isAdding}
                  aria-label={inPlaylist ? `${playlist.name} (already added)` : `Add to ${playlist.name}`}
                >
                  <span className={styles.playlistIcon}>
                    {playlist.cover || '🎵'}
                  </span>
                  <span className={styles.playlistName}>
                    {playlist.name}
                  </span>
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
    );

    return createPortal(menuContent, document.body);
  };

  // ✅ Handle missing track prop
  if (!track || !track.id) {
    return null;
  }

  return (
    <div 
      className={`${styles.albumCard} ${isCurrentlyPlaying ? styles.playing : ''}`} 
      onClick={handlePlay}
    >
      <div className={styles.coverWrapper}>
        <div className={styles.cover}>
          {track.cover || track.coverEmoji || '💿'}
        </div>
        
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

        <div className={styles.menuContainer}>
          <button 
            ref={buttonRef}
            className={`${styles.menuButton} ${isCurrentlyPlaying ? styles.playingMenu : ''}`}
            onClick={handleMenuClick}
            aria-label="More options"
          >
            <MoreVertical size={24} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{track.title || 'Untitled'}</h3>
        <p className={styles.artist}>{track.artist || 'Unknown Artist'}</p>
      </div>

      {renderDropdownMenu()}
    </div>
  );
};

export default AlbumCard;
