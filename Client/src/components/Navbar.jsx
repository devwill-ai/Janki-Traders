import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import {
  Lock,
  Unlock,
  Clock,
  ShoppingBag,
  MessageSquareText,
  Phone,
  Home,
  ShieldAlert,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { status, hasRestrictedAccess, daysRemaining, hoursRemaining, openAccessModal, customerName } = useCustomer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D5] glass-nav transition-all">
      {/* Top micro-bar for quick announcements & admin portal link */}
      <div className="bg-[#1A1A1A] text-[#FAF9F5] text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-pulse"></span>
            <span className="font-light tracking-wider text-stone-300">
              Architectural & Wholesale Doors • Waterproof WPC • Fluted Glass • Teak
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-400">
            <Link
              to="/admin/login"
              className="hover:text-[#C5A880] transition-colors flex items-center gap-1"
            >
              <UserCheck size={12} />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>

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
            <span className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-[#1A1A1A] block leading-none">
              Janki Traders
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-[#8C6D46] block mt-1 font-medium">
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
                  ? 'text-[#8C6D46] font-semibold'
                  : 'text-[#4A4742] hover:text-[#1A1A1A]'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8C6D46] rounded-full animate-fadeIn" />
              )}
            </Link>
          ))}
        </nav>

        {/* Customer Access Status Button */}
        <div className="hidden sm:flex items-center gap-3">
          {status === 'active' ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] border border-[#A7D7B5] text-[#1E5631] text-xs font-medium shadow-xs">
              <Unlock size={14} className="text-[#2E7D32]" />
              <span>
                Full Access Active ({daysRemaining > 0 ? `${daysRemaining}d left` : `${hoursRemaining}h left`})
              </span>
            </div>
          ) : status === 'pending' ? (
            <button
              onClick={openAccessModal}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF8E7] border border-[#F3DB9F] text-[#8C6D46] text-xs font-medium hover:bg-[#FFF3D6] transition-colors"
            >
              <Clock size={14} className="animate-spin text-[#8C6D46]" />
              <span>Approval Pending</span>
            </button>
          ) : status === 'expired' ? (
            <button
              onClick={openAccessModal}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0F0] border border-[#F5C2C2] text-[#B71C1C] text-xs font-semibold hover:bg-[#FFE5E5] transition-all"
            >
              <ShieldAlert size={14} />
              <span>Access Expired • Renew</span>
            </button>
          ) : (
            <button
              onClick={openAccessModal}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] text-xs font-medium tracking-wide shadow-sm transition-all hover:shadow-md cursor-pointer"
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
            className="p-2 text-[#1A1A1A] hover:bg-[#E8E2D5]/50 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8E2D5] bg-[#FAF9F5] px-4 pt-3 pb-5 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'bg-[#E8E2D5]/60 text-[#8C6D46] font-semibold'
                  : 'text-[#4A4742] hover:bg-[#E8E2D5]/30'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-[#E8E2D5]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAccessModal();
              }}
              className="w-full py-2.5 px-4 rounded-md bg-[#1A1A1A] text-[#FAF9F5] text-sm font-medium flex items-center justify-center gap-2"
            >
              {status === 'active' ? (
                <>
                  <Unlock size={16} className="text-[#8C6D46]" />
                  <span>Full Catalogue Unlocked ({daysRemaining}d left)</span>
                </>
              ) : status === 'pending' ? (
                <>
                  <Clock size={16} className="text-[#C5A880]" />
                  <span>Request Pending Admin Review</span>
                </>
              ) : (
                <>
                  <Lock size={16} className="text-[#C5A880]" />
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
