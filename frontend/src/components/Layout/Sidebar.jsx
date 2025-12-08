import { Home, Music, ListMusic, Users, Plus } from 'lucide-react';
import MelodiaLogo from '../../assets/melodia_logo.svg?react';
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

  // ✅ 1. Ambil userId fresh dari localStorage
  useEffect(() => {
    console.log('=== SIDEBAR USER UPDATE ===');
    const id = localStorage.getItem('userId') || localStorage.getItem('accountId');
    console.log('userId from localStorage:', id);
    console.log('user context:', user);
    setUserId(id);
  }, [user]);

  // ✅ 2. Fetch playlists function
  const fetchPlaylists = useCallback(async () => {
    console.log('=== SIDEBAR PLAYLIST FETCH ===');
    console.log('userId:', userId);
    console.log('accountType:', user?.accountType);

    if (!userId || user?.accountType === 'ADMIN') {
      console.log('Skipping playlist fetch: admin or no userId');
      setPlaylists([]);
      setLoadingPlaylists(false);
      return;
    }

    try {
      setLoadingPlaylists(true);
      console.log('Fetching playlists for userId:', userId);
      const data = await musicService.getUserPlaylists(userId);
      console.log('✅ Playlists loaded:', data);
      setPlaylists(data || []);
    } catch (err) {
      console.error('❌ Error fetching playlists:', err);
      setPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [userId, user?.accountType]);

  // ✅ 3. Auto-run fetch saat userId atau accountType berubah
  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // ✅ 4. GLOBAL EVENT LISTENER - Auto refresh setelah delete/create
  useEffect(() => {
    const handlePlaylistChange = () => {
      console.log('🔄 Playlist changed globally - refreshing sidebar');
      fetchPlaylists();
    };

    // Listen untuk semua playlist changes
    window.addEventListener('playlist:refresh', handlePlaylistChange);
    window.addEventListener('playlist:created', handlePlaylistChange);
    window.addEventListener('playlist:deleted', handlePlaylistChange);

    // Cleanup
    return () => {
      window.removeEventListener('playlist:refresh', handlePlaylistChange);
      window.removeEventListener('playlist:created', handlePlaylistChange);
      window.removeEventListener('playlist:deleted', handlePlaylistChange);
    };
  }, [fetchPlaylists]);

  // Admin sidebar menu
  const adminNavItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ListMusic, label: 'Manage Genres', path: '/admin/genres' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: Music, label: 'Manage Songs', path: '/admin/songs' }
  ];

  const userNavItems = [
    { icon: Home, label: 'Home', path: '/home' }
  ];

  const menuItems = user?.accountType === 'ADMIN' ? adminNavItems : userNavItems;

  return (
    <aside className={styles.sidebar}>
      {/* ✅ LOGO SECTION dengan SVG */}
      <div className={styles.logoSection}>
        <MelodiaLogo className={styles.melodiaLogo} />
      </div>

      <nav className={styles.nav}>
        {/* Main menu items */}
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

        {/* ✅ CREATE PLAYLIST BUTTON */}
        {user?.accountType !== 'ADMIN' && (
          <button
            className={`${styles.navItem} ${styles.createPlaylistBtn}`}
            onClick={onCreatePlaylist}
            disabled={loadingPlaylists || !userId}
          >
            <Plus size={22} />
            <span>Create Playlist</span>
          </button>
        )}

        {/* Divider sebelum playlists */}
        {user?.accountType !== 'ADMIN' && playlists.length > 0 && (
          <div className={styles.divider}></div>
        )}

        {/* Dynamic Playlists */}
        {user?.accountType !== 'ADMIN' && (
          <div className={styles.playlistSection}>
            {loadingPlaylists ? (
              <div className={styles.playlistLoading}>
                <span>⏳</span> Loading playlists...
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
                    `${styles.playlistItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <span className={styles.playlistIcon}>🎵</span>
                  <span className={styles.playlistName}>{playlist.name}</span>
                </NavLink>
              ))
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
