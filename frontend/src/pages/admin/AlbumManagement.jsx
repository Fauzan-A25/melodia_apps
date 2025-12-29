// pages/admin/AlbumManagement.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import styles from './AlbumManagement.module.css';
import { musicService } from '../../services/musicService';
import { adminService, handleApiError } from '../../services/adminService';

const AlbumManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // modal state
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    releaseYear: new Date().getFullYear(),
    genreNames: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [albumsData, genresData, artistsData, songsData] =
        await Promise.all([
          musicService.getAllAlbums(),
          adminService.getAllGenres(),
          adminService.getArtistsForDropdown(),
          musicService.getAllSongs(),
        ]);

      setAlbums(albumsData || []);
      setGenres(genresData || []);
      setArtists(artistsData || []);
      setAllSongs(songsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(
        handleApiError(err) || 'Failed to load data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle genre selection (checkbox)
  const handleGenreToggle = (genreName) => {
    setFormData((prev) => ({
      ...prev,
      genreNames: prev.genreNames.includes(genreName)
        ? prev.genreNames.filter((g) => g !== genreName)
        : [...prev.genreNames, genreName],
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Album title is required');
      return;
    }

    if (!formData.artistId) {
      alert('Please select an artist');
      return;
    }

    try {
      setSubmitting(true);
      await musicService.createAlbum(
        formData.title,
        formData.artistId,
        formData.releaseYear,
        formData.genreNames,
      );

      setFormData({
        title: '',
        artistId: '',
        releaseYear: new Date().getFullYear(),
        genreNames: [],
      });

      await loadData();
      alert('Album created successfully!');
    } catch (err) {
      console.error('Error creating album:', err);
      alert(handleApiError(err) || 'Failed to create album');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete album
  const handleDelete = async (albumId) => {
    if (!window.confirm('Are you sure you want to delete this album?')) {
      return;
    }

    try {
      await musicService.deleteAlbum(albumId);
      await loadData();
      alert('Album deleted successfully!');
    } catch (err) {
      console.error('Error deleting album:', err);
      alert(handleApiError(err) || 'Failed to delete album');
    }
  };

  // Open modal for manage songs
  const openManageSongs = async (album) => {
    setSelectedAlbum(null);
    setSelectedSongId('');
    setModalLoading(true);
    try {
      // ambil detail album (dengan songs) supaya list lagu up to date
      const fullAlbum = await musicService.getAlbumById(album.albumId);
      setSelectedAlbum(fullAlbum);
    } catch (err) {
      console.error('Failed to load album details:', err);
      alert(handleApiError(err) || 'Failed to load album details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedAlbum(null);
    setSelectedSongId('');
  };

  // 🔍 Filter lagu yang artistId-nya sama dengan artist album
  const songsForSelectedAlbum = useMemo(() => {
    if (!selectedAlbum) return [];
    const albumArtistId =
      selectedAlbum.artist?.artistId || selectedAlbum.artistId || null;

    console.log('[AlbumManagement] selectedAlbum artistId =', albumArtistId);

    return allSongs.filter((song) => {
      const songArtistId =
        song.artist?.artistId || song.artistId || null;
      return albumArtistId && songArtistId === albumArtistId;
    });
  }, [allSongs, selectedAlbum]);

  const handleAddSongToAlbum = async () => {
    if (!selectedAlbum || !selectedSongId) {
      alert('Please select a song');
      return;
    }

    const song = allSongs.find((s) => s.songId === selectedSongId);

    // 🔍 Debug: tampilkan ID sebagai pembanding
    console.log('[handleAddSongToAlbum] DEBUG', {
      albumId: selectedAlbum.albumId,
      albumArtistId:
        selectedAlbum.artist?.artistId || selectedAlbum.artistId,
      albumArtistName:
        selectedAlbum.artist?.artistName || selectedAlbum.artistName,
      songId: song?.songId,
      songArtistId: song?.artist?.artistId || song?.artistId,
      songArtistName:
        song?.artist?.artistName || song?.artistName,
    });

    try {
      setModalLoading(true);
      await musicService.addSongToAlbum(
        selectedAlbum.albumId,
        selectedSongId,
      );
      // refresh album detail
      const updated = await musicService.getAlbumById(
        selectedAlbum.albumId,
      );
      setSelectedAlbum(updated);
      await loadData();
      alert('Song added to album!');
    } catch (err) {
      console.error('Error adding song to album:', err);
      alert(handleApiError(err) || 'Failed to add song to album');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveSongFromAlbum = async (songId) => {
    if (!selectedAlbum) return;
    if (!window.confirm('Remove this song from album?')) return;

    try {
      setModalLoading(true);
      await musicService.removeSongFromAlbum(
        selectedAlbum.albumId,
        songId,
      );
      const updated = await musicService.getAlbumById(
        selectedAlbum.albumId,
      );
      setSelectedAlbum(updated);
      await loadData();
    } catch (err) {
      console.error('Error removing song from album:', err);
      alert(handleApiError(err) || 'Failed to remove song from album');
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading albums...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Album Management</h1>
        <p>Create and manage music albums</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Create Album Form */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Album Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter album title"
              disabled={submitting}
              required
            />
          </div>

          {/* Artist Dropdown */}
          <div className={styles.formGroup}>
            <label htmlFor="artistId">Artist *</label>
            <select
              id="artistId"
              name="artistId"
              value={formData.artistId}
              onChange={handleInputChange}
              disabled={submitting}
              required
              className={styles.select}
            >
              <option value="">Select Artist</option>
              {artists.map((artist) => (
                <option key={artist.artistId} value={artist.artistId}>
                  {artist.artistName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="releaseYear">Release Year *</label>
            <input
              type="number"
              id="releaseYear"
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Genre Selection */}
        <div className={styles.formGroup}>
          <label>Genres (Optional)</label>
          <div className={styles.genreGrid}>
            {genres.map((genre) => (
              <label
                key={genre.id || genre.name}
                className={styles.genreCheckbox}
              >
                <input
                  type="checkbox"
                  checked={formData.genreNames.includes(genre.name)}
                  onChange={() => handleGenreToggle(genre.name)}
                  disabled={submitting}
                />
                <span>{genre.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className={styles.createBtn}
          disabled={submitting}
        >
          {submitting ? 'Creating...' : 'Create Album'}
        </button>
      </form>

      {/* Albums Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Cover</th>
              <th>Title</th>
              <th>Artist</th>
              <th>Release Year</th>
              <th>Genres</th>
              <th>Songs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {albums.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.emptyState}>
                  <p>No albums found. Create your first album above!</p>
                </td>
              </tr>
            ) : (
              albums.map((album) => (
                <tr key={album.albumId}>
                  <td data-label="Cover">
                    <div className={styles.albumCover}>
                      {album.coverEmoji || '💿'}
                    </div>
                  </td>
                  <td data-label="Title" className={styles.titleCell}>
                    {album.title}
                  </td>
                  <td data-label="Artist">
                    {album.artistName ||
                      album.artist?.artistName ||
                      album.artist?.name ||
                      'Unknown'}
                  </td>
                  <td data-label="Year">{album.releaseYear}</td>
                  <td data-label="Genres" className={styles.genreCell}>
                    {album.genreNames && album.genreNames.length > 0
                      ? album.genreNames.join(', ')
                      : album.genres && album.genres.length > 0
                      ? album.genres.map((g) => g.name).join(', ')
                      : 'No genres'}
                  </td>
                  <td
                    data-label="Songs"
                    className={styles.songCountCell}
                  >
                    {(album.songCount ??
                      album.songs?.length ??
                      0) + ' songs'}
                  </td>
                  <td data-label="Actions">
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.manageSongsBtn}
                        onClick={() => openManageSongs(album)}
                      >
                        🎵 Manage Songs
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(album.albumId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Manage Songs */}
      {selectedAlbum && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>
                Manage Songs – {selectedAlbum.title} (
                {selectedAlbum.releaseYear})
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
              {/* Add song */}
              <div className={styles.addSongSection}>
                <h3>Add song to album</h3>
                <div className={styles.addSongForm}>
                  <select
                    className={styles.songSelect}
                    value={selectedSongId}
                    onChange={(e) => setSelectedSongId(e.target.value)}
                    disabled={modalLoading}
                  >
                    <option value="">Select song</option>
                    {songsForSelectedAlbum.map((song) => (
                      <option key={song.songId} value={song.songId}>
                        {song.title} –{' '}
                        {song.artist?.artistName ||
                          song.artistName ||
                          'Unknown'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={styles.addBtn}
                    onClick={handleAddSongToAlbum}
                    disabled={modalLoading || !songsForSelectedAlbum.length}
                  >
                    {modalLoading ? 'Adding...' : 'Add Song'}
                  </button>
                </div>
              </div>

              {/* Current songs */}
              <div className={styles.currentSongsSection}>
                <h3>Current songs in album</h3>
                {!selectedAlbum.songs ||
                selectedAlbum.songs.length === 0 ? (
                  <div className={styles.emptyMessage}>
                    No songs in this album yet.
                  </div>
                ) : (
                  <ul className={styles.songsList}>
                    {selectedAlbum.songs.map((song, index) => (
                      <li
                        key={song.songId}
                        className={styles.songItem}
                      >
                        <div className={styles.songNumber}>
                          {index + 1}
                        </div>
                        <div className={styles.songInfo}>
                          <div className={styles.songTitle}>
                            {song.title}
                          </div>
                          <div className={styles.songArtist}>
                            {song.artist?.artistName ||
                              song.artistName ||
                              'Unknown'}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeSongBtn}
                          onClick={() =>
                            handleRemoveSongFromAlbum(song.songId)
                          }
                          disabled={modalLoading}
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumManagement;
