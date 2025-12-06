import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('melodia_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('melodia_user');
      return null;
    }
  });

  const [loading, _] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('melodia_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('melodia_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('melodia_user', JSON.stringify(userData));
  };

  const isAuthenticated = () => user !== null;

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        loading,
      }}
    >
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
