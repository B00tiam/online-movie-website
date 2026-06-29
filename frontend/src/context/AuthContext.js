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

  // refresh the watchlist
  const refreshWatchlist = async () => {
    if (!isAuthenticated) return [];
    const res = await api.get('/api/watchlist');
    const ids = (res.data || []).map(m => m.imdbId).filter(Boolean);
    setWatchlistIds(ids);
    return ids;
  };

  // toggle watchlist (saved - unsaved)
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
      const {token, username: name, userId, role, email} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId, role, email}));

      setUser({ username: name, userId, role, email});
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
      const { token, username: name, userId, role, email} = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username: name, userId, role, email}));

      setUser({ username: name, userId, role, email});
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

  // update birthday and gender
  const updateProfile = async ({ birthday, gender }) => {
    try {
      const res = await api.patch('/api/auth/profile', { birthday, gender });
      const { birthday: newBirthday, gender: newGender } = res.data;

      const updatedUser = { ...user, birthday: newBirthday, gender: newGender };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update profile failed!'
      };
    }
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
      toggleWatchlist,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);