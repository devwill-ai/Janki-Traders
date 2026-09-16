import express from 'express';
import {
  createEnquiry,
  getMyEnquiries,
} from '../controllers/enquiryController.js';
import { enquiryLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', enquiryLimiter, createEnquiry);
router.get('/my', getMyEnquiries);

export default router;
