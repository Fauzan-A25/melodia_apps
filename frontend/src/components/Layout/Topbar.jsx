import { useNavigate } from 'react-router-dom';
import styles from './Topbar.module.css';
import { CircleUser } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const Topbar = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // ✅ Click user icon = navigate to settings
  const handleUserClick = () => {
    navigate('/settings');
  };

  return (
    <header className={styles.topbar}>
      {/* ✅ Wrapper untuk greeting + icon di kanan */}
      <div className={styles.userSection}>
        <span className={styles.greeting}>
          Hello, <span className={styles.username}>{user?.username || 'Guest'}</span>
        </span>

        <button className={styles.userBtn} onClick={handleUserClick}>
          <CircleUser size={28} className={styles.userIcon} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
