// pages/admin/AdminSong.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import styles from './AdminSong.module.css';

const AdminSong = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, song: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [songsData, genresData] = await Promise.all([
        adminService.getAllSongs(),
        adminService.getAllGenres(),
      ]);

      setSongs(songsData);
      setGenres(genresData);
      setError('');
    } catch {
      setError('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (song) => {
    setDeleteModal({ show: true, song });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.song) return;

    const songToDelete = deleteModal.song;
    try {
      await adminService.deleteSong(songToDelete.songId);
      setSongs((prevSongs) =>
        prevSongs.filter((s) => s.songId !== songToDelete.songId),
      );
      setDeleteModal({ show: false, song: null });
    } catch (err) {
      alert('Failed to delete song: ' + err.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, song: null });
  };

  const filteredSongs = songs.filter((song) => {
    const artistName =
      song.artistName ||
      song.artist?.artistName ||
      ''; // fallback ke relasi kalau perlu

    const matchesSearch =
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artistName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre =
      !filterGenre ||
      (song.genres && song.genres.some((g) => g.name === filterGenre));

    return matchesSearch && matchesGenre;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading all songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🎵 Song Management</h1>
        <p>Manage all songs in the platform</p>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={fetchData} style={{ marginLeft: '10px' }}>
            Retry
          </button>
        </div>
      )}

      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option
              key={genre.genreId || genre.id || `genre-${genre.name}`}
              value={genre.name}
            >
              {genre.name}
            </option>
          ))}
        </select>

        <div className={styles.stats}>
          Showing: <strong>{filteredSongs.length}</strong> / {songs.length} songs
        </div>
      </div>

      {filteredSongs.length === 0 ? (
        <div className={styles.empty}>
          {searchQuery || filterGenre
            ? 'No songs found matching your criteria'
            : 'No songs available'}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Artist</th>
                <th>Genre</th>
                <th>Year</th>
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
                  <td>{song.artistName || song.artist?.artistName || 'Unknown Artist'}</td>
                  <td>
                    {song.genres && song.genres.length > 0 ? (
                      <div className={styles.genresWrapper}>
                        {song.genres.map((genre, index) => {
                          const genreKey = genre.genreId
                            ? `${song.songId}-${genre.genreId}`
                            : `${song.songId}-${genre.name}-${index}`;

                          return (
                            <span
                              key={genreKey}
                              className={styles.genreBadge}
                            >
                              {genre.name}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className={styles.genreBadge}>Unknown</span>
                    )}
                  </td>
                  <td>{song.releaseYear || 'N/A'}</td>
                  <td>{formatDuration(song.duration)}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteClick(song)}
                      className={styles.deleteBtn}
                      title={`Delete "${song.title}"`}
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

      {deleteModal.show && deleteModal.song && (
        <div
          className={styles.modalOverlay}
          onClick={handleDeleteCancel}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>⚠️ Delete Song</h2>
            <p>
              Are you sure you want to delete{' '}
              <strong>"{deleteModal.song.title}"</strong> by{' '}
              <strong>
                {deleteModal.song.artistName ||
                  deleteModal.song.artist?.artistName ||
                  'Unknown'}
              </strong>
              ?
            </p>
            <p className={styles.warning}>
              ⚠️ This action is permanent and cannot be undone. The song will
              be removed from all playlists.
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={handleDeleteCancel}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={styles.confirmDeleteBtn}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default AdminSong;
