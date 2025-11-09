import React, { createContext, useState, useContext } from 'react';

/**
 * AuthContext holds the authenticated user and exposes login/logout helpers.
 * Roles supported: 'user', 'moderator', 'admin'.
 */
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    // Call the API to authenticate and obtain a JWT/token
    // This is a stub implementation; in a real app the API would verify
    // the credentials and return a user object with a role and token.
    if (!username || !password) throw new Error('Username and password required');
    // For demonstration, assign roles based on username prefix
    let role = 'user';
    if (username.startsWith('mod')) role = 'moderator';
    if (username.startsWith('admin')) role = 'admin';
    const token = 'dummy-token';
    const userObj = { username, role, token };
    setUser(userObj);
    return userObj;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);