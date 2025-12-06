import { useState, useEffect } from 'react';
import styles from './Playlist.module.css';
import { Plus, Loader, Trash2, AlertCircle } from 'lucide-react';
import PlaylistCard from '../components/Music/PlaylistCard';
import { musicService } from '../services/musicService';

const Playlist = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
  });

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Debug log
  useEffect(() => {
    console.log('=== PLAYLIST PAGE DEBUG ===');
    console.log('userId from localStorage:', userId);
    if (!userId) {
      console.warn('⚠️ WARNING: userId is null! User might not be logged in.');
    }
  }, [userId]);

  // Fetch playlists on mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId) {
          console.log('No userId found, skipping playlist fetch');
          setPlaylists([]);
          setLoading(false);
          return;
        }

        console.log('Fetching playlists for userId:', userId);
        const data = await musicService.getUserPlaylists(userId);
        console.log('Playlists fetched:', data);
        setPlaylists(data || []);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('Failed to load playlists. Please try again.');
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [userId]);

  // Reusable fetch function for refresh
  const refreshPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setPlaylists([]);
        return;
      }

      const data = await musicService.getUserPlaylists(userId);
      setPlaylists(data || []);
    } catch (err) {
      console.error('Error fetching playlists:', err);
      setError('Failed to load playlists. Please try again.');
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    console.log('=== CREATE PLAYLIST ATTEMPT ===');
    console.log('userId:', userId);
    console.log('name:', newPlaylist.name);
    console.log('description:', newPlaylist.description);

    if (!userId) {
      alert('Please login first to create a playlist');
      console.error('Cannot create playlist: userId is null');
      return;
    }
    
    if (!newPlaylist.name.trim()) {
      alert('Playlist name is required');
      return;
    }

    try {
      console.log('Calling musicService.createPlaylist...');
      const result = await musicService.createPlaylist(
        userId,
        newPlaylist.name,
        newPlaylist.description
      );
      
      console.log('✅ Playlist created successfully:', result);
      
      // Reset form and close modal
      setNewPlaylist({ name: '', description: '' });
      setShowCreateModal(false);
      
      // Refresh playlist list
      await refreshPlaylists();
      
      alert('Playlist created successfully!');
    } catch (err) {
      console.error('❌ Error creating playlist:', err);
      alert('Failed to create playlist: ' + err.message);
    }
  };

  // ✅ Show delete confirmation modal
  const handleDeleteClick = (playlist) => {
    console.log('Delete clicked for playlist:', playlist);
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  // ✅ Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlaylistToDelete(null);
  };

  // ✅ Confirm delete
  const handleConfirmDelete = async () => {
    if (!playlistToDelete || !userId) {
      return;
    }

    setDeleting(true);

    try {
      console.log('=== DELETE PLAYLIST ===');
      console.log('playlistId:', playlistToDelete.playlistId);
      console.log('userId:', userId);

      await musicService.deletePlaylist(playlistToDelete.playlistId, userId);
      
      console.log('✅ Playlist deleted successfully');
      
      // Close modal
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
      
      // Refresh list
      await refreshPlaylists();
      
      alert('Playlist deleted successfully!');
    } catch (err) {
      console.error('❌ Error deleting playlist:', err);
      alert('Failed to delete playlist: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Loading state
  if (loading && playlists.length === 0) {
    return (
      <div className={styles.playlistContainer}>
        <div className={styles.loadingContainer}>
          <Loader className={styles.spinner} size={40} />
          <p>Loading playlists...</p>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!userId) {
    return (
      <div className={styles.playlistContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔒</div>
          <h2>Login Required</h2>
          <p>Please login to view and create playlists</p>
          <button 
            className={styles.emptyCreateBtn}
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.playlistContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎵 Playlist</h1>
        <button 
          className={styles.createBtn}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={16} />
          <span>Create New Playlist</span>
        </button>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button onClick={refreshPlaylists}>Retry</button>
        </div>
      )}

      <section className={styles.listSection}>
        {playlists.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No Playlists Yet</h2>
            <p>Create your first playlist to organize your favorite songs!</p>
            <button 
              className={styles.emptyCreateBtn}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.playlistId}
                playlistId={pl.playlistId}
                title={pl.name}
                description={pl.description}
                cover={pl.cover || '🎵'}
                color={pl.color || 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'}
                tracks={pl.songs || []}
                songCount={pl.songCount || pl.songs?.length || 0}
                onDelete={() => handleDeleteClick(pl)}
                userId={userId}
              />
            ))}
          </div>
        )}
      </section>

      {/* ==================== CREATE PLAYLIST MODAL ==================== */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Playlist</h2>
            <form onSubmit={handleCreatePlaylist}>
              <div className={styles.formGroup}>
                <label htmlFor="playlistName">Playlist Name *</label>
                <input
                  type="text"
                  id="playlistName"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  placeholder="Enter playlist name"
                  required
                  maxLength={100}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="playlistDescription">Description</label>
                <textarea
                  id="playlistDescription"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                  placeholder="Enter playlist description (optional)"
                  maxLength={500}
                  rows={4}
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
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteModal && playlistToDelete && (
        <div className={styles.modalOverlay} onClick={handleCancelDelete}>
          <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.deleteModalHeader}>
              <AlertCircle size={48} className={styles.warningIcon} />
              <h2>Delete Playlist?</h2>
            </div>
            
            <div className={styles.deleteModalContent}>
              <p className={styles.playlistName}>"{playlistToDelete.name}"</p>
              <p className={styles.warningText}>
                This action cannot be undone. All songs in this playlist will be removed.
              </p>
              {playlistToDelete.songCount > 0 && (
                <p className={styles.songCountWarning}>
                  <strong>{playlistToDelete.songCount}</strong> song{playlistToDelete.songCount !== 1 ? 's' : ''} will be removed from this playlist.
                </p>
              )}
            </div>

            <div className={styles.deleteModalActions}>
              <button 
                type="button" 
                className={styles.cancelBtn}
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className={styles.deleteBtn}
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader size={16} className={styles.spinner} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete Playlist
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;
