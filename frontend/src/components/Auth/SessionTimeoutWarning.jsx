// src/components/Auth/SessionTimeoutWarning.jsx
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import styles from './SessionTimeoutWarning.module.css';

const SessionTimeoutWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { logout, isAuthenticated } = useAuthContext();

  useEffect(() => {
    // Early return jika tidak authenticated - tidak perlu setup interval
    if (!isAuthenticated) {
      return;
    }

    const checkWarning = () => {
      const token = authService.getToken();
      
      if (!token) {
        setShowWarning(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const now = Date.now();
        const minutesLeft = Math.floor((expiryTime - now) / 60000);
        
        // Show warning jika sisa 5 menit
        if (minutesLeft <= 5 && minutesLeft > 0) {
          setShowWarning(true);
          setTimeLeft(minutesLeft);
        } else if (minutesLeft <= 0) {
          // Token expired, hide warning (auto logout handled by useAuth)
          setShowWarning(false);
        } else {
          setShowWarning(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setShowWarning(false);
      }
    };

    // Initial check
    checkWarning();

    // Setup interval
    const intervalId = setInterval(checkWarning, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleExtendSession = async () => {
    try {
      console.log('🔄 Extending session...');
      await authService.refreshToken();
      setShowWarning(false);
      console.log('✅ Session extended successfully');
    } catch (error) {
      console.error('❌ Failed to extend session:', error);
      await logout();
    }
  };

  const handleDismiss = () => {
    setShowWarning(false);
  };

  // Don't render if not authenticated or no warning
  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <div className={styles.warningContainer}>
      <div className={styles.header}>
        <p className={styles.title}>
          ⚠️ Sesi Akan Berakhir
        </p>
        <button
          onClick={handleDismiss}
          className={styles.dismissButton}
          aria-label="Dismiss warning"
        >
          ×
        </button>
      </div>
      
      <p className={styles.message}>
        Sesi Anda akan berakhir dalam <strong>{timeLeft} menit</strong>.
        {timeLeft <= 2 && ' Segera perpanjang untuk menghindari logout otomatis.'}
      </p>
      
      <div className={styles.buttonContainer}>
        <button 
          onClick={handleExtendSession}
          className={styles.extendButton}
        >
          Perpanjang Sesi
        </button>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
