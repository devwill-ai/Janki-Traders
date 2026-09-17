import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import {
  Lock,
  Unlock,
  Clock,
  ShieldAlert,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { status, hasRestrictedAccess, daysRemaining, hoursRemaining, openAccessModal, customerName } = useCustomer();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3.5 group">
          <img
            src="/logo-crest.webp"
            alt="Janki Traders Crest Logo"
            className="w-11 h-11 object-contain transition-transform group-hover:scale-105 drop-shadow-xs"
          />
          <div>
            <span
              className={`font-serif text-2xl sm:text-3xl font-semibold tracking-wide block leading-none transition-colors duration-300 ${
                isTransparent ? 'text-white drop-shadow-sm' : 'text-[#1A1A1A]'
              }`}
            >
              Janki Traders
            </span>
            <span
              className={`text-[10px] tracking-[0.2em] uppercase font-sans block mt-1 font-medium transition-colors duration-300 ${
                isTransparent ? 'text-[#C5A880]' : 'text-[#8C6D46]'
              }`}
            >
              Architectural Doors
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors relative py-1 ${
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

        {/* Header Right Actions (Admin Portal + Customer Access Status Button) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Admin Login Button */}
          <Link
            to="/admin/login"
            className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              isTransparent
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-[#6B6862] hover:text-[#1A1A1A] hover:bg-[#E8E2D5]/40'
            }`}
            title="Admin Portal"
          >
            <UserCheck size={14} />
            <span>Admin</span>
          </Link>

          {status === 'active' ? (
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium tracking-wide transition-all cursor-pointer ${
                isTransparent
                  ? 'bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-md shadow-sm'
                  : 'bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] shadow-sm hover:shadow-md'
              }`}
            >
              <Lock size={13} className="text-[#C5A880]" />
              <span>Request Full Access</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-md transition-colors cursor-pointer ${
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
          className={`md:hidden border-t px-4 pt-3 pb-5 space-y-2 animate-fadeIn ${
            isTransparent
              ? 'bg-[#14120E]/95 backdrop-blur-xl border-white/15 text-white shadow-2xl'
              : 'bg-[#FAF9F5] border-[#E8E2D5] text-[#1A1A1A]'
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

          {/* Admin Login Link in Mobile Menu */}
          <Link
            to="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
              isTransparent
                ? 'text-white/80 hover:bg-white/10'
                : 'text-[#4A4742] hover:bg-[#E8E2D5]/30'
            }`}
          >
            <UserCheck size={16} />
            <span>Admin Portal</span>
          </Link>

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
                  <span>Request Full Catalogue Access</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
