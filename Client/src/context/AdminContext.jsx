import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('jt_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jt_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminAuth = useCallback(async () => {
    const token = localStorage.getItem('jt_admin_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getAdminProfile();
      if (res.success) {
        setAdminUser(res.admin);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Admin token verification failed:', err.message);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const login = async (email, password) => {
    try {
      const res = await api.adminLogin({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('jt_admin_token', res.token);
        localStorage.setItem('jt_admin_user', JSON.stringify(res.admin));
        setAdminToken(res.token);
        setAdminUser(res.admin);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (error) {
      return { success: false, message: error.message || 'Authentication error.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('jt_admin_token');
    localStorage.removeItem('jt_admin_user');
    setAdminToken('');
    setAdminUser(null);
  };

  return (
    <AdminContext.Provider
      value={{
        adminToken,
        adminUser,
        isAuthenticated: !!adminToken,
        isLoading,
        login,
        logout,
        checkAdminAuth,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
