import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
  };

  const register = async (email, password) => {
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
