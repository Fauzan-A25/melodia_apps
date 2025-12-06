import React, { useState, useEffect } from 'react';
import { adminService, handleApiError } from '../../services/api';
import styles from './UserManagement.module.css'; // ✅ pakai CSS module

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    // Filter by type
    if (filter === 'user' && user.accountType !== 'USER') return false;
    if (filter === 'artist' && user.accountType !== 'ARTIST') return false;
    if (filter === 'banned' && !user.banned) return false; // ✅ field boolean: banned

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleBanUser = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const confirmBan = async () => {
    if (!banReason.trim()) {
      alert('Ban reason is required');
      return;
    }

    setIsProcessing(true);
    try {
      await adminService.banUser(selectedUser.accountId, banReason);
      setShowBanModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error banning user:', err);
      alert(handleApiError(err));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnbanUser = async (userId, username) => {
    if (window.confirm(`Apakah Anda yakin ingin unban user "${username}"?`)) {
      try {
        await adminService.unbanUser(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error unbanning user:', err);
        alert(handleApiError(err));
      }
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus akun "${username}"? Tindakan ini tidak dapat dibatalkan!`
      )
    ) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(handleApiError(err));
      }
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      try {
        const data = await adminService.searchUsers(searchQuery);
        setUsers(data);
      } catch (err) {
        console.error('Error searching users:', err);
        setError(handleApiError(err));
      } finally {
        setIsLoading(false);
      }
    } else {
      fetchUsers();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.userManagementContainer}>
      <div className={styles.userHeader}>
        <div>
          <h1 className={styles.pageTitle}>User & Artist Management</h1>
          <p className={styles.pageSubtitle}>Kelola akun user dan artist di Melodia</p>
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filters and Search */}
      <div className={styles.controlBar}>
        <div className={styles.filterTabs}>
          <button
            className={
              filter === 'all' ? `${styles.filterTab} ${styles.active}` : styles.filterTab
            }
            onClick={() => setFilter('all')}
          >
            All ({users.length})
          </button>
          <button
            className={
              filter === 'user' ? `${styles.filterTab} ${styles.active}` : styles.filterTab
            }
            onClick={() => setFilter('user')}
          >
            Users ({users.filter((u) => u.accountType === 'USER').length})
          </button>
          <button
            className={
              filter === 'artist' ? `${styles.filterTab} ${styles.active}` : styles.filterTab
            }
            onClick={() => setFilter('artist')}
          >
            Artists ({users.filter((u) => u.accountType === 'ARTIST').length})
          </button>
          <button
            className={
              filter === 'banned'
                ? `${styles.filterTab} ${styles.alert} ${styles.active}`
                : `${styles.filterTab} ${styles.alert}`
            }
            onClick={() => setFilter('banned')}
          >
            Banned ({users.filter((u) => u.banned).length})
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="🔍 Search username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      {/* User Table */}
      <div className={styles.userTable}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.accountId}
                className={user.banned ? styles.bannedRow : ''}
              >
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      {user.accountType === 'ARTIST' ? '🎤' : '👤'}
                    </div>
                    <div>
                      <div className={styles.userName}>{user.username}</div>
                      {user.accountType === 'ARTIST' && user.songCount != null && (
                        <div className={styles.userMeta}>{user.songCount} songs</div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      user.accountType === 'ARTIST' ? styles.artist : styles.user
                    }`}
                  >
                    {user.accountType}
                  </span>
                </td>
                <td>
                  {user.banned ? (
                    <span className={`${styles.badge} ${styles.banned}`}>🚫 Banned</span>
                  ) : (
                    <span className={`${styles.badge} ${styles.active}`}>✅ Active</span>
                  )}
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('id-ID')
                    : '-'}
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    {user.banned ? (
                      <button
                        className={styles.unbanBtn}
                        onClick={() => handleUnbanUser(user.accountId, user.username)}
                        title="Unban user"
                      >
                        🔓
                      </button>
                    ) : (
                      <button
                        className={styles.banBtn}
                        onClick={() => handleBanUser(user)}
                        title="Ban user"
                      >
                        🚫
                      </button>
                    )}
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteUser(user.accountId, user.username)}
                      title="Delete account"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className={styles.emptyState}>
            <p>No users found</p>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isProcessing && setShowBanModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Ban User: {selectedUser.username}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowBanModal(false)}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.warningText}>
                ⚠️ User akan di-ban dan tidak dapat login ke aplikasi.
              </p>

              <div className={styles.formGroup}>
                <label>Ban Reason *</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Masukkan alasan ban (wajib)..."
                  rows="4"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowBanModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBanBtn}
                onClick={confirmBan}
                disabled={!banReason.trim() || isProcessing}
              >
                {isProcessing ? 'Banning...' : 'Confirm Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
