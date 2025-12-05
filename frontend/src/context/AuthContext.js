import {createContext, useState, useContext, useEffect} from 'react';
import api from '../api/AxiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // init: check user info from the database
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // login
  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/api/auth/login', { usernameOrEmail, password });
      const {token, username: name, userId} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId }));

      setUser({ username: name, userId });
      setIsAuthenticated(true);

      return { success: true };
    }
    catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'login failed!'
      };
    }
  };

  // register
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/api/auth/register', { username, email, password });
      const { token, username: name, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId }));

      setUser({ username: name, userId });
      setIsAuthenticated(true);

      return { success: true };
    }
    catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'register failed!'
      };
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{user, isAuthenticated, loading, login, register, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);