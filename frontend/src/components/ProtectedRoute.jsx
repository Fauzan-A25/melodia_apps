// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute - Wrapper component untuk route yang memerlukan authentication
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @returns {JSX.Element} Protected content or redirect to login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not authenticated - redirect to login with intended location
  if (!isAuthenticated || !user) {
    console.log('🚫 Access denied - redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Authenticated - render protected content
  return children;
};

export default ProtectedRoute;
