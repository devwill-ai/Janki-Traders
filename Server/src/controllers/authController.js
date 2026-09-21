import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { Customer } from '../models/Customer.js';
import { AccessRequest } from '../models/AccessRequest.js';
import { clearCustomerTokenCookie } from '../utils/cookieUtils.js';

// Generate Admin JWT (24-hour expiration for security)
const generateToken = (admin) => {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Admin Login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin authentication successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Profile
export const getAdminProfile = async (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};

// Change Password
export const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Restore Customer Session & Access Status
export const getCustomerSession = async (req, res, next) => {
  try {
    const customerToken = req.cookies?.jt_customer_token || req.headers['x-customer-token'] || req.query.token;

    if (!customerToken) {
      return res.json({
        success: true,
        authenticated: false,
        status: 'public',
        hasRestrictedAccess: false,
      });
    }

    const customer = await Customer.findOne({ access_token: customerToken });

    if (!customer) {
      return res.json({
        success: true,
        authenticated: false,
        status: 'public',
        hasRestrictedAccess: false,
      });
    }

    if (customer.status === 'blocked') {
      return res.json({
        success: true,
        authenticated: true,
        customer: { id: customer._id, name: customer.name, mobile: customer.mobile },
        status: 'blocked',
        hasRestrictedAccess: false,
        message: 'Your access has been blocked. Please contact support.',
      });
    }

    // Find latest access request
    const latestRequest = await AccessRequest.findOne({ customer_id: customer._id })
      .sort({ requested_at: -1 });

    if (!latestRequest) {
      return res.json({
        success: true,
        authenticated: true,
        customer: { id: customer._id, name: customer.name, mobile: customer.mobile },
        status: customer.status,
        hasRestrictedAccess: false,
      });
    }

    const now = new Date();
    let hasAccess = false;
    let status = latestRequest.status;
    let daysRemaining = 0;
    let hoursRemaining = 0;

    if (latestRequest.status === 'approved') {
      if (latestRequest.expires_at && now < new Date(latestRequest.expires_at)) {
        hasAccess = true;
        status = 'active';
        const diffMs = new Date(latestRequest.expires_at) - now;
        daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      } else {
        // Mark expired
        status = 'expired';
        latestRequest.status = 'expired';
        await latestRequest.save();
        customer.status = 'expired';
        await customer.save();
      }
    }

    res.json({
      success: true,
      authenticated: true,
      customer: {
        id: customer._id,
        name: customer.name,
        mobile: customer.mobile,
      },
      status,
      hasRestrictedAccess: hasAccess,
      request: {
        id: latestRequest._id,
        requested_at: latestRequest.requested_at,
        approved_at: latestRequest.approved_at,
        expires_at: latestRequest.expires_at,
        daysRemaining,
        hoursRemaining,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Customer Logout — clear the httpOnly cookie
export const customerLogout = async (req, res) => {
  clearCustomerTokenCookie(res);
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
