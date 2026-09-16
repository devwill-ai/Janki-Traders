import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Setting } from '../models/Setting.js';
import { Customer } from '../models/Customer.js';
import { AccessRequest } from '../models/AccessRequest.js';
import { Enquiry } from '../models/Enquiry.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/janki_traders';

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('[Seed] Connected successfully.');

    // Clear existing data (for clean fresh setup)
    await Admin.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Setting.deleteMany({});
    await Customer.deleteMany({});
    await AccessRequest.deleteMany({});
    await Enquiry.deleteMany({});

    console.log('[Seed] Cleared collections.');

    // 1. Create Default Admin
    // Note: Admin model pre('save') hashes password automatically
    const admin = new Admin({
      name: 'Janki Traders Admin',
      email: 'admin@jankitraders.com',
      password: 'Admin@12345',
      role: 'superadmin',
    });
    await admin.save();
    console.log('[Seed] Created default Admin: admin@jankitraders.com / Admin@12345');

    // 2. Create Categories
    const categoriesData = [
      {
        name: 'Waterproof Doors',
        slug: 'waterproof-doors',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
        description: '100% moisture-proof, termite-resistant FRP & WPC doors designed for bathrooms, balconies, and coastal environments.',
        status: 'active',
        order: 1,
      },
      {
        name: 'Glass Doors',
        slug: 'glass-doors',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        description: 'Contemporary fluted, frosted, and slim-profile aluminum framed architectural glass doors.',
        status: 'active',
        order: 2,
      },
      {
        name: 'Wooden Doors',
        slug: 'wooden-doors',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
        description: 'Handcrafted solid teak, seasoned white oak, and rich walnut doors with timeless artisanal grain.',
        status: 'active',
        order: 3,
      },
      {
        name: 'Laminated & Membrane Doors',
        slug: 'laminated-membrane-doors',
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80',
        description: 'Scratch-proof, high-pressure decorative laminate and seamlessly wrapped 3D membrane doors.',
        status: 'active',
        order: 4,
      },
      {
        name: 'Designer Entrance Doors',
        slug: 'designer-entrance-doors',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
        description: 'Grand luxury pivot doors with brass inlays, vertical handles, and acoustic insulation.',
        status: 'active',
        order: 5,
      },
    ];

    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`[Seed] Created ${insertedCategories.length} categories.`);

    const catMap = {};
    insertedCategories.forEach((cat) => {
      catMap[cat.slug] = cat._id;
    });

    // 3. Create Door Products (Public and Restricted)
    const productsData = [
      // Waterproof Doors
      {
        name: 'AquaShield Hydro-Lock WPC Door',
        product_code: 'JT-WP-101',
        category_id: catMap['waterproof-doors'],
        description: 'Heavy-density composite core with 100% waterproof seal. Completely unaffected by steam, moisture, or direct water splashes. Zero warping or swelling guarantee.',
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: true,
        status: 'active',
      },
      {
        name: 'FRP Seamless Antibacterial Bathroom Door',
        product_code: 'JT-WP-102',
        category_id: catMap['waterproof-doors'],
        description: 'Fiberglass reinforced polymer with gel-coat finish. Highly hygienic, chemical-resistant, and ideal for modern bathroom and wet-room installations.',
        images: [
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: false,
        status: 'active',
      },
      {
        name: 'AquaLux Textured Woodgrain Marine Door (Trade Exclusive)',
        product_code: 'JT-WP-103',
        category_id: catMap['waterproof-doors'],
        description: 'Special wholesale edition with embossed natural wood grain on solid polymer substrate. Fire-retardant B1 rating and heavy-duty acoustic seal.',
        images: [
          'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'restricted',
        featured: true,
        status: 'active',
      },

      // Glass Doors
      {
        name: 'AeroLine Slim Profile Frosted Glass Door',
        product_code: 'JT-GD-201',
        category_id: catMap['glass-doors'],
        description: '10mm toughened safety glass with acid-etched frosted privacy finish and anodized matte black aluminum frame. German soft-close hinges included.',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: true,
        status: 'active',
      },
      {
        name: 'Fluted Reeded Glass French Double Door (Architectural Spec)',
        product_code: 'JT-GD-202',
        category_id: catMap['glass-doors'],
        description: 'Luxury fluted ribbed glass diffusing light while maintaining visual seclusion. Champagne gold electroplated stainless steel hardware system.',
        images: [
          'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'restricted',
        featured: true,
        status: 'active',
      },
      {
        name: 'Lumina Minimalist Tinted Bronze Glass Door',
        product_code: 'JT-GD-203',
        category_id: catMap['glass-doors'],
        description: 'Warm bronze-tinted tempered glass with floor-pivot mechanism, suited for executive cabins and master suites.',
        images: [
          'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: false,
        status: 'active',
      },

      // Wooden Doors
      {
        name: 'Royal Heritage Solid Teak Entrance Door',
        product_code: 'JT-WD-301',
        category_id: catMap['wooden-doors'],
        description: 'Crafted from 100% genuine seasoned Burma Teak with traditional geometric panels. Treated with organic oils to accentuate golden honey timber grains.',
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: true,
        status: 'active',
      },
      {
        name: 'Artisan Carved Rosewood Palace Door (Limited Edition)',
        product_code: 'JT-WD-302',
        category_id: catMap['wooden-doors'],
        description: 'Bespoke hand-carved floral motifs by master woodcrafters. Reinforced with concealed steel spine for lifetime dimensional stability.',
        images: [
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'restricted',
        featured: true,
        status: 'active',
      },
      {
        name: 'Nordic White Oak Horizontal Panel Door',
        product_code: 'JT-WD-303',
        category_id: catMap['wooden-doors'],
        description: 'Engineered solid core with natural European White Oak veneer. Clean architectural lines with magnetic latch compatibility.',
        images: [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: false,
        status: 'active',
      },

      // Laminated & Membrane Doors
      {
        name: 'Linear Velvet Matte Grey Laminated Door',
        product_code: 'JT-LM-401',
        category_id: catMap['laminated-membrane-doors'],
        description: '1mm anti-fingerprint high pressure laminate bonded over calibrated tubular core. Scratch, heat, and stain resistant.',
        images: [
          'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: true,
        status: 'active',
      },
      {
        name: '3D Embossed Walnut Membrane Door (Dealer Tier)',
        product_code: 'JT-LM-402',
        category_id: catMap['laminated-membrane-doors'],
        description: 'Vacuum membrane pressed PVC foil enveloping all 5 surfaces seamlessly without edge banding. Zero risk of peeling in humid climates.',
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'restricted',
        featured: false,
        status: 'active',
      },

      // Designer Entrance Doors
      {
        name: 'Imperial Brass Inlay Heavy Pivot Entrance Door',
        product_code: 'JT-DE-501',
        category_id: catMap['designer-entrance-doors'],
        description: 'Over-sized 8-foot entrance statement door featuring brushed satin brass inlays set into ebonized charred ash wood. 360-degree hydraulic pivot hinge included.',
        images: [
          'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'restricted',
        featured: true,
        status: 'active',
      },
      {
        name: 'Granite & Smoked Oak Hybrid Security Entrance Door',
        product_code: 'JT-DE-502',
        category_id: catMap['designer-entrance-doors'],
        description: 'Architectural fusion of ultra-thin natural stone veneer and smoked oak with multi-point smart digital lock pre-machining.',
        images: [
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
        ],
        visibility: 'public',
        featured: true,
        status: 'active',
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`[Seed] Created ${insertedProducts.length} door products.`);

    // 4. Create Settings
    const setting = new Setting({
      company_name: 'Janki Traders',
      tagline: 'Wholesale & Retail Architectural Doors | Waterproof • Glass • Teak',
      default_access_duration_days: 7,
      whatsapp_number: '+919876543210',
      contact_number: '+919876543210',
      email: 'sales@jankitraders.com',
      address: 'Shop No. 12-15, Architectural Doors & Plywood Market, Ring Road, Ahmedabad, Gujarat 380001',
      google_maps_url: 'https://maps.google.com/?q=Janki+Traders+Ahmedabad',
      business_hours: 'Monday - Saturday: 9:00 AM - 8:30 PM (Sunday Open by Appointment)',
      about_text: 'Janki Traders is an established distributor of high-performance doors for homes, hotels, hospitals, and commercial developments. We specialize in 100% waterproof FRP/WPC doors, fluted glass partitions, artisanal solid Burma teak, and luxury pivot doors.',
    });
    await setting.save();
    console.log('[Seed] Created default store settings.');

    console.log('\n==========================================');
    console.log(' SEED COMPLETED SUCCESSFULLY');
    console.log(' Admin Login: admin@jankitraders.com');
    console.log(' Admin Password: Admin@12345');
    console.log(' Total Categories:', insertedCategories.length);
    console.log(' Total Products:', insertedProducts.length);
    console.log(' Public Products:', insertedProducts.filter(p => p.visibility === 'public').length);
    console.log(' Restricted Products:', insertedProducts.filter(p => p.visibility === 'restricted').length);
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
