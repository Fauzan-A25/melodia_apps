// src/App.jsx - NO LAZY USER PAGES
import { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { MusicProvider } from './context/MusicContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import SessionTimeoutWarning from './components/Auth/SessionTimeoutWarning';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './components/LoadingBar/LoadingBar.module.css';

// ✅ NO LAZY - Direct import untuk instant page transitions
import AuthPage from './pages/auth/AuthPage';
import Home from './pages/user/Home';
import PlaylistDetail from './pages/user/PlaylistDetail';
import Search from './pages/user/Search';
import Settings from './pages/Settings/Settings';

// ✅ Admin Pages tetap lazy (jarang diakses)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const GenreManagement = lazy(() => import('./pages/admin/GenreManagement'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const AdminSong = lazy(() => import('./pages/admin/AdminSong'));
const AdminUpload = lazy(() => import('./pages/admin/AdminUpload'));
const ArtistManagement = lazy(() => import('./pages/admin/ArtistManagement'));
const AlbumManagement = lazy(() => import('./pages/admin/AlbumManagement'));

// ✅ Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  speed: 200,
  trickleSpeed: 100,
});

// ✅ Route Progress Tracker
const RouteProgressTracker = () => {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;

    if (currentPath !== prevPath) {
      NProgress.start();
      
      const timer = setTimeout(() => {
        NProgress.done();
      }, 200);

      prevLocationRef.current = currentPath;

      return () => {
        clearTimeout(timer);
        NProgress.done();
      };
    }
  }, [location.pathname]);

  return null;
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
      <>
        <RouteProgressTracker />
        <Routes location={location} key={location.pathname}>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <AdminDashboard />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/genres"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <GenreManagement />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <UserManagement />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/artists"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <ArtistManagement />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/albums"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <AlbumManagement />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/songs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <AdminSong />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/upload"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
                    <AdminUpload />
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </>
    );
  }

  // ✅ USER ROUTES - NO LAZY, INSTANT TRANSITIONS
  return (
    <>
      <RouteProgressTracker />
      <Routes location={location} key={location.pathname}>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlist/:playlistId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PlaylistDetail />
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
          path="/search"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Search />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  const location = useLocation();

  return (
    <AuthProvider>
      <UserProvider>
        <MusicProvider>
          <SessionTimeoutWarning />

          <Routes location={location} key={location.pathname}>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<RoleBasedRoutes />} />
          </Routes>
        </MusicProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
