// src/context/UserContext.jsx
import { createContext, useContext, useMemo } from 'react';
import { useAuthContext } from './AuthContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const auth = useAuthContext();

  const value = useMemo(() => ({
    // State dari AuthContext
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.isLoading,
    error: auth.error,

    // Methods - alias langsung ke AuthContext
    login: auth.login,              // login(email, password)
    logout: auth.logout,
    register: auth.register,
    updateUser: auth.updateProfile, // alias untuk updateUser
    hasRole: auth.hasRole,
    clearError: auth.clearError,
  }), [
    auth.user,
    auth.isAuthenticated,
    auth.isLoading,
    auth.error,
    auth.login,
    auth.logout,
    auth.register,
    auth.updateProfile,
    auth.hasRole,
    auth.clearError,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export default UserContext;
