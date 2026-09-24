import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('public'); // public, pending, active, expired, rejected, blocked
  const [hasRestrictedAccess, setHasRestrictedAccess] = useState(false);
  const [accessRequest, setAccessRequest] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  // Fetch settings (WhatsApp, phone, company info)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.getSettings();
      if (res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.warn('Failed to load store settings:', err.message);
    }
  }, []);

  const updateSettingsState = useCallback((newSettings) => {
    if (!newSettings) return;
    setSettings((prev) => ({ ...(prev || {}), ...newSettings }));
  }, []);

  // Check and restore customer access via httpOnly cookie (sent automatically)
  const checkAccess = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getCustomerSession();
      if (res.success && res.authenticated) {
        setCustomer(res.customer);
        setCustomerName(res.customer?.name || '');
        setCustomerMobile(res.customer?.mobile || '');
        setStatus(res.status || 'public');
        setHasRestrictedAccess(!!res.hasRestrictedAccess);
        if (res.request) {
          setAccessRequest(res.request);
          setDaysRemaining(res.request.daysRemaining || 0);
          setHoursRemaining(res.request.hoursRemaining || 0);
        }
      } else {
        setStatus('public');
        setHasRestrictedAccess(false);
      }
    } catch (err) {
      console.warn('Session check failed:', err.message);
      setStatus('public');
      setHasRestrictedAccess(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    checkAccess();

    const handleFocus = () => {
      fetchSettings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchSettings, checkAccess]);

  // Request Access handler
  const requestAccess = async ({ name, mobile }) => {
    try {
      const res = await api.requestAccess({ name, mobile });
      if (res.success) {
        // Token is now set as httpOnly cookie by the server — no localStorage needed
        setCustomerMobile(res.customer?.mobile || mobile);
        setCustomerName(res.customer?.name || name);

        setStatus(res.status);
        if (res.status === 'active') {
          setHasRestrictedAccess(true);
          setDaysRemaining(res.daysRemaining || 7);
        } else {
          setHasRestrictedAccess(false);
        }

        setCustomer({ name, mobile, id: res.customer?.id });
        return { success: true, message: res.message, status: res.status };
      }
      return { success: false, message: res.message || 'Request failed.' };
    } catch (error) {
      return { success: false, message: error.message || 'Something went wrong.' };
    }
  };

  const clearSession = async () => {
    // Call server to clear the httpOnly cookie
    try {
      await api.customerLogout();
    } catch (err) {
      console.warn('Logout request failed:', err.message);
    }
    setCustomer(null);
    setCustomerMobile('');
    setCustomerName('');
    setStatus('public');
    setHasRestrictedAccess(false);
    setAccessRequest(null);
  };

  const openAccessModal = () => setIsAccessModalOpen(true);
  const closeAccessModal = () => setIsAccessModalOpen(false);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        customerName,
        customerMobile,
        status,
        hasRestrictedAccess,
        accessRequest,
        daysRemaining,
        hoursRemaining,
        isLoading,
        isAccessModalOpen,
        settings,
        fetchSettings,
        updateSettingsState,
        openAccessModal,
        closeAccessModal,
        requestAccess,
        checkAccess,
        clearSession,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

