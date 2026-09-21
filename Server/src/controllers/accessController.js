import crypto from 'crypto';
import { Customer } from '../models/Customer.js';
import { AccessRequest } from '../models/AccessRequest.js';
import { Setting } from '../models/Setting.js';

// Submit Access Request (Name + Mobile)
export const submitAccessRequest = async (req, res, next) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name.',
      });
    }

    if (!mobile || !mobile.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your mobile number.',
      });
    }

    const cleanMobile = mobile.replace(/[^0-9+]/g, '').trim();
    if (cleanMobile.length < 8 || cleanMobile.length > 15) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid mobile number (e.g. 9876543210).',
      });
    }

    // Check if customer already exists
    let customer = await Customer.findOne({ mobile: cleanMobile });

    if (customer && customer.status === 'blocked') {
      return res.status(403).json({
        success: false,
        status: 'blocked',
        message: 'Your account has been blocked. Please contact Janki Traders administration.',
      });
    }

    // If customer doesn't exist, create customer
    if (!customer) {
      const generatedToken = crypto.randomBytes(24).toString('hex');
      customer = new Customer({
        name: name.trim(),
        mobile: cleanMobile,
        status: 'pending',
        access_token: generatedToken,
      });
      await customer.save();
    } else {
      // Update name if changed and ensure token exists
      customer.name = name.trim();
      if (!customer.access_token) {
        customer.access_token = crypto.randomBytes(24).toString('hex');
      }
    }

    // Check if customer already has an active access request
    const now = new Date();
    const existingActiveRequest = await AccessRequest.findOne({
      customer_id: customer._id,
      status: 'approved',
      expires_at: { $gt: now },
    });

    if (existingActiveRequest) {
      customer.status = 'active';
      await customer.save();

      const diffMs = new Date(existingActiveRequest.expires_at) - now;
      const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      return res.json({
        success: true,
        status: 'active',
        alreadyActive: true,
        customerToken: customer.access_token,
        customer: { id: customer._id, name: customer.name, mobile: customer.mobile },
        expires_at: existingActiveRequest.expires_at,
        daysRemaining,
        hoursRemaining,
        message: `Your access is already active with ${daysRemaining} days and ${hoursRemaining} hours remaining.`,
      });
    }

    // Check if there is already a pending request
    let pendingRequest = await AccessRequest.findOne({
      customer_id: customer._id,
      status: 'pending',
    });

    if (pendingRequest) {
      return res.json({
        success: true,
        status: 'pending',
        customerToken: customer.access_token,
        customer: { id: customer._id, name: customer.name, mobile: customer.mobile },
        message: 'Your access request is currently pending admin review.',
      });
    }

    // Get default duration from settings
    const settings = await Setting.findOne();
    const durationDays = settings?.default_access_duration_days || 7;

    // Create new pending access request
    const newRequest = new AccessRequest({
      customer_id: customer._id,
      status: 'pending',
      requested_at: new Date(),
      duration_days: durationDays,
    });
    await newRequest.save();

    customer.status = 'pending';
    await customer.save();

    res.status(201).json({
      success: true,
      status: 'pending',
      customerToken: customer.access_token,
      customer: {
        id: customer._id,
        name: customer.name,
        mobile: customer.mobile,
      },
      message: 'Access request submitted successfully. Admin will review your request shortly.',
    });
  } catch (error) {
    next(error);
  }
};

// Check Access Status
export const getAccessStatus = async (req, res, next) => {
  try {
    const { token, mobile } = req.query;

    if (!token && !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either a session token or mobile number.',
      });
    }

    const query = token ? { access_token: token } : { mobile: mobile.trim() };
    const customer = await Customer.findOne(query);

    if (!customer) {
      return res.json({
        success: true,
        status: 'none',
        hasAccess: false,
        message: 'No record found. Please submit an access request.',
      });
    }

    if (customer.status === 'blocked') {
      return res.json({
        success: true,
        status: 'blocked',
        hasAccess: false,
        customer: { name: customer.name, mobile: customer.mobile },
        message: 'Your account is blocked. Please contact store management.',
      });
    }

    const latestRequest = await AccessRequest.findOne({ customer_id: customer._id })
      .sort({ requested_at: -1 });

    if (!latestRequest) {
      return res.json({
        success: true,
        status: 'none',
        hasAccess: false,
        customer: { name: customer.name, mobile: customer.mobile },
      });
    }

    const now = new Date();
    if (latestRequest.status === 'approved') {
      if (latestRequest.expires_at && now < new Date(latestRequest.expires_at)) {
        const diffMs = new Date(latestRequest.expires_at) - now;
        const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return res.json({
          success: true,
          status: 'active',
          hasAccess: true,
          customer: { name: customer.name, mobile: customer.mobile },
          request: {
            id: latestRequest._id,
            requested_at: latestRequest.requested_at,
            approved_at: latestRequest.approved_at,
            expires_at: latestRequest.expires_at,
            daysRemaining,
            hoursRemaining,
          },
        });
      } else {
        // Automatically mark expired
        latestRequest.status = 'expired';
        await latestRequest.save();
        customer.status = 'expired';
        await customer.save();

        return res.json({
          success: true,
          status: 'expired',
          hasAccess: false,
          customer: { name: customer.name, mobile: customer.mobile },
          request: {
            id: latestRequest._id,
            requested_at: latestRequest.requested_at,
            expires_at: latestRequest.expires_at,
          },
          message: 'Your 7-day access period has expired. You can submit a new request.',
        });
      }
    }

    res.json({
      success: true,
      status: latestRequest.status,
      hasAccess: false,
      customer: { name: customer.name, mobile: customer.mobile },
      request: {
        id: latestRequest._id,
        requested_at: latestRequest.requested_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
