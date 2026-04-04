import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { resetSocket } from '../services/socket';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        if (parsed?.token && parsed.token !== 'undefined') {
          setUser(parsed);
        } else {
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      } catch {
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const persistUser = (data) => {
    const merged = {
      ...data,
      isPremiumStatus: data.isPremiumStatus,
      tokens: data.tokens,
      streakDays: data.streakDays,
      displayName: data.displayName,
      tagline: data.tagline,
    };
    localStorage.setItem('userInfo', JSON.stringify(merged));
    setUser(merged);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    resetSocket();
    persistUser(data);
  };

  const register = async (email, password) => {
    const { data } = await api.post('/auth/register', { email, password });
    resetSocket();
    persistUser(data);
  };

  const logout = () => {
    resetSocket();
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const { data } = await api.get('/users/me');
      const prev = JSON.parse(localStorage.getItem('userInfo') || '{}');
      persistUser({ ...prev, ...data, token: prev.token });
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
