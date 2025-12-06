import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Topbar.module.css';
import { Bell, CircleUser, ChevronDown, BadgeMinus, Search, Music, Upload } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const Topbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/auth');
  };

  // ✅ Derived value dari URL (tanpa setState di effect)
  const queryFromUrl = useMemo(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      return params.get('q') || '';
    }
    return '';
  }, [location.pathname, location.search]);

  // ✅ Display value: gunakan URL query jika di search page, otherwise gunakan internal
  const displayQuery = location.pathname === '/search' ? queryFromUrl : internalQuery;

  // ✅ Handle input change
  const handleSearchChange = (e) => {
    setInternalQuery(e.target.value);
  };

  // ✅ Handle Enter key untuk search
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && internalQuery.trim()) {
      saveSearchHistory(internalQuery.trim());
      navigate(`/search?q=${encodeURIComponent(internalQuery.trim())}`);
      setInternalQuery(''); // Clear internal query setelah navigate
    }
  };

  // ✅ Simpan search history ke localStorage
  const saveSearchHistory = (query) => {
    try {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
      const newHistory = [query, ...filtered].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error saving search history:', err);
    }
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <span className={styles.greeting}>
          Welcome back, <span className={styles.username}>{user?.username || 'Guest'}</span>! 👋
          {user?.accountType === 'ADMIN' && (
            <span className={styles.adminBadge}>
              <BadgeMinus size={16} />
              ADMIN
            </span>
          )}
        </span>
      </div>

      <div className={styles.center}>
        {/* ✅ Search Bar (hanya untuk non-admin) */}
        {user?.accountType !== 'ADMIN' && (
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search songs, artists..."
              value={displayQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        )}
      </div>
      
      <div className={styles.right}>
        {/* Notifikasi (hanya untuk non-admin) */}
        {user?.accountType !== 'ADMIN' && (
          <button className={styles.iconBtn} title="Notifications">
            <Bell size={20} />
            <span className={styles.badge}>3</span>
          </button>
        )}
        
        <div className={styles.userMenu}>
          <button 
            className={styles.userBtn}
            onClick={() => setShowDropdown(!showDropdown)}
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
              
              {/* ✅ Upload Song untuk Artist */}
              {user?.accountType === 'ARTIST' && (
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/upload');
                  }}
                >
                  <Upload size={16} />
                  Upload Song
                </button>
              )}
              
              {/* ✅ My Songs untuk Artist */}
              {user?.accountType === 'ARTIST' && (
                <button 
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/settings/my-songs');
                  }}
                >
                  <Music size={16} />
                  My Songs
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
