import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.adminLogout();
    } catch (err) {
      console.warn('Admin logout request failed:', err.message);
    }
    // Remove any leftover legacy storage keys
    localStorage.removeItem('jt_admin_token');
    localStorage.removeItem('jt_admin_user');
    setAdminUser(null);
  }, []);

  const checkAdminAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminProfile();
      if (res.success && res.admin) {
        setAdminUser(res.admin);
      } else {
        setAdminUser(null);
      }
    } catch (err) {
      setAdminUser(null);
    } finally {
      setIsLoading(false);
      // Clean up legacy localStorage remnants
      localStorage.removeItem('jt_admin_token');
      localStorage.removeItem('jt_admin_user');
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  const login = async (email, password) => {
    try {
      const res = await api.adminLogin({ email, password });
      if (res.success && res.admin) {
        // Cookie is set as httpOnly by server — clean any legacy localStorage keys
        localStorage.removeItem('jt_admin_token');
        localStorage.removeItem('jt_admin_user');
        setAdminUser(res.admin);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (error) {
      return { success: false, message: error.message || 'Authentication error.' };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
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
