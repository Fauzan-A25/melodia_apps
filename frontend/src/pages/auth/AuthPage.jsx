// src/pages/auth/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import styles from './AuthPage.module.css';
import { Music2, Mail, Lock, User, Headphones } from 'lucide-react';

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
    role: 'user', // tetap dikirim 'user' ke backend
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Auto redirect kalau sudah login
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

  // Sync auth error
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
      if (isLogin) {
        // LOGIN
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
        }, 500);
      } else {
        // REGISTRATION (hanya user/listener)
        const result = await register(
          formData.username,
          formData.email,
          formData.password,
          'user', // paksa role user
          '' // bio kosong
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

      if (
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

  if (contextLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              padding: '2rem',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            ></div>
            <p>Loading authentication...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
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

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
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
          </div>

          {!isLogin && (
            <div className={styles.inputGroup}>
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
            </div>
          )}

          <div className={styles.inputGroup}>
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
          </div>

          {/* Role sekarang fixed user -> cukup informasi teks saja */}
          {!isLogin && (
            <div className={styles.roleSection}>
              <label className={styles.roleLabel}>Account type:</label>
              <div className={styles.roleOptions}>
                <div
                  className={`${styles.roleOption} ${styles.roleActive}`}
                >
                  <Headphones size={24} className={styles.roleIcon} />
                  <div className={styles.roleText}>
                    <span className={styles.roleName}>Listener</span>
                    <span className={styles.roleDesc}>
                      Nikmati musik favorit Anda
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span>⏳ Loading...</span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
