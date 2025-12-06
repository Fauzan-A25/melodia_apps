// App.jsx - FIXED
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { MusicProvider } from './context/MusicContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import PlaylistDetail from './pages/PlaylistDetail';
import Library from './pages/Library';
import History from './pages/History';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Settings from './pages/Settings/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import GenreManagement from './pages/admin/GenreManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminSong from './pages/admin/AdminSong';

// Artist Pages
import ArtistSong from './pages/Settings/ArtistSong';

// Role-based Route Wrapper
const RoleBasedRoutes = () => {
  const { user } = useUser();

  // Jika user adalah ADMIN
  if (user?.accountType === 'ADMIN') {
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
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  // Jika USER atau ARTIST
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
        path="/library"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Library />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* ✅ HAPUS Route /playlist - Sudah digabung ke PlaylistDetail */}

      {/* Route untuk Playlist Detail - HANDLE SEMUA playlist */}
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

      {/* ✅ Route untuk /playlist → redirect ke first playlist atau home */}
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
        path="/upload"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Upload />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings/my-songs"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ArtistSong />
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
    <UserProvider>
      <MusicProvider>
        <Routes>
          {/* Public Route - Auth (tanpa layout) */}
          <Route path="/auth" element={<AuthPage />} />

          {/* All other routes handled by RoleBasedRoutes */}
          <Route path="*" element={<RoleBasedRoutes />} />
        </Routes>
      </MusicProvider>
    </UserProvider>
  );
};

export default App;
