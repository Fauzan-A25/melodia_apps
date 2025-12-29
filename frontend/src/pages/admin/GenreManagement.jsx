import React, { useState, useEffect } from 'react';
import { adminService, handleApiError } from '../../services/adminService';
import styles from './GenreManagement.module.css';  // ✅ Import dengan styles

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    genreName: '',
    description: ''
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllGenres();
      setGenres(data);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGenre = () => {
    setFormData({ genreName: '', description: '' });
    setEditingGenre(null);
    setShowAddModal(true);
  };

  const handleEditGenre = (genre) => {
    setFormData({
      genreName: genre.name,  // ✅ Changed from genre.genreName to genre.name
      description: genre.description
    });
    setEditingGenre(genre);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      if (editingGenre) {
        await adminService.updateGenre(
          editingGenre.id,  // ✅ Changed from editingGenre.genreId to editingGenre.id
          formData.genreName, 
          formData.description
        );
      } else {
        await adminService.createGenre(
          formData.genreName, 
          formData.description
        );
      }
      
      setShowAddModal(false);
      fetchGenres();
    } catch (err) {
      console.error('Error saving genre:', err);
      setError(handleApiError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGenre = async (genreId, genreName) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus genre "${genreName}"?`)) {
      try {
        await adminService.deleteGenre(genreId);
        fetchGenres();
      } catch (err) {
        console.error('Error deleting genre:', err);
        alert(handleApiError(err));
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading genres...</p>
      </div>
    );
  }

  return (
    <div className={styles.genreContainer}>
      <div className={styles.genreHeader}>
        <div>
          <h1 className={styles.pageTitle}>Genre Management</h1>
          <p className={styles.pageSubtitle}>Kelola genre musik di Melodia</p>
        </div>
        <button className={styles.addBtn} onClick={handleAddGenre}>
          ➕ Add New Genre
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Genre List */}
      <div className={styles.genreList}>
        {genres.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada genre. Tambahkan genre pertama Anda!</p>
          </div>
        ) : (
          genres.map((genre) => (
            <div key={genre.id} className={styles.genreCard}>  {/* ✅ Changed from genre.genreId to genre.id */}
              <div className={styles.genreIcon}>🎵</div>
              <div className={styles.genreInfo}>
                <h3>{genre.name}</h3>  {/* ✅ Changed from genre.genreName to genre.name */}
                <p>{genre.description || 'No description'}</p>
                {genre.songCount !== undefined && (
                  <span className={styles.songCount}>{genre.songCount} songs</span>
                )}
              </div>
              <div className={styles.genreActions}>
                <button 
                  className={styles.editBtn}
                  onClick={() => handleEditGenre(genre)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteGenre(genre.id, genre.name)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => !isSaving && setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingGenre ? 'Edit Genre' : 'Add New Genre'}</h2>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Genre Name *</label>
                <input
                  type="text"
                  value={formData.genreName}
                  onChange={(e) => setFormData({...formData, genreName: e.target.value})}
                  placeholder="e.g., Pop, Rock, Jazz"
                  required
                  disabled={isSaving}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter genre description..."
                  rows="4"
                  disabled={isSaving}
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : (editingGenre ? 'Update' : 'Add')} Genre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreManagement;
