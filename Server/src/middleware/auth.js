import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Customer } from '../models/Customer.js';
import { AccessRequest } from '../models/AccessRequest.js';

// Verify Admin JWT
export const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No admin token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. Admin not found.',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

/**
 * Resolve Customer Access Middleware (Section 18 Enforcement)
 * Examines customer session, checks active 7-day approval, automatically expires outdated access,
 * and sets req.hasRestrictedAccess = true | false.
 */
export const resolveCustomerAccess = async (req, res, next) => {
  try {
    // Check if request is made by an authenticated admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin' || decoded.role === 'superadmin') {
          req.hasRestrictedAccess = true;
          req.isAdmin = true;
          return next();
        }
      } catch (err) {
        // Not a valid admin token, proceed to check customer token
      }
    }

    // Extract customer identification strictly from token
    const customerToken = req.headers['x-customer-token'] || (authHeader?.startsWith('Customer ') ? authHeader.split(' ')[1] : null);

    if (!customerToken) {
      req.hasRestrictedAccess = false;
      req.customer = null;
      req.customerStatus = 'public';
      return next();
    }

    // Strictly find customer by access token
    const customer = await Customer.findOne({ access_token: customerToken });

    if (!customer) {
      req.hasRestrictedAccess = false;
      req.customer = null;
      req.customerStatus = 'public';
      return next();
    }

    if (customer.status === 'blocked') {
      req.hasRestrictedAccess = false;
      req.customer = customer;
      req.customerStatus = 'blocked';
      return next();
    }

    // Find latest access request
    const latestRequest = await AccessRequest.findOne({ customer_id: customer._id })
      .sort({ requested_at: -1 });

    if (!latestRequest) {
      req.hasRestrictedAccess = false;
      req.customer = customer;
      req.customerStatus = customer.status;
      return next();
    }

    // Check if approved and within validity period
    const now = new Date();
    if (latestRequest.status === 'approved') {
      if (latestRequest.expires_at && now < new Date(latestRequest.expires_at)) {
        // Active valid access
        req.hasRestrictedAccess = true;
        req.customer = customer;
        req.customerStatus = 'active';
        req.accessRequest = latestRequest;
        return next();
      } else {
        // Automatically treat as expired per Section 18
        latestRequest.status = 'expired';
        await latestRequest.save();

        customer.status = 'expired';
        await customer.save();

        req.hasRestrictedAccess = false;
        req.customer = customer;
        req.customerStatus = 'expired';
        req.accessRequest = latestRequest;
        return next();
      }
    }

    // Request is pending, rejected, revoked, etc.
    req.hasRestrictedAccess = false;
    req.customer = customer;
    req.customerStatus = latestRequest.status;
    req.accessRequest = latestRequest;
    next();
  } catch (error) {
    console.error('[Access Resolution Error]:', error);
    req.hasRestrictedAccess = false;
    req.customer = null;
    req.customerStatus = 'public';
    next();
  }
};
