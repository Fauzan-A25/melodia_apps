// src/pages/admin/ArtistManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService, handleApiError } from '../../services/adminService';
import styles from './ArtistManagement.module.css';

const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nameInput, setNameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllArtists();
      setArtists(data);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Artist name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await adminService.createArtist(nameInput.trim(), bioInput.trim());
      setNameInput('');
      setBioInput('');
      await fetchArtists();
    } catch (err) {
      console.error('Error creating artist:', err);
      setError(handleApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (artistId, artistName) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus artist "${artistName}"?\nJika masih ada lagu yang terhubung, penghapusan bisa gagal.`
      )
    ) {
      return;
    }

    try {
      await adminService.deleteArtist(artistId);
      await fetchArtists();
    } catch (err) {
      console.error('Error deleting artist:', err);
      alert(handleApiError(err));
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading artists...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Artist Management</h1>
        <p>Kelola metadata artist yang dipakai saat upload lagu</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Form tambah artist */}
      <form onSubmit={handleCreate} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Artist Name *</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Contoh: Tulus"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Bio (optional)</label>
          <textarea
            value={bioInput}
            onChange={(e) => setBioInput(e.target.value)}
            placeholder="Deskripsi singkat artist..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        <button
          type="submit"
          className={styles.createBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Add Artist'}
        </button>
      </form>

      {/* Tabel artist */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Bio</th>
              <th>Total Songs (optional)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.artistId}>
                <td>{artist.artistName}</td>
                <td className={styles.bioCell}>
                  {artist.bio && artist.bio.length > 120
                    ? artist.bio.slice(0, 120) + '...'
                    : artist.bio || '-'}
                </td>
                <td>
                  {artist.totalSongs != null
                    ? artist.totalSongs
                    : artist.songs
                    ? artist.songs.length
                    : '-'}
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() =>
                      handleDelete(artist.artistId, artist.artistName)
                    }
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {artists.length === 0 && (
          <div className={styles.emptyState}>
            <p>Belum ada artist. Tambahkan artist pertama di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistManagement;
