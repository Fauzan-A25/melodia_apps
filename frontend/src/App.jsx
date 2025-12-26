import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { UserProvider, useUser } from './context/UserContext';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import SessionTimeoutWarning from './components/Auth/SessionTimeoutWarning';
import AuthPage from './pages/auth/AuthPage';
import Home from './pages/user/Home';
import PlaylistDetail from './pages/user/PlaylistDetail';
import History from './pages/Settings/History';
import Search from './pages/user/Search';
import Settings from './pages/Settings/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import GenreManagement from './pages/admin/GenreManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminSong from './pages/admin/AdminSong';
import AdminUpload from './pages/admin/AdminUpload';
import ArtistManagement from './pages/admin/ArtistManagement';
import AlbumManagement from './pages/admin/AlbumManagement';

// ✨ ENHANCED Page Transition - LEBIH TERLIHAT!
const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.96 }}
      transition={{
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9]
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
};

// Role-based Route Wrapper
const RoleBasedRoutes = () => {
  const { user } = useUser();
  const location = useLocation();

  const storedRole =
    localStorage.getItem('role') || localStorage.getItem('accountType');
  const effectiveAccountType = user?.accountType || storedRole;

  // Jika ADMIN
  if (effectiveAccountType === 'ADMIN') {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <AdminDashboard />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/genres"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <GenreManagement />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <UserManagement />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/artists"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <ArtistManagement />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/albums"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <AlbumManagement />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/songs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <AdminSong />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/upload"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <AdminUpload />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PageTransition>
                    <Settings />
                  </PageTransition>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  // Jika USER
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Home />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlist/:playlistId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <PlaylistDetail />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlist"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Navigate to="/home" replace />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <History />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Search />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PageTransition>
                  <Settings />
                </PageTransition>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <UserProvider>
        <MusicProvider>
          <SessionTimeoutWarning />

          {/* ✅ PERBAIKAN: AuthPage TIDAK dibungkus AnimatePresence */}
          {/* Ini memastikan terminal loading animation tidak di-interrupt */}
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/auth" 
              element={<AuthPage />} 
            />
            <Route path="*" element={<RoleBasedRoutes />} />
          </Routes>
        </MusicProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
