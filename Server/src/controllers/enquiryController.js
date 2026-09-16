import { Enquiry } from '../models/Enquiry.js';
import { Customer } from '../models/Customer.js';
import { Product } from '../models/Product.js';
import { Setting } from '../models/Setting.js';

// Create Product Enquiry
export const createEnquiry = async (req, res, next) => {
  try {
    const { name, mobile, product_id, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your mobile number.' });
    }
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const cleanMobile = mobile.replace(/[^0-9+]/g, '').trim();

    // Verify product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Upsert customer
    let customer = await Customer.findOne({ mobile: cleanMobile });
    if (!customer) {
      customer = new Customer({
        name: name.trim(),
        mobile: cleanMobile,
        status: 'pending',
      });
      await customer.save();
    }

    // Create enquiry
    const enquiry = new Enquiry({
      customer_id: customer._id,
      product_id: product._id,
      customer_name: customer.name,
      customer_mobile: customer.mobile,
      product_name: product.name,
      product_code: product.product_code || '',
      product_image: product.images?.[0] || '',
      message: message || 'I am interested in this product and would like to receive pricing and specifications.',
      status: 'new',
    });

    await enquiry.save();

    // Fetch store whatsapp for prefilled link
    const settings = await Setting.findOne();
    const whatsappNumber = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '919876543210';
    const encodedText = encodeURIComponent(
      `Hello Janki Traders, I have enquired about "${product.name}" (Code: ${product.product_code || 'N/A'}). My name is ${customer.name}.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully.',
      enquiry,
      whatsappUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Inquired Products (Section 6)
export const getMyEnquiries = async (req, res, next) => {
  try {
    const customerToken = req.headers['x-customer-token'] || req.query.token;
    const mobile = req.query.mobile;

    if (!customerToken && !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your customer token or mobile number.',
      });
    }

    const query = customerToken ? { access_token: customerToken } : { mobile: mobile.trim() };
    const customer = await Customer.findOne(query);

    if (!customer) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const enquiries = await Enquiry.find({ customer_id: customer._id })
      .populate('product_id', 'name product_code images category_id visibility')
      .sort({ createdAt: -1 })
      .lean();

    // Format for Section 6 display
    const formatted = enquiries.map((item) => ({
      id: item._id,
      product_id: item.product_id?._id || item.product_id,
      product_name: item.product_name,
      product_code: item.product_code,
      product_image: item.product_image || item.product_id?.images?.[0] || '',
      enquiry_date: item.created_at,
      status: item.status, // new, contacted, converted, closed
      message: item.message,
    }));

    res.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};
