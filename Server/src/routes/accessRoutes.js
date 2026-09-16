import express from 'express';
import {
  submitAccessRequest,
  getAccessStatus,
} from '../controllers/accessController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/request', authLimiter, submitAccessRequest);
router.get('/status', getAccessStatus);

export default router;
