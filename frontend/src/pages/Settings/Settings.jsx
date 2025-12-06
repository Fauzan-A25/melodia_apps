import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import {
  User,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { authService } from '../../services/authService';

const Settings = () => {
  const { user, logout, updateUser } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.accountType === 'ARTIST' ? user?.bio || '' : '',
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      username: user.username || '',
      email: user.email || '',
      bio: user.accountType === 'ARTIST' ? user.bio || '' : '',
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

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'danger', icon: Trash2, label: 'Account' },
  ];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.updateProfile(profileForm, user?.accountType);
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
      'Are you sure you want to delete your account? This action cannot be undone!',
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

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account settings</p>
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
              }`}
              onClick={() => setActiveTab(tab.id)}
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

                {user?.accountType === 'ARTIST' && (
                  <div className={styles.formGroup}>
                    <label>Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          bio: e.target.value,
                        })
                      }
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                )}

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
    </div>
  );
};

export default Settings;
