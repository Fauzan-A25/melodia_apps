import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Music, X, Loader } from 'lucide-react';
import styles from './Upload.module.css';
import { musicService } from '../../services/musicService';
import { useUser } from '../../context/UserContext';
import MultiSelect from '../../components/Common/MultiSelect';

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    title: '',
    genreIds: [], // ✅ sekarang array
    releaseYear: new Date().getFullYear(),
    duration: 0,
  });

  const [audioFile, setAudioFile] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoadingGenres(true);
        const genresData = await musicService.getAllGenres();
        setGenres(genresData);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
        setError('Failed to load genres. Please refresh the page.');
      } finally {
        setLoadingGenres(false);
      }
    };

    if (user?.accountType === 'ARTIST') {
      fetchGenres();
    }
  }, [user]);

  if (!user) {
    return (
      <div className={styles.errorContainer}>
        <h2>Please Login</h2>
        <p>You need to be logged in to access this page.</p>
        <button onClick={() => navigate('/auth')} className={styles.backBtn}>
          Go to Login
        </button>
      </div>
    );
  }

  if (user.accountType !== 'ARTIST') {
    return (
      <div className={styles.errorContainer}>
        <h2>Access Denied</h2>
        <p>Only artists can upload music.</p>
        <button onClick={() => navigate('/home')} className={styles.backBtn}>
          Back to Home
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleAudioFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select a valid audio file');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        setError('Audio file too large (max 50MB)');
        return;
      }

      setAudioFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAudioPreview(previewUrl);

      const audio = new Audio(previewUrl);
      audio.onloadedmetadata = () => {
        setFormData((prev) => ({
          ...prev,
          duration: Math.floor(audio.duration),
        }));
      };

      setError('');
    }
  };

  const removeAudioFile = () => {
    if (audioPreview) {
      URL.revokeObjectURL(audioPreview);
    }
    setAudioFile(null);
    setAudioPreview(null);
    setFormData((prev) => ({ ...prev, duration: 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter song title');
      return;
    }

    if (!formData.genreIds.length) {
      setError('Please select at least one genre');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('audioFile', audioFile);
      uploadData.append('title', formData.title.trim());
      // ✅ kirim array genreIds sebagai JSON string
      uploadData.append('genreIds', JSON.stringify(formData.genreIds));
      uploadData.append('releaseYear', formData.releaseYear);
      uploadData.append('duration', formData.duration);
      uploadData.append('artistId', user.accountId);

      await musicService.uploadSong(uploadData);

      setSuccess('Song uploaded successfully! 🎉');

      setTimeout(() => {
        removeAudioFile();
        setFormData({
          title: '',
          genreIds: [],
          releaseYear: new Date().getFullYear(),
          duration: 0,
        });
        setSuccess('');
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to upload song');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadCard}>
        <div className={styles.header}>
          <UploadIcon size={32} className={styles.headerIcon} />
          <h1>Upload New Song</h1>
          <p>Share your music with the world</p>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Audio File Upload */}
          <div className={styles.fileSection}>
            <label className={styles.fileLabel}>
              <Music size={20} />
              Audio File *
            </label>

            {!audioFile ? (
              <label className={styles.fileUploadBox}>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFile}
                  className={styles.fileInput}
                />
                <UploadIcon size={48} className={styles.uploadIcon} />
                <p>Click to upload or drag and drop</p>
                <span>MP3, WAV, FLAC (max 50MB)</span>
              </label>
            ) : (
              <div className={styles.filePreview}>
                <Music size={24} />
                <div className={styles.fileInfo}>
                  <p className={styles.fileName}>{audioFile.name}</p>
                  <p className={styles.fileSize}>
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    {formData.duration > 0 &&
                      ` • ${formatDuration(formData.duration)}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeAudioFile}
                  className={styles.removeBtn}
                  aria-label="Remove audio file"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Song Details */}
          <div className={styles.inputGroup}>
            <label htmlFor="title">Song Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter song title"
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <MultiSelect
                label="Genres *"
                placeholder={
                  loadingGenres ? 'Loading genres...' : 'Select genres'
                }
                values={formData.genreIds}
                options={genres.map((genre) => ({
                  value: genre.id,
                  label: genre.name,
                }))}
                disabled={loading || loadingGenres}
                onChange={(vals) =>
                  setFormData((prev) => ({
                    ...prev,
                    genreIds: vals,
                  }))
                }
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="releaseYear">Release Year</label>
              <input
                id="releaseYear"
                type="number"
                name="releaseYear"
                value={formData.releaseYear}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear()}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => navigate('/home')}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !audioFile || loadingGenres}
            >
              {loading ? (
                <>
                  <Loader size={20} className={styles.spinner} />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon size={20} />
                  Upload Song
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
