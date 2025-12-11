// src/pages/auth/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import styles from './AuthPage.module.css';
import { Music2, Mail, Lock, User, Headphones, Mic2, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: contextLoading } = useUser();

  const [isLogin, setIsLogin] = useState(true);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // ✅ Auto redirect kalau sudah login (misalnya user buka /auth tapi sudah login)
  useEffect(() => {
    if (!contextLoading && isAuthenticated) {
      const redirectPath =
        user?.accountType === 'ADMIN' ? '/admin/dashboard' : '/home';
      navigate(redirectPath, { replace: true });
    }
  }, [contextLoading, isAuthenticated, user?.accountType, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Step 1 validation - untuk artist perlu ke step 2
    if (!isLogin && registrationStep === 1) {
      if (formData.role === 'artist') {
        setRegistrationStep(2);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // ==================== LOGIN ====================
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Username:', formData.username);
        
        const result = await authService.login(
          formData.username,
          formData.password
        );
        
        console.log('📦 Login result from backend:', result);

        // Simpan via authService.login → localStorage
        // Trigger refresh ke useAuth/useUser
        window.dispatchEvent(new CustomEvent('auth:refresh'));

        if (!result.accountId) {
          throw new Error('Login failed: Account ID missing');
        }

        if (!result.token) {
          throw new Error('Login failed: JWT token missing');
        }

        console.log('✅ Login successful - localStorage ready, context auto-sync:');
        console.log('  - userId:', result.accountId);
        console.log('  - username:', result.username);
        console.log('  - role:', result.accountType);
        console.log('  - token:', result.token.substring(0, 20) + '...');

        setSuccess('Login successful! Redirecting...');

        // Redirect langsung (tidak perlu tunggu context)
        const redirectPath =
          result.accountType === 'ADMIN' ? '/admin/dashboard' : '/home';
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 800);
      } else {
        // ==================== REGISTRATION ====================
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Username:', formData.username);
        console.log('Email:', formData.email);
        console.log('Role:', formData.role);
        if (formData.role === 'artist') {
          console.log('Bio length:', formData.bio.length);
        }
        
        const result = await authService.register(
          formData.username, 
          formData.email, 
          formData.password,
          formData.role,
          formData.bio
        );
        
        console.log('✅ Registration success:', result);
        setSuccess('Registration successful! Please login with your credentials.');
        
        // Reset form dan switch ke login setelah 2 detik
        setTimeout(() => {
          setIsLogin(true);
          setRegistrationStep(1);
          setFormData({ 
            username: formData.username,
            email: '', 
            password: '',
            role: 'user',
            bio: ''
          });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      
      let errorMessage = err.message || 'An error occurred';
      
      if (errorMessage.includes('401') || errorMessage.includes('Invalid credentials')) {
        errorMessage = 'Username atau password salah';
      } else if (errorMessage.includes('Username already exists')) {
        errorMessage = 'Username sudah digunakan';
      } else if (errorMessage.includes('Email already exists')) {
        errorMessage = 'Email sudah terdaftar';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleToggle = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    setSuccess('');
    setRegistrationStep(1);
    setFormData({ email: '', password: '', username: '', role: 'user', bio: '' });
  };

  const handleBackToStep1 = () => {
    setRegistrationStep(1);
    setError('');
  };

  // Optional: loading saat context masih inisialisasi
  if (contextLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <p>⏳ Loading...</p>
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
            className={`${styles.toggleBtn} ${isLogin ? styles.active : ''}`}
            onClick={() => handleToggle(true)}
            disabled={loading}
          >
            Login
          </button>
          <button
            className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
            onClick={() => handleToggle(false)}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles.successMessage}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {((!isLogin && registrationStep === 1) || isLogin) && (
            <>
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
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>

              {!isLogin && (
                <div className={styles.roleSection}>
                  <label className={styles.roleLabel}>Daftar sebagai:</label>
                  <div className={styles.roleOptions}>
                    <label className={`${styles.roleOption} ${formData.role === 'user' ? styles.roleActive : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={formData.role === 'user'}
                        onChange={handleChange}
                        className={styles.radioInput}
                        disabled={loading}
                      />
                      <Headphones size={24} className={styles.roleIcon} />
                      <div className={styles.roleText}>
                        <span className={styles.roleName}>Pendengar</span>
                        <span className={styles.roleDesc}>Nikmati musik favorit</span>
                      </div>
                    </label>

                    <label className={`${styles.roleOption} ${formData.role === 'artist' ? styles.roleActive : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="artist"
                        checked={formData.role === 'artist'}
                        onChange={handleChange}
                        className={styles.radioInput}
                        disabled={loading}
                      />
                      <Mic2 size={24} className={styles.roleIcon} />
                      <div className={styles.roleText}>
                        <span className={styles.roleName}>Musisi</span>
                        <span className={styles.roleDesc}>Upload & bagikan karya</span>
                      </div>
                    </label>
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
                ) : (
                  isLogin ? 'Sign In' : (formData.role === 'artist' ? 'Lanjutkan' : 'Create Account')
                )}
              </button>
            </>
          )}

          {!isLogin && registrationStep === 2 && formData.role === 'artist' && (
            <div className={styles.artistBioSection}>
              <button 
                type="button"
                onClick={handleBackToStep1}
                className={styles.backButton}
                disabled={loading}
              >
                <ArrowLeft size={20} />
                Kembali
              </button>

              <div className={styles.stepTitle}>
                <Mic2 size={32} className={styles.stepIcon} />
                <h3>Ceritakan tentang diri Anda</h3>
                <p className={styles.stepDesc}>Bantu pendengar mengenal musik Anda lebih dekat</p>
              </div>

              <div className={styles.inputGroup}>
                <textarea
                  name="bio"
                  placeholder="Contoh: Musisi indie dari Jakarta ..."
                  value={formData.bio}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={5}
                  required
                  minLength={20}
                  disabled={loading}
                />
                <small className={styles.charCount}>
                  {formData.bio.length} / 20 karakter minimum
                </small>
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading || formData.bio.length < 20}
              >
                {loading ? '⏳ Creating Account...' : 'Buat Akun Musisi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
