import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CustomerContext = createContext(null);

export const CustomerProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('jt_customer_token') || '');
  const [customerMobile, setCustomerMobile] = useState(localStorage.getItem('jt_customer_mobile') || '');
  const [customerName, setCustomerName] = useState(localStorage.getItem('jt_customer_name') || '');
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

  // Check and restore customer access
  const checkAccess = useCallback(async () => {
    const token = localStorage.getItem('jt_customer_token');
    const mobile = localStorage.getItem('jt_customer_mobile');

    if (!token && !mobile) {
      setStatus('public');
      setHasRestrictedAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.getCustomerSession();
      if (res.success && res.authenticated) {
        setCustomer(res.customer);
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
  }, [fetchSettings, checkAccess]);

  // Request Access handler
  const requestAccess = async ({ name, mobile }) => {
    try {
      const res = await api.requestAccess({ name, mobile });
      if (res.success) {
        if (res.customerToken) {
          localStorage.setItem('jt_customer_token', res.customerToken);
          setCustomerToken(res.customerToken);
        }
        localStorage.setItem('jt_customer_mobile', mobile);
        localStorage.setItem('jt_customer_name', name);
        setCustomerMobile(mobile);
        setCustomerName(name);

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

  const clearSession = () => {
    localStorage.removeItem('jt_customer_token');
    localStorage.removeItem('jt_customer_mobile');
    localStorage.removeItem('jt_customer_name');
    setCustomer(null);
    setCustomerToken('');
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
        customerToken,
        status,
        hasRestrictedAccess,
        accessRequest,
        daysRemaining,
        hoursRemaining,
        isLoading,
        isAccessModalOpen,
        settings,
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
