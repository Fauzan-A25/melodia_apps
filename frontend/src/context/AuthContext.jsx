import { createContext, useContext, useMemo } from 'react';
import useAuth from '../hooks/useAuth';

const AuthContext = createContext(null);

/**
 * AuthProvider - Provides authentication state and methods to the app
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    updateProfile: auth.updateProfile,
    hasRole: auth.hasRole,
    clearError: auth.clearError,
  }), [
    auth.user,
    auth.isAuthenticated,
    auth.isLoading,
    auth.error,
    auth.login,
    auth.register,
    auth.logout,
    auth.updateProfile,
    auth.hasRole,
    auth.clearError,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};
export default AuthContext;
