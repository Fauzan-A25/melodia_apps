import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import {
  User,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Clock,
  Upload,
  LogOut,
  Play,
  Pause,
  User as UserIcon,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useMusic } from '../../context/MusicContext';
import { authService } from '../../services/authService';
import { musicService } from '../../services/musicService';

const Settings = () => {
  const { user, logout, updateUser } = useUser();
  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
  } = useMusic();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // History state
  const [historySongs, setHistorySongs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      username: user.username || '',
      email: user.email || '',
    });
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ✅ Load history when History tab is active
  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab !== 'history') return;
      if (!user?.accountId) return;

      try {
        setLoadingHistory(true);
        const response = await musicService.getPlayedSongs(user.accountId);
        setHistorySongs(response.songs || []);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setHistorySongs([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeTab, user]);

  // ✅ Dynamic tabs based on user type
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    ...(user?.accountType !== 'ADMIN'
      ? [{ id: 'history', icon: Clock, label: 'History' }]
      : []),
    ...(user?.accountType === 'ADMIN'
      ? [{ id: 'upload', icon: Upload, label: 'Upload Song' }]
      : []),
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'danger', icon: Trash2, label: 'Delete Account' },
    { id: 'logout', icon: LogOut, label: 'Logout' },
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.updateProfile(
        profileForm,
        user?.accountType
      );
      updateUser(response);
      showMessage('success', 'Profile updated successfully!');
    } catch (error) {
      showMessage('error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        user.username
      );
      showMessage('success', 'Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      showMessage('error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone!'
    );

    if (!confirmed) return;

    const doubleCheck = window.prompt('Type "DELETE" to confirm:');
    if (doubleCheck !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled');
      return;
    }

    setIsLoading(true);

    try {
      await authService.deleteAccount(user.username);
      logout();
      navigate('/auth');
    } catch (error) {
      showMessage('error', error.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleTabClick = (tabId) => {
    if (tabId === 'logout') {
      setShowLogoutModal(true);
    } else if (tabId === 'upload') {
      navigate('/admin/upload');
    } else {
      setActiveTab(tabId);
    }
  };

  // ✅ History playlist
  const historyPlaylist = useMemo(
    () =>
      (historySongs || []).map((track) => ({
        ...track,
        songId: track.songId || track.id,
        id: track.songId || track.id,
        title: track.title,
        artist:
          track.artist?.name ||
          track.artistName ||
          track.artist?.username ||
          'Unknown Artist',
        coverEmoji: track.coverEmoji || '🎵',
        cover: track.coverEmoji || '🎵',
        audioUrl: musicService.getStreamUrl(track.songId || track.id),
      })),
    [historySongs]
  );

  // ✅ Play handler for history
  const handlePlayHistory = (songIndex) => {
    const song = historyPlaylist[songIndex];
    if (!song) return;

    const currentId = currentSong?.songId || currentSong?.id;
    const clickedId = song.songId || song.id;

    if (clickedId && currentId && clickedId === currentId && isPlaying) {
      togglePlay();
      return;
    }

    playSong(song, historyPlaylist, songIndex);
  };

  const isTrackPlaying = (track) => {
    const trackId = track.songId || track.id;
    const currentId = currentSong?.songId || currentSong?.id;
    return !!trackId && !!currentId && trackId === currentId && isPlaying;
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1>{activeTab === 'history' ? 'Your History' : 'Settings'}</h1>
        <p>
          {activeTab === 'history'
            ? 'View your recently played songs'
            : 'Manage your account settings'}
        </p>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <div className={styles.settingsContent}>
        <div className={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${
                activeTab === tab.id ? styles.active : ''
              } ${tab.id === 'logout' ? styles.logoutBtn : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className={styles.section}>
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className={styles.formGroup}>
                  <label>Username</label>
                  <input
                    type="text"
                    value={profileForm.username}
                    disabled
                    className={styles.disabled}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    disabled
                    className={styles.disabled}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Account Type</label>
                  <input
                    type="text"
                    value={user?.accountType}
                    disabled
                    className={styles.disabled}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isLoading}
                >
                  <Save size={18} />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* ✅ HISTORY TAB */}
          {activeTab === 'history' && (
            <div className={styles.historySection}>
              {loadingHistory ? (
                <div className={styles.historyEmpty}>⏳ Loading history...</div>
              ) : historySongs.length > 0 ? (
                <div className={styles.historyGrid}>
                  {historySongs.map((track, index) => {
                    const playing = isTrackPlaying(track);

                    return (
                      <div
                        className={`${styles.historyCard} ${
                          playing ? styles.playingCard : ''
                        }`}
                        key={track.id || track.songId}
                      >
                        <div className={styles.historyCover}>
                          {track.coverEmoji || '🎵'}
                        </div>

                        <button
                          className={`${styles.historyPlayBtn} ${
                            playing ? styles.playingBtn : ''
                          }`}
                          onClick={() => handlePlayHistory(index)}
                          title={playing ? 'Pause' : 'Play song'}
                        >
                          {playing ? (
                            <Pause size={20} fill="currentColor" />
                          ) : (
                            <Play size={20} fill="currentColor" />
                          )}
                        </button>

                        <div className={styles.historyInfo}>
                          <span className={styles.historyTitle}>
                            {track.title || 'Untitled'}
                          </span>
                          <span className={styles.historyArtist}>
                            {track.artist?.name ||
                              track.artistName ||
                              track.artist?.username ||
                              'Unknown Artist'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.historyEmpty}>📭 No history yet.</div>
              )}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className={styles.section}>
              <h2>Change Password</h2>
              <form onSubmit={handlePasswordChange}>
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                    >
                      {showPasswords.current ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                    >
                      {showPasswords.new ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isLoading}
                >
                  <Lock size={18} />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* DANGER ZONE TAB */}
          {activeTab === 'danger' && (
            <div className={styles.section}>
              <h2>Danger Zone</h2>
              <div className={styles.dangerZone}>
                <div className={styles.dangerInfo}>
                  <Trash2 size={24} />
                  <div>
                    <h3>Delete Account</h3>
                    <p>
                      Permanently delete your account and all data. This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ LOGOUT MODAL */}
      {showLogoutModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowLogoutModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Are you sure wanna logout?</h2>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalNoBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                No
              </button>
              <button className={styles.modalYesBtn} onClick={handleLogout}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
