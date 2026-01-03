// src/pages/auth/AuthPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthPage.module.css';

import logoImage from '../../assets/images/authPage/logo.png';
import fullBgImage from '../../assets/images/common/bg.png';
import rightOverlayImage from '../../assets/images/authPage/auth-page-bg-miring.png';

const USERNAME_REGEX = /^[^\s]+$/;

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading: contextLoading,
    login,
    register,
    user,
    error: authError,
    clearError,
    loadingMessage,
    loadingProgress,
  } = useAuthContext();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // ✅ State untuk animasi terminal bertahap
  const [terminalLines, setTerminalLines] = useState([]);
  const [lastMessage, setLastMessage] = useState('');
  const [lineCounter, setLineCounter] = useState(0); // ✅ Counter untuk unique keys
  
  // ✅ Track apakah loading sudah benar-benar selesai
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  
  // ✅ State untuk menampilkan loading terminal setelah submit
  const [showTerminalLoading, setShowTerminalLoading] = useState(false);

  // ✅ Refs untuk prevent infinite loops
  const processedErrorRef = useRef(null); // Track yang sudah di-process
  const errorTimeoutRef = useRef(null);

  // ✅ Effect untuk redirect HANYA setelah loading 100% complete dan success
  useEffect(() => {
    if (!contextLoading && isAuthenticated && user && loadingProgress === 100 && success) {
      setIsLoadingComplete(true);
      
      // Tambahkan final success message ke terminal
      const finalLine = {
        id: `final-success-${Date.now()}`, // ✅ Use timestamp
        type: 'final-success',
        text: `✓ Authentication complete! Redirecting to ${user.accountType === 'ADMIN' ? 'Admin Dashboard' : 'Home'}...`,
      };
      
      setTerminalLines((prev) => [...prev, finalLine]);
      
      // Delay 1.5 detik setelah success message untuk redirect
      const redirectTimer = setTimeout(() => {
        const from = location.state?.from?.pathname;
        let redirectPath;

        if (from && from !== '/auth') {
          redirectPath = from;
        } else {
          redirectPath =
            user.accountType === 'ADMIN' ? '/admin/dashboard' : '/home';
        }

        navigate(redirectPath, { replace: true });
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [contextLoading, isAuthenticated, user, loadingProgress, success, navigate, location.state]); // ✅ HAPUS lineCounter

  // ✅ Effect untuk handle error di terminal - PREVENT LOOP
  useEffect(() => {
    // ✅ Hanya process jika error baru (berbeda dari sebelumnya)
    if (authError && showTerminalLoading && authError !== processedErrorRef.current) {
      processedErrorRef.current = authError;

      // Tambahkan error message ke terminal
      const errorLine = {
        id: `authError-${Date.now()}`, // ✅ Gunakan timestamp untuk unique ID
        type: 'error',
        text: authError,
      };
      
      setTerminalLines((prev) => [...prev, errorLine]);
      
      // ✅ Clear existing timeout jika ada
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Setelah 3 detik, hide terminal dan reset
      errorTimeoutRef.current = setTimeout(() => {
        setShowTerminalLoading(false);
        setTerminalLines([]);
        setLastMessage('');
        setLoading(false);
        setError(authError);
        setLineCounter(0);
        processedErrorRef.current = null; // ✅ Reset ref untuk error berikutnya
      }, 3000);
    }

    // ✅ Cleanup timeout saat component unmount
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [authError, showTerminalLoading]); // ✅ HAPUS lineCounter dari dependency

  // ✅ Effect untuk menambahkan terminal line HANYA saat loadingMessage berubah
  useEffect(() => {
    if ((contextLoading || showTerminalLoading) && loadingMessage && loadingMessage !== lastMessage) {
      const storedUsername = localStorage.getItem('username') || user?.username || formData.username || 'Guest';

      // Tentukan tipe line berdasarkan message
      let lineType = 'loading';
      let displayText = loadingMessage;

      // Mapping loadingMessage ke tipe yang sesuai
      if (loadingMessage.includes('Initializing system') || 
          loadingMessage.includes('init --system')) {
        lineType = 'command';
        displayText = `melodia@auth:~$ init --system`;
      } else if (
        loadingMessage.includes('successfully') || 
        loadingMessage.includes('valid') || 
        loadingMessage.includes('verified') ||
        loadingMessage.includes('authenticated') ||
        loadingMessage.includes('loaded')
      ) {
        lineType = 'success';
      } else if (loadingMessage.includes('Welcome back')) {
        lineType = 'final';
        displayText = `Welcome back, ${storedUsername}!`;
      }

      // Tambahkan line baru dengan unique timestamp ID
      const newLine = {
        id: `line-${Date.now()}-${Math.random()}`, // ✅ Unique ID tanpa lineCounter
        type: lineType,
        text: displayText,
      };

      setTerminalLines((prev) => [...prev, newLine]);
      setLastMessage(loadingMessage);
    }
  }, [contextLoading, showTerminalLoading, loadingMessage, lastMessage, user, formData.username]); // ✅ HAPUS lineCounter

  // ✅ Reset terminal lines saat loading selesai dengan error atau cancel
  useEffect(() => {
    if (!contextLoading && !showTerminalLoading && !isLoadingComplete) {
      const timer = setTimeout(() => {
        setTerminalLines([]);
        setLastMessage('');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [contextLoading, showTerminalLoading, isLoadingComplete]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearError();
    setLoading(true);
    setShowTerminalLoading(true); // ✅ Show terminal saat submit
    setTerminalLines([]); // Reset terminal lines
    setLastMessage('');
    setLineCounter(0); // ✅ Reset counter

    try {
      if (!USERNAME_REGEX.test(formData.username)) {
        throw new Error('Username tidak boleh mengandung spasi');
      }

      if (isLogin) {
        const result = await login(formData.username, formData.password);

        if (!result.success) {
          throw new Error(result.error || 'Login failed');
        }

        setSuccess('Login successful! Redirecting...');
      } else {
        const result = await register(
          formData.username,
          formData.email,
          formData.password,
          'user',
          ''
        );

        if (!result.success) {
          throw new Error(result.error || 'Registration failed');
        }

        setSuccess('Registration successful! Redirecting...');
      }
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = err.message || 'An error occurred';

      // Translate error messages
      if (errorMessage.includes('Username tidak boleh mengandung spasi')) {
        errorMessage = 'Username tidak boleh mengandung spasi';
      } else if (errorMessage.includes('di-ban')) {
        // ✅ Keep ban error message as is - it already includes the reason
        // e.g. "Akun Anda telah di-ban. Alasan: ..."
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('Invalid credentials')
      ) {
        errorMessage = 'Username atau password salah';
      } else if (errorMessage.includes('Username already exists')) {
        errorMessage = 'Username sudah digunakan';
      } else if (errorMessage.includes('Email already exists')) {
        errorMessage = 'Email sudah terdaftar';
      } else if (errorMessage.includes('session has expired')) {
        errorMessage = 'Sesi telah berakhir, silakan login kembali';
      }

      // ✅ Tambahkan error ke terminal
      const errorLine = {
        id: `error-${lineCounter}`,
        type: 'error',
        text: `✗ ${errorMessage}`,
      };
      
      setTerminalLines((prev) => [...prev, errorLine]);
      setLineCounter(prev => prev + 1);
      
      // Hide terminal setelah 3 detik
      setTimeout(() => {
        setShowTerminalLoading(false);
        setTerminalLines([]);
        setLastMessage('');
        setLoading(false);
        setError(errorMessage);
      }, 3000);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) {
      setError('');
      clearError();
    }
    if (success) setSuccess('');
  };

  const handleToggle = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    clearError();
    setFormData({
      email: '',
      password: '',
      username: '',
      role: 'user',
      bio: '',
    });
  };

  // ✅ Render Terminal Line berdasarkan tipe
  const renderTerminalLine = (line) => {
    switch (line.type) {
      case 'command':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.terminalPrompt}>$</span>
            <span className={styles.terminalText}>{line.text}</span>
          </motion.div>
        );

      case 'loading':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.terminalPrompt}>$</span>
            <span className={styles.terminalText}>{line.text}</span>
            <span className={styles.terminalLoader}>...</span>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.terminalCheck}>✓</span>
            <span className={styles.terminalText}>{line.text}</span>
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className={styles.terminalSuccess}>✓</span>
            <span className={styles.terminalTextSuccess}>{line.text}</span>
          </motion.div>
        );

      case 'final-success':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <motion.span 
              className={styles.terminalSuccess}
              animate={{ 
                scale: [1, 1.3, 1],
                textShadow: [
                  '0 0 15px rgba(90, 247, 142, 0.8)',
                  '0 0 30px rgba(90, 247, 142, 1)',
                  '0 0 15px rgba(90, 247, 142, 0.8)',
                ]
              }}
              transition={{ duration: 0.8, repeat: 0 }}
            >
              ✓
            </motion.span>
            <span className={styles.terminalTextSuccess}>{line.text}</span>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            key={line.id}
            className={styles.terminalLine}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.span 
              className={styles.terminalError}
              animate={{ 
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 0.5 }}
            >
              ✗
            </motion.span>
            <span className={styles.terminalTextError}>{line.text}</span>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // ✅ DYNAMIC Terminal Loading - tampil saat submit atau contextLoading
  if (contextLoading || showTerminalLoading || (isAuthenticated && !isLoadingComplete && loadingProgress < 100)) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.terminalCard}>
          {/* Terminal Header */}
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.terminalBtn} style={{ background: '#ff5f56' }}></span>
              <span className={styles.terminalBtn} style={{ background: '#ffbd2e' }}></span>
              <span className={styles.terminalBtn} style={{ background: '#27c93f' }}></span>
            </div>
            <div className={styles.terminalTitle}>MELODIA Authentication System</div>
          </div>

          {/* Terminal Body - ANIMATED LINES berdasarkan loadingMessage */}
          <div className={styles.terminalBody}>
            <AnimatePresence>
              {terminalLines.map((line) => renderTerminalLine(line))}
            </AnimatePresence>

            {/* Fallback jika belum ada lines */}
            {terminalLines.length === 0 && (
              <motion.div
                className={styles.terminalLine}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className={styles.terminalPrompt}>$</span>
                <span className={styles.terminalText}>
                  {loadingMessage || 'Initializing system...'}
                </span>
                <span className={styles.terminalLoader}>...</span>
              </motion.div>
            )}
          </div>

          {/* Progress Bar - DYNAMIC dari loadingProgress */}
          <div className={styles.terminalProgress}>
            <motion.div 
              className={styles.terminalProgressBar}
              initial={{ width: '0%' }}
              animate={{ width: `${loadingProgress || 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Terminal Footer - Show current progress */}
          <div className={styles.terminalFooter}>
            <span className={styles.terminalProgressText}>
              {loadingMessage || 'Loading...'} {loadingProgress ? `[${loadingProgress}%]` : '[0%]'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      {/* Background Layer 1: Full BG dengan Animasi */}
      <motion.div 
        className={styles.bgLayer}
        style={{
          backgroundImage: `url(${fullBgImage})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
        animate={{
          backgroundPosition: isLogin 
            ? '-350px center'
            : '-900px center'
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1]
        }}
      />
      
      {/* Background Layer 2: Right Overlay */}
      <div 
        className={styles.overlayLayer}
        style={{
          backgroundImage: `url(${rightOverlayImage})`,
          backgroundSize: 'cover',
          backgroundPosition: '300px center',
        }}
      />

      {/* Logo di pojok kiri atas */}
      <div className={styles.logoContainer}>
        <img 
          src={logoImage}
          alt="Melodia Logo" 
          className={styles.melodiaLogo}
        />
      </div>
      
      {/* Toggle Buttons di kiri bawah */}
      <div className={styles.toggleButtonsLeft}>
        <button
          className={`${styles.toggleBtnLeft} ${
            isLogin ? styles.activeLeft : ''
          }`}
          onClick={() => handleToggle(true)}
          disabled={loading}
          style={{ outline: 'none', border: 'none' }}
        >
          Login
        </button>
        <button
          className={`${styles.toggleBtnLeft} ${
            !isLogin ? styles.activeLeft : ''
          }`}
          onClick={() => handleToggle(false)}
          disabled={loading}
          style={{ outline: 'none', border: 'none' }}
        >
          Register
        </button>
      </div>

      {/* Form di kanan */}
      <motion.div
        className={styles.formContent}
        layout
        transition={{
          layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        {/* Tagline */}
        <div className={styles.tagline}>
          <h1 className={styles.taglineText}>your music,</h1>
          <h1 className={styles.taglineText}>your vibe</h1>
        </div>

        {/* ✅ Error message HANYA tampil jika TIDAK ada terminal loading */}
        <AnimatePresence mode="wait">
          {error && !showTerminalLoading && (
            <motion.div
              key="error"
              className={styles.errorMessage}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Username */}
          <motion.div
            className={styles.inputGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <label className={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles.input}
              required
              disabled={loading}
              autoComplete="username"
            />
          </motion.div>

          {/* Email (Register only) */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                key="email"
                className={styles.inputGroup}
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password */}
          <motion.div
            className={styles.inputGroup}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
          >
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              minLength={6}
              disabled={loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            whileHover={{
              scale: loading ? 1 : 1.02,
              y: loading ? 0 : -2,
            }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.span
                  key="loading"
                  className={styles.submitText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  ⏳ Loading...
                </motion.span>
              ) : (
                <motion.span
                  key="enter"
                  className={styles.submitText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  Enter
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;
