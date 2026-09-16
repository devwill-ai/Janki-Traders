import express from 'express';
import {
  adminLogin,
  getAdminProfile,
  changeAdminPassword,
  getCustomerSession,
} from '../controllers/authController.js';
import { verifyAdmin } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin Authentication
router.post('/admin-login', authLimiter, adminLogin);
router.get('/admin-profile', verifyAdmin, getAdminProfile);
router.put('/change-password', verifyAdmin, changeAdminPassword);

// Customer Session Check
router.get('/customer-session', getCustomerSession);

export default router;
