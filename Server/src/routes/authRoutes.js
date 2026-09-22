import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  changeAdminPassword,
  adminLogout,
  getCustomerSession,
  customerLogout,
} from '../controllers/authController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Authentication
router.post('/admin-login', authLimiter, adminLogin);
router.get('/admin-profile', verifyAdmin, getAdminProfile);
router.put('/change-password', verifyAdmin, changeAdminPassword);
router.post('/admin-logout', adminLogout);

// Customer Session Check
router.get('/customer-session', getCustomerSession);
router.post('/customer-logout', customerLogout);


export default router;
