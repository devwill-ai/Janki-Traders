import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

// Get Products (Returns public and restricted products; restricted items display locked for visitors)
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, featured, sort, visibility } = req.query;

    const query = { status: 'active' };

    // Support optional visibility filter (all, public, restricted)
    if (visibility && visibility !== 'all') {
      query.visibility = visibility;
    }

    // Category filter (slug or ObjectId)
    if (category && category !== 'all') {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category_id = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) {
          query.category_id = cat._id;
        }
      }
    }

    // Search filter
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { product_code: regex },
        { description: regex },
      ];
    }

    // Featured filter
    if (featured === 'true' || featured === true) {
      query.featured = true;
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };
    if (sort === 'name_desc') sortOptions = { name: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };

    const products = await Product.find(query)
      .populate('category_id', 'name slug image')
      .sort(sortOptions)
      .lean();

    res.json({
      success: true,
      count: products.length,
      hasRestrictedAccess: !!req.hasRestrictedAccess,
      customerStatus: req.customerStatus || 'public',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product by ID (with strict server-side restricted verification)
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category_id', 'name slug image description')
      .lean();

    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found or currently unavailable.',
      });
    }

    // Enforce access rule on single product retrieval
    if (product.visibility === 'restricted' && !req.hasRestrictedAccess) {
      return res.status(403).json({
        success: false,
        isRestricted: true,
        message: 'This door model is part of our restricted catalogue. Please request access to view details.',
        productSummary: {
          id: product._id,
          name: product.name,
          category: product.category_id,
          visibility: 'restricted',
        },
      });
    }

    res.json({
      success: true,
      hasRestrictedAccess: !!req.hasRestrictedAccess,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// Get Categories (Public)
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'active' })
      .sort({ order: 1, name: 1 })
      .lean();

    // Attach product counts for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          category_id: cat._id,
          status: 'active',
        });
        return {
          ...cat,
          productCount,
        };
      })
    );

    res.json({
      success: true,
      count: categoriesWithCount.length,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};
