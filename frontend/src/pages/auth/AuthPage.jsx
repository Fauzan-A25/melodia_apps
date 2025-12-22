// src/pages/auth/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthPage.module.css';
import { Music2, Mail, Lock, User } from 'lucide-react';

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

  useEffect(() => {
    if (!contextLoading && isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      let redirectPath;

      if (from && from !== '/auth') {
        redirectPath = from;
      } else {
        redirectPath =
          user.accountType === 'ADMIN' ? '/admin/dashboard' : '/home';
      }

      navigate(redirectPath, { replace: true });
    }
  }, [contextLoading, isAuthenticated, user, navigate, location.state]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setLoading(false);
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearError();
    setLoading(true);

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

        const from = location.state?.from?.pathname;
        let redirectPath;

        if (from && from !== '/auth') {
          redirectPath = from;
        } else {
          redirectPath =
            result.user.accountType === 'ADMIN'
              ? '/admin/dashboard'
              : '/home';
        }

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
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

        const redirectPath =
          result.user.accountType === 'ADMIN'
            ? '/admin/dashboard'
            : '/home';

        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      }
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = err.message || 'An error occurred';

      if (errorMessage.includes('Username tidak boleh mengandung spasi')) {
        errorMessage = 'Username tidak boleh mengandung spasi';
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

      setError(errorMessage);
      setLoading(false);
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

  // Loading Screen
  if (contextLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.blob3}></div>

        <div className={styles.loadingCard}>
          <div className={styles.musicNotesContainer}>
            <Music2 size={64} className={styles.loadingLogo} />
            <div className={styles.musicNote}>♪</div>
            <div className={styles.musicNote}>♫</div>
            <div className={styles.musicNote}>♪</div>
            <div className={styles.musicNote}>♫</div>
          </div>

          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
            <div className={styles.spinnerPulse}></div>
          </div>

          <div className={styles.loadingTextContainer}>
            <h2 className={styles.loadingTitle}>MELODIA</h2>
            <p className={styles.loadingText}>
              <span className={styles.loadingDot}>.</span>
              <span className={styles.loadingDot}>.</span>
              <span className={styles.loadingDot}>.</span>
            </p>
            <p className={styles.loadingSubtext}>
              Preparing your music experience
            </p>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>
      <div className={styles.blob3}></div>

      <motion.div
        className={styles.authCard}
        layout
        transition={{
          layout: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
        }}
      >
        <div className={styles.logoSection}>
          <Music2 size={48} className={styles.logo} />
          <h1 className={styles.title}>MELODIA</h1>
          <p className={styles.subtitle}>Your Music, Your Vibe</p>
        </div>

        <div className={styles.toggleButtons}>
          <button
            className={`${styles.toggleBtn} ${
              isLogin ? styles.active : ''
            }`}
            onClick={() => handleToggle(true)}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`${styles.toggleBtn} ${
              !isLogin ? styles.active : ''
            }`}
            onClick={() => handleToggle(false)}
            disabled={loading}
          >
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
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

        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              className={styles.successMessage}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {success}
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
            <User size={20} className={styles.icon} />
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
                <Mail size={20} className={styles.icon} />
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
            <Lock size={20} className={styles.icon} />
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

          {/* Submit Button dengan smooth text transition */}
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
              ) : isLogin ? (
                <motion.span
                  key="signin"
                  className={styles.submitText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  Sign In
                </motion.span>
              ) : (
                <motion.span
                  key="register"
                  className={styles.submitText}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  Create Account
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
