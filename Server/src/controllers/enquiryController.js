import { Enquiry } from '../models/Enquiry.js';
import { Customer } from '../models/Customer.js';
import { Product } from '../models/Product.js';
import { Setting } from '../models/Setting.js';

// Create Product Enquiry (Single or Bulk)
export const createEnquiry = async (req, res, next) => {
  try {
    const { name, mobile, product_id, items, product_ids, message, quantity } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your mobile number.' });
    }

    // Determine items list
    let itemsList = [];
    if (Array.isArray(items) && items.length > 0) {
      itemsList = items.map((it) => ({
        product_id: it.product_id || it._id || it.id,
        quantity: Number(it.quantity) > 0 ? Number(it.quantity) : 1,
        notes: it.notes || '',
      }));
    } else if (Array.isArray(product_ids) && product_ids.length > 0) {
      itemsList = product_ids.map((id) => ({
        product_id: id,
        quantity: 1,
      }));
    } else if (product_id) {
      itemsList = [
        {
          product_id,
          quantity: Number(quantity) > 0 ? Number(quantity) : 1,
        },
      ];
    }

    if (itemsList.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product is required for enquiry.' });
    }

    const cleanMobile = mobile.replace(/[^0-9+]/g, '').trim();

    // Fetch and verify all products
    const pIds = itemsList.map((i) => i.product_id).filter(Boolean);
    const products = await Product.find({ _id: { $in: pIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const validItems = [];
    for (const item of itemsList) {
      const prod = productMap.get(item.product_id?.toString());
      if (prod) {
        validItems.push({
          product: prod,
          quantity: item.quantity || 1,
          notes: item.notes || '',
        });
      }
    }

    if (validItems.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid products found for enquiry.' });
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

    const isBulk = validItems.length > 1 || Boolean(items && items.length > 1);
    const bulkId = isBulk ? `BULK-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` : null;

    // Create enquiry records
    const enquiriesToInsert = validItems.map((item) => ({
      customer_id: customer._id,
      product_id: item.product._id,
      customer_name: customer.name,
      customer_mobile: customer.mobile,
      product_name: item.product.name,
      product_code: item.product.product_code || '',
      product_image: item.product.images?.[0] || '',
      quantity: item.quantity,
      bulk_id: bulkId,
      message:
        message?.trim() ||
        (isBulk
          ? `Bulk enquiry for ${validItems.length} products.`
          : 'I am interested in this product and would like to receive pricing and availability details.'),
      status: 'new',
    }));

    const createdEnquiries = await Enquiry.insertMany(enquiriesToInsert);

    // Fetch store whatsapp for prefilled link
    const settings = await Setting.findOne();
    const whatsappNumber = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '919876543210';

    let whatsappText = '';
    if (isBulk) {
      const productLines = validItems
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.product.name} (Code: ${item.product.product_code || 'N/A'}) - Qty: ${item.quantity}`
        )
        .join('\n');
      whatsappText = `Hello Janki Traders, I would like to enquire about the following products:\n\n${productLines}\n\nName: ${customer.name}\nMobile: ${customer.mobile}${message?.trim() ? `\nNotes: ${message.trim()}` : ''}`;
    } else {
      const single = validItems[0];
      whatsappText = `Hello Janki Traders, I have enquired about "${single.product.name}" (Code: ${single.product.product_code || 'N/A'}${single.quantity > 1 ? `, Qty: ${single.quantity}` : ''}).\nName: ${customer.name}\nMobile: ${customer.mobile}${message?.trim() ? `\nNotes: ${message.trim()}` : ''}`;
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

    res.status(201).json({
      success: true,
      message: isBulk
        ? `Bulk enquiry for ${validItems.length} products submitted successfully.`
        : 'Enquiry submitted successfully.',
      enquiry: createdEnquiries[0],
      enquiries: createdEnquiries,
      bulk_id: bulkId,
      whatsappUrl,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Inquired Products (Section 6)
export const getMyEnquiries = async (req, res, next) => {
  try {
    const customerToken = req.cookies?.jt_customer_token || req.headers['x-customer-token'] || req.query.token;

    if (!customerToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide your customer token.',
      });
    }

    const customer = await Customer.findOne({ access_token: customerToken });

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
      quantity: item.quantity || 1,
      bulk_id: item.bulk_id || null,
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
