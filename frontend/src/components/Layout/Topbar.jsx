import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Topbar.module.css';
import {
  CircleUser,
  ChevronDown,
  BadgeMinus,
  Search,
  Upload,
  Clock,
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

const Topbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [showDropdown, setShowDropdown] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');

  const isSearchPage = location.pathname === '/search';

  // baca query dari URL hanya kalau di /search
  const queryFromUrl = useMemo(() => {
    if (!isSearchPage) return '';
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }, [isSearchPage, location.search]);

  // nilai yang tampil di input:
  // - di /search → langsung pakai URL (supaya sync)
  // - di halaman lain → pakai internal state
  const value = isSearchPage ? queryFromUrl : internalQuery;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/auth');
  };

  const saveSearchHistory = (query) => {
    try {
      const history = JSON.parse(
        localStorage.getItem('searchHistory') || '[]',
      );
      const filtered = history.filter(
        (item) => item.toLowerCase() !== query.toLowerCase(),
      );
      const newHistory = [query, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  const performSearch = (raw) => {
    const q = raw.trim();
    if (!q) return;

    saveSearchHistory(q);

    // selalu navigate ke /search dengan query baru
    navigate(`/search?q=${encodeURIComponent(q)}`);

    // kosongkan hanya state lokal (biar di luar /search input kosong)
    setInternalQuery('');
  };

  const handleSearchChange = (e) => {
    const next = e.target.value;

    if (isSearchPage) {
      // 🔁 kalau sedang di /search, langsung sync ke URL
      const params = new URLSearchParams(location.search);
      if (next) {
        params.set('q', next);
      } else {
        params.delete('q');
      }
      navigate(`/search?${params.toString()}`, { replace: true });
    } else {
      // di halaman lain, simpan di state lokal
      setInternalQuery(next);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      // pakai value yang sedang tampil (sudah konsisten)
      performSearch(value);
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.greeting}>
          Welcome back,{' '}
          <span className={styles.username}>{user?.username || 'Guest'}</span>! 👋
          {user?.accountType === 'ADMIN' && (
            <span className={styles.adminBadge}>
              <BadgeMinus size={16} />
              ADMIN
            </span>
          )}
        </span>
      </div>

      <div className={styles.center}>
        {user?.accountType !== 'ADMIN' && (
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search songs, artists..."
              value={value}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        )}
      </div>

      <div className={styles.right}>
        <div className={styles.userMenu}>
          <button
            className={styles.userBtn}
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className={styles.avatar}>
              <CircleUser size={24} />
            </div>
            <span className={styles.userName}>{user?.username || 'Guest'}</span>
            <ChevronDown size={16} className={styles.chevron} />
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <p>{user?.email}</p>
                <span className={styles.accountType}>{user?.accountType}</span>
              </div>

              {user?.accountType === 'ADMIN' && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/admin/upload');
                  }}
                >
                  <Upload size={16} />
                  Upload Song
                </button>
              )}

              {user?.accountType !== 'ADMIN' && (
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/history');
                  }}
                >
                  <Clock size={16} />
                  History
                </button>
              )}

              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/settings');
                }}
              >
                Settings
              </button>

              <button className={styles.dropdownItem} onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
