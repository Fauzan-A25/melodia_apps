// components/Music/AlbumCard.jsx
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
  const [menuPosition, setMenuPosition] = useState('right'); // ✅ Track menu position
  
  const menuRef = useRef(null);
  const cardRef = useRef(null); // ✅ Ref untuk detect posisi card
  
  const userId = localStorage.getItem('userId');
  
  // Check if this track is currently playing
  const isCurrentlyPlaying = currentSong?.songId === track.id && isPlaying;

  // Fetch user playlists
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

  // Fetch user playlists when menu opens
  useEffect(() => {
    if (showMenu && userId) {
      fetchUserPlaylists();
    }
  }, [showMenu, userId, fetchUserPlaylists]);

  // Close menu when clicking outside
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

  // ✅ Handle menu click dengan dynamic positioning
  const handleMenuClick = (e) => {
    e.stopPropagation();
    
    // Detect posisi card di viewport
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Jika card terlalu ke kiri (< 300px dari kiri), buka menu ke kanan
      // Jika card terlalu ke kanan (< 300px dari kanan), buka menu ke kiri
      if (rect.left < 300) {
        setMenuPosition('left');
      } else if (viewportWidth - rect.right < 300) {
        setMenuPosition('right');
      } else {
        // Default ke kanan jika ada cukup ruang
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
      
      // Show success feedback
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

  // Check if song is already in playlist
  const isSongInPlaylist = (playlist) => {
    return playlist.songs?.some(song => song.songId === track.id) || false;
  };

  return (
    <div 
      ref={cardRef} // ✅ Tambahkan ref
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
            <Pause size={20} fill="white" />
          ) : (
            <Play size={20} fill="white" />
          )}
        </button>

        {/* Menu Button (Three Dots) */}
        <button 
          className={styles.menuButton}
          onClick={handleMenuClick}
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>

        {/* ✅ Dropdown Menu dengan dynamic position class */}
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

      <div className={styles.info}>
        <h3 className={styles.title}>{track.title}</h3>
        <p className={styles.artist}>{track.artist}</p>
      </div>
    </div>
  );
};

export default AlbumCard;
