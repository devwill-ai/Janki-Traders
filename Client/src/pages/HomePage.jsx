import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { ProductCard } from '../components/ProductCard';
import { EnquiryModal } from '../components/EnquiryModal';
import heroSlide1 from '../assets/hero-slide-1.webp';
import heroSlide2 from '../assets/hero-slide-2.webp';
import heroSlide3 from '../assets/hero-slide-3.webp';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const originalHeroSlides = [heroSlide1, heroSlide2, heroSlide3];
// Cloned first and last slides to achieve infinite continuous sliding loop
const carouselSlides = [
  originalHeroSlides[originalHeroSlides.length - 1],
  ...originalHeroSlides,
  originalHeroSlides[0],
];

export const HomePage = () => {
  const { openAccessModal, hasRestrictedAccess, status, daysRemaining, settings } = useCustomer();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState(null);

  // Infinite Hero Slider State
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Safety clamp: prevents index from ever translating into empty space
  const safeIndex =
    currentIndex >= 0 && currentIndex < carouselSlides.length
      ? currentIndex
      : 1;

  // Pause carousel when tab is inactive/minimized to prevent timer desync and runaway increments
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        // Clean snap back if left on a boundary during tab sleep
        setCurrentIndex((prev) => {
          if (prev >= carouselSlides.length - 1) return 1;
          if (prev <= 0) return originalHeroSlides.length;
          return prev;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-advance infinite slider every 5 seconds (self-healing)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        // If already at or beyond the clone of the first slide, snap to 1 first
        if (prev >= carouselSlides.length - 1) {
          setIsTransitioning(false);
          return 1;
        }
        setIsTransitioning(true);
        return prev + 1;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Fallback safety: if onTransitionEnd is dropped due to browser throttling or blur,
  // silently snap boundary clones 150ms after the 1000ms transition finishes.
  useEffect(() => {
    if (currentIndex >= carouselSlides.length - 1) {
      const fallback = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 1150);
      return () => clearTimeout(fallback);
    } else if (currentIndex <= 0) {
      const fallback = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(originalHeroSlides.length);
      }, 1150);
      return () => clearTimeout(fallback);
    }
  }, [currentIndex]);

  // Seamless jump between clones and originals without rewinding
  const handleTransitionEnd = () => {
    if (currentIndex >= carouselSlides.length - 1) {
      setIsTransitioning(false);
      setCurrentIndex(1);
    } else if (currentIndex <= 0) {
      setIsTransitioning(false);
      setCurrentIndex(originalHeroSlides.length);
    }
  };

  // Re-enable transitions after instant jump
  useEffect(() => {
    if (!isTransitioning) {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [isTransitioning]);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev >= carouselSlides.length - 1) return 1;
      return prev + 1;
    });
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (prev <= 0) return originalHeroSlides.length;
      return prev - 1;
    });
  };

  const handleDotClick = (dotIdx) => {
    setIsTransitioning(true);
    setCurrentIndex(dotIdx + 1);
  };

  const activeDot = (safeIndex - 1 + originalHeroSlides.length) % originalHeroSlides.length;

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
      <section
        className="relative w-full hero-mobile-viewport flex items-center justify-center overflow-hidden border-b border-[#E8E2D5] bg-[#14120E] pt-16 pb-12 sm:pt-24 sm:pb-20"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Infinite Background Image Slider */}
        <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${safeIndex * 100}%)`,
              transition: isTransitioning
                ? 'transform 1000ms cubic-bezier(0.25, 1, 0.5, 1)'
                : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {carouselSlides.map((imgSrc, idx) => (
              <div key={idx} className="relative h-full w-full min-w-full shrink-0">
                <img
                  src={imgSrc}
                  alt={`Janki Traders Architectural Door Showcase ${idx}`}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ))}
          </div>

          {/* Luxury Architectural Contrast Overlays - Adjusted for image clarity */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.35)_100%)] pointer-events-none" />
        </div>

        {/* Centered Hero Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-16 text-center flex flex-col items-center justify-center">
          {/* Headline */}
          <h1 className="font-serif text-[1.65rem] sm:text-5xl md:text-6xl lg:text-7xl text-[#FAF9F5] font-semibold leading-[1.18] sm:leading-[1.1] tracking-tight max-w-4xl drop-shadow-lg mb-3 sm:mb-6">
            Architectural Doors of Timeless Craft & Enduring Strength
          </h1>

          {/* Subtitle */}
          <p className="text-[13px] sm:text-lg md:text-xl text-[#E0DDD5] font-light leading-relaxed max-w-2xl drop-shadow-md mb-6 sm:mb-10">
            Janki Traders supplies premier residential and commercial door collections — from 100% moisture-proof WPC & FRP formulations to handcrafted solid Burma teak and contemporary acoustic glass doors.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
            <Link
              to="/shop"
              className="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-md bg-[#C5A880] hover:bg-[#B39366] text-[#1A1A1A] font-semibold text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-xl flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Explore Full Catalogue</span>
              <ArrowRight size={14} />
            </Link>

            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Janki Traders, I would like to enquire about your door collections.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-md bg-white/10 hover:bg-white/20 text-[#FAF9F5] font-semibold text-xs tracking-wider uppercase border border-white/30 hover:border-white transition-all shadow-md backdrop-blur-md flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageCircle size={15} className="text-[#25D366]" />
              <span>WhatsApp Enquiry</span>
            </a>
          </div>
        </div>

        {/* Previous / Next Slide Controls (Desktop) */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous showcase slide"
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 border border-white/25 text-white/80 hover:text-white items-center justify-center transition-all backdrop-blur-md cursor-pointer hover:scale-105"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={handleNextSlide}
          aria-label="Next showcase slide"
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/35 hover:bg-black/70 border border-white/25 text-white/80 hover:text-white items-center justify-center transition-all backdrop-blur-md cursor-pointer hover:scale-105"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Indicator Pills */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5 bg-black/45 backdrop-blur-md px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20">
          {originalHeroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${activeDot === idx
                ? 'w-6 sm:w-8 bg-[#C5A880]'
                : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
            />
          ))}
        </div>
      </section>

      {/* 2. Company Introduction (Section 3) */}
      <section className="py-16 sm:py-20 border-b border-[#E8E2D5] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <img
              src="/logo-crest.webp"
              alt="Janki Traders Crest"
              className="w-14 h-14 object-contain mx-auto drop-shadow-sm mb-2"
            />
            <span className="text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-[0.2em] uppercase text-[#8C6D46] block">
              About Janki Traders
            </span>
            <h2 className="font-serif text-[clamp(1.5rem,4vw+0.25rem,2.25rem)] text-[#1A1A1A] font-semibold tracking-tight leading-[1.2]">
              Distributor of Engineered Doors for Architects, Builders & Modern Homes
            </h2>
            <p className="text-[clamp(0.875rem,2vw,1rem)] text-[#6B6862] font-light leading-relaxed">
              For over two decades, Janki Traders has stood as an authoritative wholesale partner for contractors, architects, and selective homeowners. We curate specialized door assemblies that eliminate common defects like warping, swelling, and termite intrusion while delivering distinguished curb appeal.
            </p>
          </div>

          {/* Key pillars */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Droplets size={20} />
              </div>
              <h3 className="font-serif text-[clamp(1.125rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                100% Waterproof Formulations
              </h3>
              <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] leading-relaxed">
                Engineered FRP and WPC doors that withstand high humidity, direct shower spray, and moisture without rotting or swelling.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3 className="font-serif text-[clamp(1.125rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                Fluted & Modern Glass Designs
              </h3>
              <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] leading-relaxed">
                Toughened fluted, reeded, and frosted glass framed in ultra-slim matte aluminum profiles for refined interior partitions.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-3">
              <div className="w-10 h-10 rounded-sm bg-[#8C6D46]/10 text-[#8C6D46] flex items-center justify-center">
                <Compass size={20} />
              </div>
              <h3 className="font-serif text-[clamp(1.125rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                Bespoke Artisanal Teak
              </h3>
              <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] leading-relaxed">
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
              <span className="text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
                Our Collections
              </span>
              <h2 className="font-serif text-[clamp(1.5rem,4vw+0.25rem,2.25rem)] text-[#1A1A1A] font-semibold mt-1 leading-[1.2]">
                Explore Door Categories
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-wider uppercase text-[#8C6D46] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
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
                  <span className="text-[clamp(0.625rem,1.5vw,0.6875rem)] uppercase tracking-wider text-[#C5A880] font-medium block">
                    {cat.productCount || 0} Models Available
                  </span>
                  <h3 className="font-serif text-[clamp(1.25rem,3vw,1.5rem)] font-semibold leading-snug text-white group-hover:text-[#C5A880] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-stone-300 font-light line-clamp-2 leading-relaxed">
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
              <span className="text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
                Featured Selections
              </span>
              <h2 className="font-serif text-[clamp(1.5rem,4vw+0.25rem,2.25rem)] text-[#1A1A1A] font-semibold mt-1 leading-[1.2]">
                Handcrafted Door Highlights
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-wider uppercase text-[#8C6D46] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors"
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C5A880]/40 text-[#C5A880] text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-widest uppercase">
            <Lock size={13} />
            <span>Controlled Access System</span>
          </div>

          <h2 className="font-serif text-[clamp(1.75rem,5vw+0.25rem,3rem)] font-semibold tracking-tight text-[#FAF9F5] leading-tight">
            Unlock Our Complete Architectural Catalogue
          </h2>

          <p className="text-[clamp(0.875rem,2vw,1rem)] text-stone-300 font-light max-w-2xl mx-auto leading-relaxed">
            Gain immediate 7-day unrestricted access to explore exclusive trade pricing, concealed pivot systems, and limited-edition door collections. Simply submit your name and mobile number.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            {status === 'active' ? (
              <Link
                to="/shop"
                className="px-8 py-3.5 rounded-md bg-[#8C6D46] hover:bg-[#a37e50] text-white text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-wider uppercase transition-all shadow-md"
              >
                Browse Full Catalogue ({daysRemaining}d Left)
              </Link>
            ) : (
              <button
                onClick={openAccessModal}
                className="px-8 py-3.5 rounded-md bg-[#FAF9F5] hover:bg-white text-[#1A1A1A] text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-wider uppercase transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                Unlock 7-Day Access
              </button>
            )}

            <Link
              to="/contact"
              className="px-8 py-3.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-[clamp(0.6875rem,1.5vw,0.75rem)] font-semibold tracking-wider uppercase border border-white/20 transition-all"
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
                <h4 className="font-serif text-[clamp(1.05rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                  Showroom & Wholesale Depot
                </h4>
                <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] mt-1 leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-lg bg-white border border-[#E8E2D5]">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <h4 className="font-serif text-[clamp(1.05rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                  Business Hours
                </h4>
                <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] mt-1 leading-relaxed">
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
                <h4 className="font-serif text-[clamp(1.05rem,2.5vw,1.25rem)] font-semibold text-[#1A1A1A] leading-snug">
                  Direct Trade Assistance
                </h4>
                <p className="text-[clamp(0.75rem,1.8vw,0.8125rem)] text-[#6B6862] mt-1 leading-relaxed">
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
