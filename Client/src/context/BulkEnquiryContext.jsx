import React, { createContext, useContext, useState, useEffect } from 'react';

const BulkEnquiryContext = createContext(null);

const STORAGE_KEY = 'jt_bulk_enquiry_items';

export const BulkEnquiryProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading bulk enquiry items from localStorage:', e);
      return [];
    }
  });

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving bulk enquiry items to localStorage:', e);
    }
  }, [items]);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 2800);
  };

  const isInBulk = (productId) => {
    if (!productId) return false;
    const pIdStr = typeof productId === 'object' ? productId._id?.toString() : productId.toString();
    return items.some((item) => {
      const itId = item.product?._id?.toString() || item.product?.id?.toString();
      return itId === pIdStr;
    });
  };

  const addToBulk = (product, quantity = 1, notes = '') => {
    if (!product || !product._id) return;
    const pIdStr = product._id.toString();

    setItems((prev) => {
      const exists = prev.find((it) => it.product?._id?.toString() === pIdStr);
      if (exists) {
        showNotification(`Updated quantity for "${product.name}" in enquiry list`);
        return prev.map((it) =>
          it.product?._id?.toString() === pIdStr
            ? { ...it, quantity: it.quantity + (quantity > 0 ? quantity : 1) }
            : it
        );
      }
      showNotification(`Added "${product.name}" to bulk enquiry list`);
      return [...prev, { product, quantity: Math.max(1, quantity), notes }];
    });
  };

  const removeFromBulk = (productId) => {
    const pIdStr = typeof productId === 'object' ? productId._id?.toString() : productId.toString();
    setItems((prev) => {
      const itemToRemove = prev.find((it) => it.product?._id?.toString() === pIdStr);
      if (itemToRemove?.product?.name) {
        showNotification(`Removed "${itemToRemove.product.name}" from enquiry list`);
      }
      return prev.filter((it) => it.product?._id?.toString() !== pIdStr);
    });
  };

  const toggleBulk = (product) => {
    if (!product || !product._id) return;
    if (isInBulk(product._id)) {
      removeFromBulk(product._id);
    } else {
      addToBulk(product, 1);
    }
  };

  const updateQuantity = (productId, quantity) => {
    const pIdStr = typeof productId === 'object' ? productId._id?.toString() : productId.toString();
    const cleanQty = Math.max(1, parseInt(quantity, 10) || 1);
    setItems((prev) =>
      prev.map((it) => (it.product?._id?.toString() === pIdStr ? { ...it, quantity: cleanQty } : it))
    );
  };

  const updateNotes = (productId, notes) => {
    const pIdStr = typeof productId === 'object' ? productId._id?.toString() : productId.toString();
    setItems((prev) =>
      prev.map((it) => (it.product?._id?.toString() === pIdStr ? { ...it, notes } : it))
    );
  };

  const clearBulk = () => {
    setItems([]);
  };

  const openBulkModal = () => setIsBulkModalOpen(true);
  const closeBulkModal = () => setIsBulkModalOpen(false);

  const distinctCount = items.length;
  const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <BulkEnquiryContext.Provider
      value={{
        items,
        distinctCount,
        totalQuantity,
        isInBulk,
        addToBulk,
        removeFromBulk,
        toggleBulk,
        updateQuantity,
        updateNotes,
        clearBulk,
        isBulkModalOpen,
        openBulkModal,
        closeBulkModal,
        notification,
      }}
    >
      {children}
    </BulkEnquiryContext.Provider>
  );
};

export const useBulkEnquiry = () => {
  const context = useContext(BulkEnquiryContext);
  if (!context) {
    throw new Error('useBulkEnquiry must be used within a BulkEnquiryProvider');
  }
  return context;
};
