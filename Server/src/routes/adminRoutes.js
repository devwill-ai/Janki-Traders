import express from 'express';
import {
  getDashboardStats,
  getAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  getCustomers,
  extendCustomerAccess,
  revokeCustomerAccess,
  toggleBlockCustomer,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminEnquiries,
  updateEnquiryStatus,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { upload, optimizeImages } from '../middleware/upload.js';

const router = express.Router();

// Apply verifyAdmin middleware to all admin endpoints
router.use(verifyAdmin);

// 1. Dashboard
router.get('/dashboard', getDashboardStats);

// 2. Access Requests
router.get('/access-requests', getAccessRequests);
router.put('/access-requests/:id/approve', approveAccessRequest);
router.put('/access-requests/:id/reject', rejectAccessRequest);

// 3. Customers
router.get('/customers', getCustomers);
router.put('/customers/:id/extend', extendCustomerAccess);
router.put('/customers/:id/revoke', revokeCustomerAccess);
router.put('/customers/:id/block', toggleBlockCustomer);

// 4. Products CRUD
router.get('/products', getAdminProducts);
router.post('/products', upload.array('images', 6), optimizeImages, createProduct);
router.put('/products/:id', upload.array('images', 6), optimizeImages, updateProduct);
router.delete('/products/:id', deleteProduct);

// 5. Categories CRUD
router.get('/categories', getAdminCategories);
router.post('/categories', upload.single('image'), optimizeImages, createCategory);
router.put('/categories/:id', upload.single('image'), optimizeImages, updateCategory);
router.delete('/categories/:id', deleteCategory);

// 6. Enquiries Management
router.get('/enquiries', getAdminEnquiries);
router.put('/enquiries/:id/status', updateEnquiryStatus);

// 7. Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
