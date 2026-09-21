const API_BASE = import.meta.env.VITE_API_URL;
const SERVER_HOST = API_BASE.replace(/\/api$/, '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `${SERVER_HOST}${imagePath}`;
  return imagePath;
};

/**
 * Universal Fetch wrapper with auto-injected headers.
 * Customer token is now sent automatically via httpOnly cookie
 * (credentials: 'include' ensures cookies are sent cross-origin).
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = options.headers || {};

  // Attach admin token if present
  const adminToken = localStorage.getItem('jt_admin_token');
  if (adminToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  // Default content type to JSON unless FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies with every request
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// Public / Customer API
export const api = {
  // Settings & Health
  getSettings: () => apiRequest('/settings'),
  getHealth: () => apiRequest('/health'),

  // Products & Categories
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  getProductById: (id) => apiRequest(`/products/${id}`),
  getCategories: () => apiRequest('/categories'),

  // Access Workflow
  requestAccess: (data) => apiRequest('/access/request', { method: 'POST', body: JSON.stringify(data) }),
  getAccessStatus: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/access/status${query ? `?${query}` : ''}`);
  },
  getCustomerSession: () => apiRequest('/auth/customer-session'),
  customerLogout: () => apiRequest('/auth/customer-logout', { method: 'POST' }),

  // Enquiries
  submitEnquiry: (data) => apiRequest('/enquiries', { method: 'POST', body: JSON.stringify(data) }),
  getMyEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/enquiries/my${query ? `?${query}` : ''}`);
  },

  // Admin APIs
  adminLogin: (credentials) => apiRequest('/auth/admin-login', { method: 'POST', body: JSON.stringify(credentials) }),
  getAdminProfile: () => apiRequest('/auth/admin-profile'),
  changeAdminPassword: (data) => apiRequest('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),

  getDashboardStats: () => apiRequest('/admin/dashboard'),
  
  // Admin Access Requests
  getAccessRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/access-requests${query ? `?${query}` : ''}`);
  },
  approveAccessRequest: (id, data) => apiRequest(`/admin/access-requests/${id}/approve`, { method: 'PUT', body: JSON.stringify(data) }),
  rejectAccessRequest: (id, data) => apiRequest(`/admin/access-requests/${id}/reject`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/customers${query ? `?${query}` : ''}`);
  },
  extendCustomerAccess: (id, data) => apiRequest(`/admin/customers/${id}/extend`, { method: 'PUT', body: JSON.stringify(data) }),
  revokeCustomerAccess: (id) => apiRequest(`/admin/customers/${id}/revoke`, { method: 'PUT' }),
  toggleBlockCustomer: (id) => apiRequest(`/admin/customers/${id}/block`, { method: 'PUT' }),

  // Admin Products
  getAdminProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/products${query ? `?${query}` : ''}`);
  },
  createProduct: (formData) => apiRequest('/admin/products', { method: 'POST', body: formData }),
  updateProduct: (id, formData) => apiRequest(`/admin/products/${id}`, { method: 'PUT', body: formData }),
  deleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),

  // Admin Categories
  getAdminCategories: () => apiRequest('/admin/categories'),
  createCategory: (formData) => apiRequest('/admin/categories', { method: 'POST', body: formData }),
  updateCategory: (id, formData) => apiRequest(`/admin/categories/${id}`, { method: 'PUT', body: formData }),
  deleteCategory: (id) => apiRequest(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Admin Enquiries
  getAdminEnquiries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/enquiries${query ? `?${query}` : ''}`);
  },
  updateEnquiryStatus: (id, status) => apiRequest(`/admin/enquiries/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Admin Settings
  getAdminSettings: () => apiRequest('/admin/settings'),
  updateAdminSettings: (data) => apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};

