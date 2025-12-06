import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import styles from './AuthPage.module.css';
import { Music2, Mail, Lock, User, Headphones, Mic2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login: loginUser } = useUser();
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Step 1 validation
    if (!isLogin && registrationStep === 1) {
      if (formData.role === 'artist') {
        setRegistrationStep(2);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        // ✅ LOGIN
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Username:', formData.username);
        
        const result = await authService.login(
          formData.username,
          formData.password
        );
        
        console.log('📦 Login result from backend:', result);
        console.log('Available fields:', Object.keys(result));

        // ✅ PENTING: Simpan ke localStorage
        if (result.accountId) {
          // accountType bisa "USER" atau "ARTIST" dari backend
          const role = result.accountType || result.role || 'user';
          
          localStorage.setItem('userId', result.accountId);
          localStorage.setItem('username', result.username);
          localStorage.setItem('role', role);
          localStorage.setItem('email', result.email || '');
          
          // Jika artist, simpan bio juga
          if (result.bio) {
            localStorage.setItem('bio', result.bio);
          }
          
          console.log('✅ User data saved to localStorage:');
          console.log('  - userId:', result.accountId);
          console.log('  - username:', result.username);
          console.log('  - role:', role);
          console.log('  - email:', result.email);
          if (result.bio) {
            console.log('  - bio:', result.bio.substring(0, 50) + '...');
          }
        } else {
          console.error('⚠️ WARNING: accountId not found in login result!');
          console.log('Full result:', JSON.stringify(result, null, 2));
          
          // Coba cari field alternatif
          if (result.id) {
            console.log('Found "id" field, using as userId');
            localStorage.setItem('userId', result.id);
          } else if (result.userId) {
            console.log('Found "userId" field');
            localStorage.setItem('userId', result.userId);
          } else {
            throw new Error('User ID not found in login response');
          }
        }

        // Update context
        loginUser(result);
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          navigate('/home');
        }, 1000);
        
      } else {
        // ✅ REGISTRATION
        console.log('=== REGISTRATION ATTEMPT ===');
        console.log('Username:', formData.username);
        console.log('Role:', formData.role);
        
        const result = await authService.register(
          formData.username, 
          formData.email, 
          formData.password,
          formData.role,
          formData.bio
        );
        
        console.log('✅ Registration success:', result);
        setSuccess('Registration successful! Please login.');
        
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
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      setError(err.message || 'An error occurred');
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
          >
            Login
          </button>
          <button
            className={`${styles.toggleBtn} ${!isLogin ? styles.active : ''}`}
            onClick={() => handleToggle(false)}
          >
            Register
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          {(!isLogin && registrationStep === 1) || isLogin ? (
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
                {loading ? 'Loading...' : (isLogin ? 'Sign In' : (formData.role === 'artist' ? 'Lanjutkan' : 'Create Account'))}
              </button>
            </>
          ) : null}

          {!isLogin && registrationStep === 2 && formData.role === 'artist' && (
            <div className={styles.artistBioSection}>
              <button 
                type="button"
                onClick={handleBackToStep1}
                className={styles.backButton}
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
                  placeholder="Contoh: Musisi indie dari Jakarta yang fokus di genre pop rock dan folk. Sudah bermusik sejak 2018..."
                  value={formData.bio}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={5}
                  required
                  minLength={20}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Buat Akun Musisi'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
