// pages/settings/ArtistSong.jsx
import React, { useState, useEffect } from 'react';
import { musicService } from '../../services/musicService';
import styles from './ArtistSong.module.css';


const ArtistSong = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, song: null });
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchArtistSongs = async () => {
      try {
        setLoading(true);
        
        const artistId = localStorage.getItem('accountId') || 
                         localStorage.getItem('userId');
        
        if (!artistId) {
          setError('Artist ID not found. Please login again.');
          setLoading(false);
          return;
        }
        
        const data = await musicService.getArtistSongs(artistId);
        setSongs(data);
        setError('');
      } catch (err) {
        setError('Failed to load your songs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistSongs();
  }, []);


  const handleDeleteClick = (song) => {
    setDeleteModal({ show: true, song });
  };


  const handleDeleteConfirm = async () => {
    const songToDelete = deleteModal.song;
    try {
      const artistId = localStorage.getItem('accountId') || 
                       localStorage.getItem('userId');
      
      if (!artistId) {
        alert('Artist ID not found. Please login again.');
        return;
      }
      
      await musicService.deleteSong(songToDelete.songId, artistId);
      setSongs(songs.filter(s => s.songId !== songToDelete.songId));
      setDeleteModal({ show: false, song: null });
    } catch (err) {
      alert('Failed to delete song: ' + err.message);
    }
  };


  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, song: null });
  };


  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your songs...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Uploaded Songs</h1>
        <p>Manage and delete your uploaded songs</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search your songs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.stats}>
          Total Songs: <strong>{songs.length}</strong>
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className={styles.empty}>
          {searchQuery ? 'No songs match your search' : "You haven't uploaded any songs yet"}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>Release Year</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map((song) => (
                <tr key={song.songId}>
                  <td className={styles.titleCell}>
                    <div className={styles.titleInfo}>
                      <span className={styles.songTitle}>{song.title}</span>
                    </div>
                  </td>
                  <td>
                    {song.genres && song.genres.length > 0 ? (
                      <div className={styles.genresWrapper}>
                        {song.genres.map((genre, index) => (
                          <span key={index} className={styles.genreBadge}>
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td>{song.releaseYear}</td>
                  <td>{formatDuration(song.duration)}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(song)}
                      className={styles.deleteBtn}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className={styles.modalOverlay} onClick={handleDeleteCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Delete Song</h2>
            <p>
              Are you sure you want to delete <strong>"{deleteModal.song.title}"</strong>?
            </p>
            <p className={styles.warning}>
              This action cannot be undone and will permanently remove this song.
            </p>
            <div className={styles.modalActions}>
              <button onClick={handleDeleteCancel} className={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className={styles.confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// Helper function untuk format durasi
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};


export default ArtistSong;
