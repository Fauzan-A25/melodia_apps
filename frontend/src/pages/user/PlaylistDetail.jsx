import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, Trash2, Music, Clock, AlertCircle, Loader 
} from 'lucide-react';
import styles from './PlaylistDetail.module.css';
import { musicService } from '../../services/musicService';
import { useMusic } from '../../context/MusicContext';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  
  const { 
    currentSong, 
    isPlaying, 
    playSong,
    queue 
  } = useMusic();
  
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSong, setHoveredSong] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ FIXED: Konsisten dengan Sidebar - pakai accountId
  const userId = localStorage.getItem('accountId') || localStorage.getItem('userId');

  // ✅ Helper function to normalize song data
  const normalizeSongData = (song) => {
    return {
      ...song,
      // Handle artist field variations
      artist: song.artist || {
        username: song.artistName || song.artist_name || 'Unknown Artist'
      },
      // Ensure duration is a number
      duration: typeof song.duration === 'number' ? song.duration : (parseInt(song.duration) || 0),
    };
  };

  // ✅ Fetch playlist detail & songs
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Playlist detail
      const playlistData = await musicService.getPlaylistById(playlistId);
      setPlaylist(playlistData);

      // Songs - with data normalization
      let songsData = await musicService.getPlaylistSongs(playlistId);
      console.log('Raw songs data from API:', songsData);
      
      // Normalize all songs
      if (Array.isArray(songsData)) {
        songsData = songsData.map(song => normalizeSongData(song));
      }
      
      setSongs(songsData || []);

      console.log('Playlist loaded:', playlistData);
      console.log('Songs after normalization:', songsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load playlist');
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ DEBUG LOG - Hapus setelah fix
  useEffect(() => {
    if (playlist && userId) {
      console.log('=== PLAYLIST DETAIL DEBUG ===');
      console.log('userId (localStorage):', userId);
      console.log('playlist:', playlist);
      console.log('playlist.owner:', playlist.owner);
      console.log('owner.userId:', playlist.owner?.userId);
      console.log('owner.accountId:', playlist.owner?.accountId);
    }
  }, [playlist, userId]);

  // ✅ FIXED: isOwner check - support semua format ID
  const isOwner = playlist && userId && (
    playlist.owner?.userId === userId || 
    playlist.owner?.accountId === userId ||
    playlist.owner?.id === userId
  );

  console.log('isOwner:', isOwner);

  // ✅ Delete Playlist
  const handleDeletePlaylist = () => {
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPlaylistToDelete(null);
  };

  // ✅ FIXED: Tambah EVENT EMITTER untuk auto refresh sidebar
  const handleConfirmDelete = async () => {
    if (!playlistToDelete || !userId) return;

    setDeleting(true);

    try {
      await musicService.deletePlaylist(playlistToDelete.playlistId, userId);
      
      // ✅ EMIT GLOBAL EVENT - Auto refresh sidebar
      window.dispatchEvent(new CustomEvent('playlist:deleted'));
      
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
      navigate('/home');
      alert('Playlist deleted successfully!');
    } catch (err) {
      console.error('Error deleting playlist:', err);
      alert('Failed to delete playlist: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Play handlers
  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  const handlePlaySong = (song, index) => {
    playSong(song, songs, index);
  };

  // Remove song from playlist - JUGA emit event
  const handleRemoveSong = async (songId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Remove this song from playlist?')) {
      return;
    }

    try {
      await musicService.removeSongFromPlaylist(playlistId, songId, userId);
      
      // ✅ EMIT EVENT untuk refresh sidebar (jika song count berubah)
      window.dispatchEvent(new CustomEvent('playlist:refresh'));
      
      await fetchData();
      alert('Song removed from playlist');
    } catch (err) {
      console.error('Error removing song:', err);
      alert('Failed to remove song');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || typeof seconds !== 'number') return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    try {
      const total = songs.reduce((acc, song) => {
        const duration = typeof song.duration === 'number' ? song.duration : (parseInt(song.duration) || 0);
        return acc + duration;
      }, 0);
      const mins = Math.floor(total / 60);
      return `${mins} min`;
    } catch (err) {
      console.error('Error calculating total duration:', err);
      return `${songs.length} songs`;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Music size={48} className={styles.spinner} />
          <p>Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || 'Playlist not found'}</p>
          <button onClick={() => navigate('/home')}>Go to Home</button>
        </div>
      </div>
    );
  }

  const isCurrentPlaylist = queue.length > 0 && 
    songs.some(s => queue.some(q => q.songId === s.songId));

  return (
    <div className={styles.container}>
      {/* Header */}
      <div 
        className={styles.header}
        style={{
          background: playlist.color || 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
        }}
      >
        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={24} />
        </button>

        <div className={styles.headerContent}>
          <div className={styles.coverLarge}>
            {playlist.cover || '🎵'}
          </div>

          <div className={styles.headerInfo}>
            <p className={styles.type}>Playlist</p>
            <h1 className={styles.playlistTitle}>{playlist.name}</h1>
            {playlist.description && (
              <p className={styles.description}>{playlist.description}</p>
            )}
            <div className={styles.meta}>
              <span className={styles.owner}>
                {playlist.owner?.username || 'Unknown'}
              </span>
              <span className={styles.dot}>•</span>
              <span>{songs.length} songs</span>
              {songs.length > 0 && (
                <>
                  <span className={styles.dot}>•</span>
                  <span>{getTotalDuration()}</span>
                </>
              )}
            </div>
          </div>

          {/* ✅ DELETE BUTTON - Hanya untuk owner - POSISI KANAN ATAS */}
          {isOwner && (
            <button 
              className={styles.deletePlaylistBtn}
              onClick={handleDeletePlaylist}
              title="Delete playlist"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button 
          className={styles.playAllBtn}
          onClick={handlePlayAll}
          disabled={songs.length === 0}
        >
          {isPlaying && isCurrentPlaylist ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>
      </div>

      {/* Song List */}
      <div className={styles.songList}>
        {songs.length === 0 ? (
          <div className={styles.emptyState}>
            <Music size={64} />
            <p>No songs in this playlist yet</p>
            <button onClick={() => navigate('/home')}>
              Browse Music
            </button>
          </div>
        ) : (
          <div className={styles.table}>
            {/* Table Header */}
            <div className={styles.tableHeader}>
              <div className={styles.colNum}>#</div>
              <div className={styles.colTitle}>Title</div>
              <div className={styles.colArtist}>Artist</div>
              <div className={styles.colDuration}>
                <Clock size={16} />
              </div>
              <div className={styles.colActions}></div>
            </div>

            {/* Table Rows */}
            {songs.map((song, index) => {
              const isCurrentSong = currentSong?.songId === song.songId;
              const isPlayed = isCurrentSong && isPlaying;

              return (
                <div
                  key={song.songId}
                  className={`${styles.tableRow} ${isCurrentSong ? styles.active : ''}`}
                  onMouseEnter={() => setHoveredSong(song.songId)}
                  onMouseLeave={() => setHoveredSong(null)}
                  onClick={() => handlePlaySong(song, index)}
                >
                  <div className={styles.colNum}>
                    {isPlayed ? (
                      <div className={styles.playingIndicator}>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                        <div className={styles.bar}></div>
                      </div>
                    ) : hoveredSong === song.songId ? (
                      <Play size={16} fill="currentColor" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>

                  <div className={styles.colTitle}>
                    <div className={styles.songInfo}>
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt={song.title} className={styles.songCover} />
                      ) : (
                        <div className={styles.songCoverPlaceholder}>
                          <Music size={16} />
                        </div>
                      )}
                      <div className={styles.songText}>
                        <p className={styles.songTitle}>{song.title}</p>
                        <p className={styles.songArtistMobile}>
                          {song.artist?.username || song.artistName || song.artist_name || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.colArtist}>
                    {song.artist?.username || song.artistName || song.artist_name || 'Unknown Artist'}
                  </div>

                  <div className={styles.colDuration}>
                    {formatDuration(song.duration)}
                  </div>

                  <div className={styles.colActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={(e) => handleRemoveSong(song.songId, e)}
                      title="Remove from playlist"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ DELETE PLAYLIST CONFIRMATION MODAL */}
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
                  <strong>{playlistToDelete.songCount}</strong> song{playlistToDelete.songCount !== 1 ? 's' : ''} will be removed.
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

export default PlaylistDetail;
