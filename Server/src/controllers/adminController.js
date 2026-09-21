import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Customer } from '../models/Customer.js';
import { AccessRequest } from '../models/AccessRequest.js';
import { Enquiry } from '../models/Enquiry.js';
import { Setting } from '../models/Setting.js';
import { deleteUploadedFile } from '../utils/fileUtils.js';

// 1. Dashboard Metrics (Section 10)
export const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalProducts,
      publicProducts,
      restrictedProducts,
      pendingRequests,
      activeAccess,
      expiredAccess,
      totalEnquiries,
      recentRequests,
      recentEnquiries,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ visibility: 'public' }),
      Product.countDocuments({ visibility: 'restricted' }),
      AccessRequest.countDocuments({ status: 'pending' }),
      AccessRequest.countDocuments({ status: 'approved', expires_at: { $gt: now } }),
      AccessRequest.countDocuments({
        $or: [
          { status: 'expired' },
          { status: 'approved', expires_at: { $lte: now } },
        ],
      }),
      Enquiry.countDocuments(),
      AccessRequest.find()
        .populate('customer_id', 'name mobile status')
        .sort({ requested_at: -1 })
        .limit(5)
        .lean(),
      Enquiry.find()
        .populate('product_id', 'name product_code images')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    res.json({
      success: true,
      stats: {
        totalProducts,
        publicProducts,
        restrictedProducts,
        pendingRequests,
        activeAccess,
        expiredAccess,
        totalEnquiries,
      },
      recentRequests,
      recentEnquiries,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Access Requests (Section 11)
export const getAccessRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await AccessRequest.find(query)
      .populate('customer_id', 'name mobile status')
      .sort({ requested_at: -1 })
      .lean();

    // In-memory filter for search across populated customer fields if provided
    let filtered = requests;
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = requests.filter(
        (r) =>
          r.customer_id?.name?.toLowerCase().includes(term) ||
          r.customer_id?.mobile?.includes(term)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// Approve Access Request
export const approveAccessRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { durationDays } = req.body;

    const request = await AccessRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Access request not found.' });
    }

    const settings = await Setting.findOne();
    const days = Number(durationDays) || request.duration_days || settings?.default_access_duration_days || 7;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    request.status = 'approved';
    request.approved_at = now;
    request.expires_at = expiresAt;
    request.duration_days = days;
    await request.save();

    // Update customer status to active
    await Customer.findByIdAndUpdate(request.customer_id, { status: 'active' });

    res.json({
      success: true,
      message: `Access approved for ${days} days until ${expiresAt.toLocaleDateString()}.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Reject Access Request
export const rejectAccessRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const request = await AccessRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Access request not found.' });
    }

    request.status = 'rejected';
    request.admin_notes = reason || 'Declined by administrator';
    await request.save();

    await Customer.findByIdAndUpdate(request.customer_id, { status: 'rejected' });

    res.json({
      success: true,
      message: 'Access request rejected.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Customers (Section 12)
export const getCustomers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { mobile: regex }];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 }).lean();

    // Attach latest request details for each customer
    const enriched = await Promise.all(
      customers.map(async (cust) => {
        const latestReq = await AccessRequest.findOne({ customer_id: cust._id })
          .sort({ requested_at: -1 })
          .lean();

        const now = new Date();
        let computedStatus = cust.status;
        if (latestReq && latestReq.status === 'approved') {
          if (new Date(latestReq.expires_at) < now) {
            computedStatus = 'expired';
          } else {
            computedStatus = 'active';
          }
        }

        return {
          ...cust,
          status: computedStatus,
          access_start: latestReq?.approved_at || null,
          access_expiry: latestReq?.expires_at || null,
          last_request_id: latestReq?._id || null,
        };
      })
    );

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// Extend Customer Access
export const extendCustomerAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    let request = await AccessRequest.findOne({ customer_id: customer._id }).sort({ requested_at: -1 });
    const now = new Date();

    let baseDate = now;
    if (request && request.expires_at && new Date(request.expires_at) > now) {
      baseDate = new Date(request.expires_at);
    }

    const newExpiry = new Date(baseDate.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    if (request) {
      request.status = 'approved';
      request.approved_at = request.approved_at || now;
      request.expires_at = newExpiry;
      await request.save();
    } else {
      request = new AccessRequest({
        customer_id: customer._id,
        status: 'approved',
        approved_at: now,
        expires_at: newExpiry,
        duration_days: days,
      });
      await request.save();
    }

    customer.status = 'active';
    await customer.save();

    res.json({
      success: true,
      message: `Access extended by ${days} days until ${newExpiry.toLocaleDateString()}.`,
      expires_at: newExpiry,
    });
  } catch (error) {
    next(error);
  }
};

// Revoke Customer Access
export const revokeCustomerAccess = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await AccessRequest.updateMany(
      { customer_id: customer._id, status: 'approved' },
      { status: 'revoked', expires_at: new Date() }
    );

    customer.status = 'expired';
    await customer.save();

    res.json({
      success: true,
      message: 'Access revoked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Block / Unblock Customer
export const toggleBlockCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    if (customer.status === 'blocked') {
      customer.status = 'pending';
      await customer.save();
      return res.json({ success: true, message: 'Customer unblocked.', status: 'pending' });
    } else {
      customer.status = 'blocked';
      await customer.save();
      return res.json({ success: true, message: 'Customer blocked successfully.', status: 'blocked' });
    }
  } catch (error) {
    next(error);
  }
};

// 4. Products CRUD (Section 13)
export const getAdminProducts = async (req, res, next) => {
  try {
    const { category, visibility, featured, status, search } = req.query;
    const query = {};

    if (category && category !== 'all') query.category_id = category;
    if (visibility && visibility !== 'all') query.visibility = visibility;
    if (status && status !== 'all') query.status = status;
    if (featured === 'true') query.featured = true;
    if (featured === 'false') query.featured = false;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { product_code: regex }, { description: regex }];
    }

    const products = await Product.find(query)
      .populate('category_id', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, product_code, category_id, description, visibility, featured, status } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ success: false, message: 'Product name and category are required.' });
    }

    // Auto-generate code if missing
    let code = product_code?.trim().toUpperCase();
    if (!code) {
      code = 'JT-' + Math.floor(1000 + Math.random() * 9000);
    }

    // Check duplicate code
    const existing = await Product.findOne({ product_code: code });
    if (existing) {
      return res.status(400).json({ success: false, message: `Product code "${code}" already exists.` });
    }

    let productImages = [];
    // Files uploaded directly from system via Multer
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.file) {
      productImages = [`/uploads/${req.file.filename}`];
    }

    const product = new Product({
      name: name.trim(),
      product_code: code,
      category_id,
      description: description?.trim() || '',
      images: productImages,
      visibility: visibility || 'public',
      featured: featured === true || featured === 'true',
      status: status || 'active',
    });

    await product.save();
    await product.populate('category_id', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, product_code, category_id, description, visibility, featured, status, existingImages } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (name) product.name = name.trim();
    if (product_code) product.product_code = product_code.trim().toUpperCase();
    if (category_id) product.category_id = category_id;
    if (description !== undefined) product.description = description.trim();
    if (visibility) product.visibility = visibility;
    if (featured !== undefined) product.featured = featured === true || featured === 'true';
    if (status) product.status = status;

    // Capture previous images to track what was removed on save
    const previousImages = Array.isArray(product.images) ? [...product.images] : [];

    // Handle existing images retained from client
    let keptImages = [];
    if (existingImages !== undefined) {
      try {
        keptImages = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
      } catch {
        keptImages = Array.isArray(existingImages) ? existingImages : [];
      }
    } else {
      keptImages = product.images || [];
    }

    // Attach newly uploaded files from system
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.file) {
      newImages = [`/uploads/${req.file.filename}`];
    }

    product.images = [...newImages, ...keptImages];

    await product.save();
    await product.populate('category_id', 'name slug');

    // When admin clicks "Save Changes" and save succeeds, safely delete removed old images from VPS disk
    const removedImages = previousImages.filter((oldImg) => !keptImages.includes(oldImg));
    removedImages.forEach(deleteUploadedFile);

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const imagesToDelete = Array.isArray(product.images) ? [...product.images] : [];

    await Product.findByIdAndDelete(id);

    // Clean up all product images from disk after successful database delete
    imagesToDelete.forEach(deleteUploadedFile);

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// 5. Categories CRUD (Section 14)
export const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 }).lean();
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const total = await Product.countDocuments({ category_id: cat._id });
        const publicCount = await Product.countDocuments({ category_id: cat._id, visibility: 'public' });
        const restrictedCount = await Product.countDocuments({ category_id: cat._id, visibility: 'restricted' });
        return {
          ...cat,
          totalProducts: total,
          publicProducts: publicCount,
          restrictedProducts: restrictedCount,
        };
      })
    );

    res.json({
      success: true,
      count: withCounts.length,
      data: withCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, status, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists.' });
    }

    let categoryImage = '';
    if (req.file) {
      categoryImage = `/uploads/${req.file.filename}`;
    }

    const category = new Category({
      name: name.trim(),
      slug,
      image: categoryImage,
      description: description || '',
      status: status || 'active',
      order: Number(order) || 0,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, order } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const oldImage = category.image;

    if (name) {
      category.name = name.trim();
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (status) category.status = status;
    if (order !== undefined) category.order = Number(order);

    if (req.file) {
      category.image = `/uploads/${req.file.filename}`;
    }

    await category.save();

    // When admin saves changes with a new cover image, delete old image from disk
    if (req.file && oldImage && oldImage !== category.image) {
      deleteUploadedFile(oldImage);
    }

    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if products exist in category
    const count = await Product.countDocuments({ category_id: id });
    if (count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${count} products. Reassign or delete products first.`,
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const imageToDelete = category.image;
    await Category.findByIdAndDelete(id);

    if (imageToDelete) {
      deleteUploadedFile(imageToDelete);
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// 6. Enquiries Management (Section 15)
export const getAdminEnquiries = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customer_name: regex },
        { customer_mobile: regex },
        { product_name: regex },
        { product_code: regex },
      ];
    }

    const enquiries = await Enquiry.find(query)
      .populate('product_id', 'name product_code images visibility')
      .populate('customer_id', 'name mobile status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'converted', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid enquiry status.' });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    res.json({
      success: true,
      message: 'Enquiry status updated successfully.',
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Settings (Section 16)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const fields = [
      'company_name',
      'tagline',
      'default_access_duration_days',
      'whatsapp_number',
      'contact_number',
      'email',
      'address',
      'google_maps_url',
      'business_hours',
      'about_text',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    res.json({
      success: true,
      message: 'Store settings updated successfully.',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
