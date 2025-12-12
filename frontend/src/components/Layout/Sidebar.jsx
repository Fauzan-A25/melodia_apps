// src/components/Layout/Sidebar.jsx
import { Home, Music, ListMusic, Users, Plus, Mic2 } from 'lucide-react';
import MelodiaLogo from '../../assets/melodia_logo.svg';
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

  // 1. Ambil userId & role dari localStorage + context
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

  // 2. Fetch playlists function dengan guard admin + initialized
  const fetchPlaylists = useCallback(async () => {
    if (!initialized) return;

    if (isAdmin) {
      setPlaylists([]);
      setLoadingPlaylists(false);
      return;
    }

    if (!userId) {
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

  // 3. Auto-run fetch hanya kalau sudah initialized
  useEffect(() => {
    if (initialized) {
      fetchPlaylists();
    }
  }, [fetchPlaylists, initialized]);

  // 4. GLOBAL EVENT LISTENER - Auto refresh setelah delete/create (non-admin saja)
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
    { icon: Mic2, label: 'Manage Artists', path: '/admin/artists' }, // ✅ baru
    { icon: Music, label: 'Manage Songs', path: '/admin/songs' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
  ];

  const userNavItems = [{ icon: Home, label: 'Home', path: '/home' }];

  const menuItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <MelodiaLogo className={styles.melodiaLogo} />
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {!isAdmin && (
          <>
            <button
              className={`${styles.navItem} ${styles.createPlaylistBtn}`}
              onClick={onCreatePlaylist}
              disabled={!initialized || loadingPlaylists || !userId}
            >
              <Plus size={22} />
              <span>Create Playlist</span>
            </button>

            {!initialized ? (
              <div className={styles.playlistSection}>
                <div className={styles.playlistLoading}>
                  <span>⏳</span>
                  <span>Loading sidebar...</span>
                </div>
              </div>
            ) : (
              <>
                {playlists.length > 0 && (
                  <div className={styles.divider}></div>
                )}

                <div className={styles.playlistSection}>
                  {loadingPlaylists ? (
                    <div className={styles.playlistLoading}>
                      <span>⏳</span>
                      <span>Loading playlists...</span>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className={styles.playlistEmpty}>
                      <span>📭</span>
                      <span>No playlists yet</span>
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <NavLink
                        key={playlist.playlistId}
                        to={`/playlist/${playlist.playlistId}`}
                        className={({ isActive }) =>
                          `${styles.playlistItem} ${
                            isActive ? styles.active : ''
                          }`
                        }
                      >
                        <span className={styles.playlistIcon}>🎵</span>
                        <span className={styles.playlistName}>
                          {playlist.name}
                        </span>
                      </NavLink>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
