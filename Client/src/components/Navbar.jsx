import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { useBulkEnquiry } from '../context/BulkEnquiryContext';
import {
  Lock,
  Unlock,
  Clock,
  ShieldAlert,
  Menu,
  X,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { status, daysRemaining, hoursRemaining, openAccessModal, settings } = useCustomer();
  const { distinctCount, openBulkModal } = useBulkEnquiry();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/';
  // Transparent only on home page when user hasn't scrolled
  const isTransparent = isHomePage && !isScrolled;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop Catalogue', path: '/shop' },
    { name: 'Inquired Products', path: '/inquired' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent shadow-none'
          : 'bg-[#FAF9F5]/92 backdrop-blur-md shadow-xs'
      }`}
    >
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-[clamp(0.75rem,2vw,2rem)] h-[clamp(4rem,4.5vw+1rem,5rem)] flex items-center justify-between gap-[clamp(0.5rem,1.5vw,1.5rem)]">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-[clamp(0.5rem,1vw,0.875rem)] group shrink-0">
          <img
            src="/logo-crest.webp"
            alt="Janki Traders Crest Logo"
            className="w-[clamp(2rem,2.5vw,2.75rem)] h-[clamp(2rem,2.5vw,2.75rem)] object-contain transition-transform group-hover:scale-105 drop-shadow-xs shrink-0"
          />
          <div>
            <span
              className={`font-serif text-[clamp(1.15rem,1.6vw+0.25rem,1.75rem)] font-semibold tracking-wide block leading-none transition-colors duration-300 ${
                isTransparent ? 'text-white drop-shadow-sm' : 'text-[#1A1A1A]'
              }`}
            >
              {settings?.company_name || 'Janki Traders'}
            </span>
            <span
              className={`text-[clamp(7.5px,0.75vw+1px,10px)] tracking-[clamp(0.12em,0.2vw,0.2em)] uppercase font-sans block mt-1 font-medium transition-colors duration-300 ${
                isTransparent ? 'text-[#C5A880]' : 'text-[#8C6D46]'
              }`}
            >
              {settings?.tagline || 'Architectural Doors'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-[clamp(0.5rem,1.25vw,1.75rem)]">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[clamp(0.75rem,0.8vw+0.12rem,0.875rem)] whitespace-nowrap font-medium tracking-wide transition-colors relative py-1 px-[clamp(0.15rem,0.3vw,0.35rem)] ${
                isActive(link.path)
                  ? isTransparent
                    ? 'text-[#C5A880] font-semibold'
                    : 'text-[#8C6D46] font-semibold'
                  : isTransparent
                    ? 'text-white/85 hover:text-white'
                    : 'text-[#4A4742] hover:text-[#1A1A1A]'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span
                  className={`absolute bottom-0 left-0 w-full h-[2px] rounded-full animate-fadeIn ${
                    isTransparent ? 'bg-[#C5A880]' : 'bg-[#8C6D46]'
                  }`}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Header Right Actions (Bulk Enquiry + Customer Access Status Button) */}
        <div className="hidden sm:flex items-center gap-[clamp(0.35rem,0.8vw,0.625rem)] shrink-0">
          {/* Bulk Enquiry Basket Button */}
          <button
            onClick={openBulkModal}
            className={`text-[clamp(0.6875rem,0.75vw+0.05rem,0.75rem)] font-medium flex items-center gap-1.5 px-[clamp(0.5rem,0.8vw,0.75rem)] py-[clamp(0.3rem,0.5vw,0.4rem)] rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              distinctCount > 0
                ? 'bg-[#8C6D46] hover:bg-[#785c39] text-white shadow-xs'
                : isTransparent
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-[#6B6862] hover:text-[#1A1A1A] hover:bg-[#E8E2D5]/40'
            }`}
            title="View Bulk Enquiry List"
          >
            <Layers size={14} />
            <span>Enquiry List</span>
            {distinctCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-white text-[#8C6D46]">
                {distinctCount}
              </span>
            )}
          </button>

          {status === 'active' ? (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-[clamp(0.55rem,0.9vw,0.875rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] rounded-full text-[clamp(0.6875rem,0.75vw+0.05rem,0.75rem)] font-medium transition-all whitespace-nowrap shrink-0 ${
                isTransparent
                  ? 'bg-emerald-950/60 border border-emerald-400/40 text-emerald-200 backdrop-blur-md shadow-sm'
                  : 'bg-[#EBF5EE] border border-[#A7D7B5] text-[#1E5631] shadow-xs'
              }`}
            >
              <Unlock size={14} className={isTransparent ? 'text-emerald-400' : 'text-[#2E7D32]'} />
              <span>
                Full Access Active ({daysRemaining > 0 ? `${daysRemaining}d left` : `${hoursRemaining}h left`})
              </span>
            </div>
          ) : status === 'pending' ? (
            <button
              onClick={openAccessModal}
              className={`flex items-center gap-1.5 sm:gap-2 px-[clamp(0.55rem,0.9vw,0.875rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] rounded-full text-[clamp(0.6875rem,0.75vw+0.05rem,0.75rem)] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isTransparent
                  ? 'bg-amber-950/60 border border-amber-400/40 text-amber-200 backdrop-blur-md hover:bg-amber-950/80'
                  : 'bg-[#FFF8E7] border border-[#F3DB9F] text-[#8C6D46] hover:bg-[#FFF3D6]'
              }`}
            >
              <Clock size={14} className={`animate-spin ${isTransparent ? 'text-amber-400' : 'text-[#8C6D46]'}`} />
              <span>Approval Pending</span>
            </button>
          ) : status === 'expired' ? (
            <button
              onClick={openAccessModal}
              className={`flex items-center gap-1.5 sm:gap-2 px-[clamp(0.55rem,0.9vw,0.875rem)] py-[clamp(0.35rem,0.5vw,0.45rem)] rounded-full text-[clamp(0.6875rem,0.75vw+0.05rem,0.75rem)] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isTransparent
                  ? 'bg-rose-950/60 border border-rose-400/40 text-rose-200 backdrop-blur-md hover:bg-rose-950/80'
                  : 'bg-[#FFF0F0] border border-[#F5C2C2] text-[#B71C1C] hover:bg-[#FFE5E5]'
              }`}
            >
              <ShieldAlert size={14} />
              <span>Access Expired • Renew</span>
            </button>
          ) : (
            <button
              onClick={openAccessModal}
              className={`flex items-center gap-1.5 sm:gap-2 px-[clamp(0.6rem,1vw,1rem)] py-[clamp(0.35rem,0.6vw,0.5rem)] rounded-md text-[clamp(0.6875rem,0.75vw+0.05rem,0.75rem)] font-medium tracking-wide transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isTransparent
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-sm'
                  : 'bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] shadow-sm hover:shadow-md'
              }`}
            >
              <Lock size={13} className="text-[#C5A880]" />
              <span>Unlock Full Access</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger button */}
        <div className="flex items-center gap-2 md:hidden shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-[clamp(0.4rem,1vw,0.5rem)] rounded-md transition-colors cursor-pointer ${
              isTransparent
                ? 'text-white hover:bg-white/15'
                : 'text-[#1A1A1A] hover:bg-[#E8E2D5]/50'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t px-[clamp(1rem,3vw,1.5rem)] pt-3 pb-5 space-y-2 animate-fadeIn ${
            isTransparent
              ? 'bg-[#14120E]/95 backdrop-blur-md border-white/15 text-white shadow-lg'
              : 'bg-[#FAF9F5]/95 backdrop-blur-md border-[#E8E2D5] text-[#1A1A1A] shadow-md'
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? isTransparent
                    ? 'bg-white/15 text-[#C5A880] font-semibold'
                    : 'bg-[#E8E2D5]/60 text-[#8C6D46] font-semibold'
                  : isTransparent
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-[#4A4742] hover:bg-[#E8E2D5]/30'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Bulk Enquiry Link in Mobile Menu */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              openBulkModal();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
              isTransparent
                ? 'text-white/80 hover:bg-white/10'
                : 'text-[#4A4742] hover:bg-[#E8E2D5]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers size={16} />
              <span>Bulk Enquiry List</span>
            </div>
            {distinctCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#8C6D46] text-white">
                {distinctCount} items
              </span>
            )}
          </button>

          <div className={`pt-3 border-t ${isTransparent ? 'border-white/15' : 'border-[#E8E2D5]'}`}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAccessModal();
              }}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium flex items-center justify-center gap-2 cursor-pointer ${
                isTransparent
                  ? 'bg-[#C5A880] text-[#1A1A1A] font-semibold'
                  : 'bg-[#1A1A1A] text-[#FAF9F5]'
              }`}
            >
              {status === 'active' ? (
                <>
                  <Unlock size={16} className={isTransparent ? 'text-[#1A1A1A]' : 'text-[#8C6D46]'} />
                  <span>Full Catalogue Unlocked ({daysRemaining}d left)</span>
                </>
              ) : status === 'pending' ? (
                <>
                  <Clock size={16} className={isTransparent ? 'text-[#1A1A1A]' : 'text-[#C5A880]'} />
                  <span>Request Pending Admin Review</span>
                </>
              ) : (
                <>
                  <Lock size={16} className={isTransparent ? 'text-[#1A1A1A]' : 'text-[#C5A880]'} />
                  <span>Unlock Full Access</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
