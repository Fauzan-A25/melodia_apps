// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
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
import AlbumManagement from './pages/admin/AlbumManagement'; // ✅ NEW

// Role-based Route Wrapper
const RoleBasedRoutes = () => {
  const { user } = useUser();

  const storedRole =
    localStorage.getItem('role') || localStorage.getItem('accountType');
  const effectiveAccountType = user?.accountType || storedRole;

  // Jika ADMIN
  if (effectiveAccountType === 'ADMIN') {
    return (
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/genres"
          element={
            <ProtectedRoute>
              <MainLayout>
                <GenreManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UserManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/artists"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ArtistManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Album Management Route */}
        <Route
          path="/admin/albums"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AlbumManagement />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/songs"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminSong />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/upload"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminUpload />
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
    );
  }

  // Jika USER
  return (
    <Routes>
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
        path="/history"
        element={
          <ProtectedRoute>
            <MainLayout>
              <History />
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
  );
};

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <MusicProvider>
          <SessionTimeoutWarning />

          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<RoleBasedRoutes />} />
          </Routes>
        </MusicProvider>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
