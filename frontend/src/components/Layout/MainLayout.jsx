// components/Layout/MainLayout.jsx
import styles from './MainLayout.module.css';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PlayerBar from './PlayerBar';
import { Plus } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useMusic } from '../../context/MusicContext';
import { useState, useEffect, useMemo } from 'react';
import { musicService } from '../../services/musicService';

const MainLayout = ({ children }) => {
  const { user } = useUser();
  const { currentSong } = useMusic();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const [userId, setUserId] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const storedId =
      localStorage.getItem('userId') || localStorage.getItem('accountId');
    const storedRole =
      localStorage.getItem('role') || localStorage.getItem('accountType');

    const effectiveId = user?.accountId || storedId;
    const effectiveType = user?.accountType || storedRole;

    setUserId(effectiveId || null);
    setAccountType(effectiveType || null);
    setInitialized(true);
  }, [user]);

  const isAdmin = useMemo(() => accountType === 'ADMIN', [accountType]);
  const showPlayer = !isAdmin && currentSong !== null;

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();

    if (!initialized || !userId || isAdmin) {
      alert('Access denied');
      return;
    }

    if (!newPlaylist.name.trim()) {
      alert('Playlist name is required');
      return;
    }

    try {
      setCreating(true);

      await musicService.createPlaylist(
        userId,
        newPlaylist.name,
        newPlaylist.description
      );

      window.dispatchEvent(new CustomEvent('playlist:created'));
      console.log('🎵 playlist:created event dispatched!');

      setNewPlaylist({ name: '', description: '' });
      setShowCreateModal(false);
      alert('Playlist created successfully!');
    } catch (err) {
      console.error('Error creating playlist:', err);
      alert('Failed to create playlist: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar onCreatePlaylist={() => setShowCreateModal(true)} />

      <div className={styles.mainArea}>
        <Topbar />
        <div className={styles.pageContent}>{children}</div>
      </div>

      {showPlayer && (
        <div className={styles.playerBarWrapper}>
          <PlayerBar />
        </div>
      )}

      {showCreateModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className={styles.createPlaylistModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <Plus size={24} />
              <h3>Create New Playlist</h3>
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <div className={styles.formGroup}>
                <label htmlFor="playlistName">Name *</label>
                <input
                  id="playlistName"
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist({ ...newPlaylist, name: e.target.value })
                  }
                  placeholder="My Favorite Songs"
                  maxLength={100}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="playlistDesc">Description (optional)</label>
                <textarea
                  id="playlistDesc"
                  value={newPlaylist.description}
                  onChange={(e) =>
                    setNewPlaylist({
                      ...newPlaylist,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a description..."
                  maxLength={200}
                  rows={2}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewPlaylist({ name: '', description: '' });
                  }}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.createBtn}
                  disabled={
                    creating ||
                    !newPlaylist.name.trim() ||
                    isAdmin ||
                    !userId ||
                    !initialized
                  }
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
