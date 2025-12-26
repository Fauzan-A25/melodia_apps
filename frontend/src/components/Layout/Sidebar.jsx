// src/components/Layout/Sidebar.jsx
import {
  Home,
  Music,
  ListMusic,
  Users,
  Plus,
  Mic2,
  Disc3,
  Search,
  Music2,
} from 'lucide-react';
import MelodiaLogo from '../../assets/images/common/logo_sidebar.png';
import styles from './Sidebar.module.css';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useState, useEffect, useCallback } from 'react';
import { musicService } from '../../services/musicService';

const Sidebar = ({ onCreatePlaylist }) => {
  const { user } = useUser();
  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // ambil userId & role
  useEffect(() => {
    const storedId =
      localStorage.getItem('userId') || localStorage.getItem('accountId');
    const storedRole =
      localStorage.getItem('role') || localStorage.getItem('accountType');

    const effectiveId = user?.accountId || storedId;
    const effectiveType = user?.accountType || storedRole;

    const adminDetected =
      effectiveType === 'ADMIN' ||
      (effectiveId &&
        typeof effectiveId === 'string' &&
        effectiveId.startsWith('ADM'));

    setUserId(effectiveId || null);
    setIsAdmin(adminDetected);
    setInitialized(true);
  }, [user]);

  // fetch playlists
  const fetchPlaylists = useCallback(async () => {
    if (!initialized) return;

    if (isAdmin || !userId) {
      setPlaylists([]);
      setLoadingPlaylists(false);
      return;
    }

    try {
      setLoadingPlaylists(true);
      const data = await musicService.getUserPlaylists(userId);
      setPlaylists(Array.isArray(data) ? data : []);
    } catch {
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [userId, isAdmin, initialized]);

  useEffect(() => {
    if (initialized) {
      fetchPlaylists();
    }
  }, [fetchPlaylists, initialized]);

  // global event listener
  useEffect(() => {
    const handlePlaylistChange = () => {
      if (!initialized) return;
      if (!isAdmin) {
        fetchPlaylists();
      }
    };

    window.addEventListener('playlist:refresh', handlePlaylistChange);
    window.addEventListener('playlist:created', handlePlaylistChange);
    window.addEventListener('playlist:deleted', handlePlaylistChange);

    return () => {
      window.removeEventListener('playlist:refresh', handlePlaylistChange);
      window.removeEventListener('playlist:created', handlePlaylistChange);
      window.removeEventListener('playlist:deleted', handlePlaylistChange);
    };
  }, [fetchPlaylists, isAdmin, initialized]);

  const adminNavItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ListMusic, label: 'Manage Genres', path: '/admin/genres' },
    { icon: Mic2, label: 'Manage Artists', path: '/admin/artists' },
    { icon: Disc3, label: 'Manage Albums', path: '/admin/albums' },
    { icon: Music, label: 'Manage Songs', path: '/admin/songs' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
  ];

  const userNavItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Search', path: '/search' },
  ];

  const menuItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <img 
            src={MelodiaLogo} 
            alt="Melodia Logo" 
            className={styles.melodiaLogo} 
          />
          <span className={styles.logoText}>Melodia</span>
        </div>

        {/* Main nav */}
        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <span className={styles.navIconWrapper}>
                  <item.icon size={20} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* User playlist area */}
          {!isAdmin && (
            <>
              <div className={styles.sectionDivider} />

              <button
                className={styles.createPlaylistBtn}
                onClick={onCreatePlaylist}
                disabled={!initialized || loadingPlaylists || !userId}
              >
                <span className={styles.navLabel}>Create Playlist</span>
                <span className={styles.navIconWrapper}>
                  <Plus size={16} strokeWidth={2.5} />
                </span>
              </button>

              {!initialized ? (
                <div className={styles.playlistInfoBox}>
                  <span className={styles.playlistEmoji}>⏳</span>
                  <span className={styles.playlistInfoText}>
                    Loading sidebar...
                  </span>
                </div>
              ) : (
                <div className={styles.playlistBlock}>
                  {loadingPlaylists ? (
                    <div className={styles.playlistInfoBox}>
                      <span className={styles.playlistEmoji}>⏳</span>
                      <span className={styles.playlistInfoText}>
                        Loading playlists...
                      </span>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className={styles.playlistInfoBox}>
                      <span className={styles.playlistEmoji}>📭</span>
                      <span className={styles.playlistInfoText}>
                        No playlists yet
                      </span>
                      <span className={styles.playlistInfoSub}>
                        Create one to start organizing your music
                      </span>
                    </div>
                  ) : (
                    <div className={styles.playlistList}>
                      {playlists.map((playlist) => (
                        <NavLink
                          key={playlist.playlistId}
                          to={`/playlist/${playlist.playlistId}`}
                          className={({ isActive }) =>
                            `${styles.playlistItem} ${
                              isActive ? styles.playlistItemActive : ''
                            }`
                          }
                        >
                          <span className={styles.playlistAvatar}>
                            <Music2 size={16} strokeWidth={2.5} />
                          </span>
                          <span className={styles.playlistName}>
                            {playlist.name}
                          </span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
