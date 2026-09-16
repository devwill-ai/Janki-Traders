import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { ProductCard } from '../components/ProductCard';
import { EnquiryModal } from '../components/EnquiryModal';
import {
  ArrowRight,
  ShieldCheck,
  Droplets,
  Sparkles,
  Layers,
  Lock,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const HomePage = () => {
  const { openAccessModal, hasRestrictedAccess, status, daysRemaining, settings } = useCustomer();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ featured: true }),
        ]);

        if (catsRes.success) setCategories(catsRes.data);
        if (prodsRes.success) setFeaturedProducts(prodsRes.data);
      } catch (err) {
        console.warn('Error loading home data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [hasRestrictedAccess]);

  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const phone = settings?.contact_number || '+91 98765 43210';
  const address = settings?.address || 'Plot No. 42, Timber & Architectural Market, Ring Road, Ahmedabad, Gujarat 380001';

  return (
    <div className="min-h-screen bg-[#FAF9F5]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#E8E2D5] bg-gradient-to-b from-[#F5F2EA] to-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] text-xs font-semibold tracking-wider uppercase shadow-xs">
                <ShieldCheck size={14} />
                <span>Trade & Architectural Doors Division</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] font-semibold leading-[1.12] tracking-tight">
                Architectural Doors of Timeless Craft & Enduring Strength
              </h1>

              <p className="text-base sm:text-lg text-[#5A5751] font-light leading-relaxed max-w-2xl">
                Janki Traders supplies premier residential and commercial door collections — from 100% moisture-proof WPC & FRP formulations to handcrafted solid Burma teak and contemporary acoustic glass doors.
              </p>

              {/* Status Banner / Quick CTA */}
              {status === 'active' ? (
                <div className="p-4 rounded-lg bg-[#EBF5EE] border border-[#A7D7B5] text-[#1E5631] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles size={16} className="text-[#2E7D32]" />
                    <span>Your full catalogue access is active ({daysRemaining} days remaining).</span>
                  </div>
                  <Link
                    to="/shop"
                    className="font-semibold underline hover:text-[#143d22]"
                  >
                    View All Doors →
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-[#4A4742]">
                    <Lock size={15} className="text-[#8C6D46] shrink-0" />
                    <span>Wholesale trade specs are restricted. Request 7-day catalogue access.</span>
                  </div>
                  <button
                    onClick={openAccessModal}
                    className="text-xs font-bold text-[#8C6D46] hover:text-[#1A1A1A] underline tracking-wide shrink-0 cursor-pointer"
                  >
                    Request 7-Day Access
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/shop"
                  className="px-6 py-3.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center gap-2"
                >
                  <span>Explore Full Catalogue</span>
                  <ArrowRight size={14} />
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Janki Traders, I would like to enquire about your door collections.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-md bg-[#FAF9F5] hover:bg-white text-[#1A1A1A] text-xs font-semibold tracking-wider uppercase border border-[#E8E2D5] hover:border-[#8C6D46] transition-all shadow-xs flex items-center gap-2"
                >
                  <MessageCircle size={15} className="text-[#25D366]" />
                  <span>WhatsApp Enquiry</span>
                </a>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-[#F2EFE9]">
                  <img
                    src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=80"
                    alt="Luxury Entrance Door"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Architectural Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-lg border border-[#E8E2D5] shadow-xl max-w-[240px] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6D46]">
                    <Sparkles size={14} />
                    <span>Hand-Selected Woods</span>
                  </div>
                  <p className="text-[11px] text-[#6B6862] leading-relaxed">
                    Kiln-seasoned teak, seamless waterproof WPC cores, and precision acoustic seals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Company Introduction (Section 3) */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
              About Janki Traders
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold tracking-tight">
              Distributor of Engineered Doors for Architects, Builders & Modern Homes
            </h2>
            <p className="text-sm sm:text-base text-[#6B6862] font-light leading-relaxed">
              For over two decades, Janki Traders has stood as an authoritative wholesale partner for contractors, architects, and selective homeowners. We curate specialized door assemblies that eliminate common defects like warping, swelling, and termite intrusion while delivering distinguished curb appeal.
            </p>
          </div>

          {/* Key pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                100% Waterproof Formulations
              </h3>
              <p className="text-xs text-[#6B6862] leading-relaxed">
                Engineered FRP and WPC doors that withstand high humidity, direct shower spray, and moisture without rotting or swelling.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                Fluted & Modern Glass Designs
              </h3>
              <p className="text-xs text-[#6B6862] leading-relaxed">
                Toughened fluted, reeded, and frosted glass framed in ultra-slim matte aluminum profiles for refined interior partitions.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Compass size={20} />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                Bespoke Artisanal Teak
              </h3>
              <p className="text-xs text-[#6B6862] leading-relaxed">
                Seasoned Burma teak and handcrafted entrance doors with custom brass inlays and multi-point smart locking compatibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Door Categories (Section 3 & User Feedback) */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
                Our Collections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold mt-1">
                Explore Door Categories
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold tracking-wider uppercase text-[#8C6D46] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-[#E8E2D5] bg-white luxury-card h-72 flex flex-col justify-end p-6"
              >
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="relative z-10 text-white space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-medium block">
                    {cat.productCount || 0} Models Available
                  </span>
                  <h3 className="font-serif text-2xl font-semibold leading-snug text-white group-hover:text-[#C5A880] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-300 font-light line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Products (Section 3) */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
                Featured Selections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold mt-1">
                Handcrafted Door Highlights
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold tracking-wider uppercase text-[#8C6D46] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
            >
              <span>Explore Complete Catalogue</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-96 rounded-lg bg-[#FAF9F5] animate-pulse border border-[#E8E2D5]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onInquireClick={(prod) => setSelectedProductForEnquiry(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. 7-Day Access Banner CTA (Section 4 & 8) */}
      <section className="py-16 sm:py-20 bg-[#1A1A1A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C5A880]/40 text-[#C5A880] text-xs font-semibold tracking-widest uppercase">
            <Lock size={13} />
            <span>Controlled Access System</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-[#FAF9F5] leading-tight">
            Unlock Our Complete Architectural Catalogue
          </h2>

          <p className="text-sm sm:text-base text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
            Gain immediate 7-day unrestricted access to explore exclusive trade pricing, concealed pivot systems, and limited-edition door collections. Simply submit your name and mobile number.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            {status === 'active' ? (
              <Link
                to="/shop"
                className="px-8 py-3.5 rounded-md bg-[#8C6D46] hover:bg-[#a37e50] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
              >
                Browse Full Catalogue ({daysRemaining}d Left)
              </Link>
            ) : (
              <button
                onClick={openAccessModal}
                className="px-8 py-3.5 rounded-md bg-[#FAF9F5] hover:bg-white text-[#1A1A1A] text-xs font-semibold tracking-wider uppercase transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                Request 7-Day Access
              </button>
            )}

            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider uppercase border border-white/20 transition-all"
            >
              Visit Our Showroom
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Basic Contact & Showroom Details (Section 3) */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-lg bg-white border border-[#E8E2D5]">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                  Showroom & Wholesale Depot
                </h4>
                <p className="text-xs text-[#6B6862] mt-1 leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-lg bg-white border border-[#E8E2D5]">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                  Business Hours
                </h4>
                <p className="text-xs text-[#6B6862] mt-1 leading-relaxed">
                  Mon - Sat: 9:30 AM to 8:00 PM<br />
                  Sunday Open by Prior Trade Appointment
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-lg bg-white border border-[#E8E2D5]">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h4 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                  Direct Trade Assistance
                </h4>
                <p className="text-xs text-[#6B6862] mt-1 leading-relaxed">
                  Call: <a href={`tel:${phone}`} className="font-semibold text-[#1A1A1A]">{phone}</a><br />
                  WhatsApp Direct Enquiry Available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={!!selectedProductForEnquiry}
        product={selectedProductForEnquiry}
        onClose={() => setSelectedProductForEnquiry(null)}
      />
    </div>
  );
};
