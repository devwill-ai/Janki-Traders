import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
} from '../controllers/productController.js';
import { resolveCustomerAccess } from '../middleware/auth.js';

const router = express.Router();

// Products with strict server-side access rule enforcement
router.get('/products', resolveCustomerAccess, getProducts);
router.get('/products/:id', resolveCustomerAccess, getProductById);

// Categories
router.get('/categories', resolveCustomerAccess, getCategories);

export default router;
