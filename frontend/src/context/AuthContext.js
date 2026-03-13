import {createContext, useState, useContext, useEffect} from 'react';
import api from '../api/AxiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // watchlist imdbId list
  const [watchlistIds, setWatchlistIds] = useState([]);

  // init
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // load watchlist after login/logout
  useEffect(() => {
    const loadWatchlist = async () => {
      if (!isAuthenticated) {
        setWatchlistIds([]);
        return;
      }
      try {
        const res = await api.get('/api/watchlist');
        const ids = (res.data || []).map(m => m.imdbId).filter(Boolean);
        setWatchlistIds(ids);
      } catch (e) {
        setWatchlistIds([]);
      }
    };

    loadWatchlist();
  }, [isAuthenticated]);

  const refreshWatchlist = async () => {
    if (!isAuthenticated) return [];
    const res = await api.get('/api/watchlist');
    const ids = (res.data || []).map(m => m.imdbId).filter(Boolean);
    setWatchlistIds(ids);
    return ids;
  };

  const toggleWatchlist = async (imdbId) => {
    if (!isAuthenticated) {
      return { success: false, requiresLogin: true };
    }

    const inList = watchlistIds.includes(imdbId);

    try {
      if (inList) {
        await api.delete(`/api/watchlist/${imdbId}`);
        setWatchlistIds(prev => prev.filter(id => id !== imdbId));
        return { success: true, inWatchlist: false };
      } else {
        await api.post(`/api/watchlist/${imdbId}`);
        setWatchlistIds(prev => (prev.includes(imdbId) ? prev : [...prev, imdbId]));
        return { success: true, inWatchlist: true };
      }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'watchlist update failed' };
    }
  };

  // login
  const login = async (usernameOrEmail, password) => {
    try {
      const response = await api.post('/api/auth/login', { usernameOrEmail, password });
      const {token, username: name, userId, role} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId, role }));

      setUser({ username: name, userId, role });
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
      const { token, username: name, userId, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId, role }));

      setUser({ username: name, userId, role });
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

  // delete own account
  const deleteAccount = async () => {
    try {
      await api.delete('/api/auth/account');

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      setWatchlistIds([]);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'delete account failed!'
      };
    }
  };

  // logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setWatchlistIds([]);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      deleteAccount,
      logout,
      watchlistIds,
      refreshWatchlist,
      toggleWatchlist
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);