import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, handleApiError } from '../../services/api';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalGenres: 0,
    bannedAccounts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ PERUBAHAN LOGIC: Fetch users dan hitung manual
      const allUsers = await adminService.getAllUsers();
      
      // Filter USER murni (exclude ARTIST)
      const pureUsers = allUsers.filter(u => u.accountType === 'USER');
      
      // Filter ARTIST saja
      const artists = allUsers.filter(u => u.accountType === 'ARTIST');
      
      // Hitung banned accounts
      const bannedCount = allUsers.filter(u => u.banned).length;

      // Fetch genres count
      let genresCount = 0;
      try {
        const genres = await adminService.getAllGenres();
        genresCount = genres.length;
      } catch (err) {
        console.warn('Could not fetch genres:', err);
      }

      setStats({
        totalUsers: pureUsers.length,      // ✅ USER murni saja
        totalArtists: artists.length,       // ✅ ARTIST saja
        totalGenres: genresCount,
        bannedAccounts: bannedCount
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(handleApiError(err));
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 0,
        totalArtists: 0,
        totalGenres: 0,
        bannedAccounts: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminTitle}>Admin Dashboard</h1>
        <p className={styles.adminSubtitle}>Kelola sistem Melodia</p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>⚠️ {error}</span>
          <button onClick={fetchStats}>Retry</button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎤</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalArtists}</h3>
            <p>Total Artists</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎵</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalGenres}</h3>
            <p>Music Genres</p>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.alert}`}>
          <div className={styles.statIcon}>🚫</div>
          <div className={styles.statInfo}>
            <h3>{stats.bannedAccounts}</h3>
            <p>Banned Accounts</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link to="/admin/genres" className={styles.actionCard}>
            <div className={styles.actionIcon}>🎼</div>
            <h3>Manage Genres</h3>
            <p>Tambah, edit, atau hapus genre musik</p>
          </Link>

          <Link to="/admin/users" className={styles.actionCard}>
            <div className={styles.actionIcon}>👤</div>
            <h3>Manage Users</h3>
            <p>Kelola akun user dan artist</p>
          </Link>

          <Link to="/admin/songs" className={styles.actionCard}>
            <div className={styles.actionIcon}>🎵</div>
            <h3>Manage Songs</h3>
            <p>Kelola lagu dan metadata</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
