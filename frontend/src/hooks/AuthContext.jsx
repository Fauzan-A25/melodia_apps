import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State user dan status login
  const [user, setUser] = useState(null); // Misal: { username: "user1" }
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Callback login
  const login = (username, password) => {
    // Integrasi ke API/Backend di sini
    // Simulasi sukses login (ganti dengan fetch/axios sesuai kebutuhan)
    if (username && password) {
      setUser({ username });
      setIsAuthenticated(true);
    }
  };

  // Callback logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
