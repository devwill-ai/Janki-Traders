import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  KeyRound,
  Users,
  ShoppingBag,
  Layers,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  ShieldAlert,
  MoreHorizontal,
  X,
} from 'lucide-react';

export const AdminLayout = () => {
  const { isAuthenticated, adminUser, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Close "More" menu + scroll to top on route change
  useEffect(() => {
    setMoreOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Close "More" menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Access Requests', path: '/admin/access-requests', icon: KeyRound },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Enquiries', path: '/admin/enquiries', icon: MessageSquare },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Bottom bar: show first 4 items + "More" for the rest
  const bottomNavItems = navLinks.slice(0, 4);
  const moreNavItems = navLinks.slice(4);

  const isActive = (path) => location.pathname === path;
  const isMoreActive = moreNavItems.some((item) => isActive(item.path));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E8E2D5] flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E8E2D5]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#1A1A1A] text-white font-serif font-bold text-lg flex items-center justify-center">
                JT
              </div>
              <div>
                <span className="font-serif text-xl font-semibold text-[#1A1A1A] block leading-none">
                  Janki Traders
                </span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#8C6D46] block mt-1">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-[#4A4742] hover:bg-[#FAF9F5] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-[#C5A880]' : 'text-stone-400'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E8E2D5] space-y-3 bg-[#FAF9F5]">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-[#1A1A1A] truncate max-w-[120px]">
                {adminUser?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-stone-500 uppercase tracking-wider">
                {adminUser?.role || 'Superadmin'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md text-stone-500 hover:text-red-600 hover:bg-white transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-md bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>View Public Store</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto min-h-screen pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8E2D5] px-2 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto" ref={moreRef}>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all ${
                  active ? 'text-[#8C6D46] font-semibold scale-105' : 'text-[#6B6862]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[10px] mt-0.5 tracking-tight leading-tight">{item.label.split(' ')[0]}</span>
                {active && <span className="w-1 h-1 rounded-full bg-[#8C6D46] mt-0.5" />}
              </Link>
            );
          })}

          {/* More Button */}
          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all ${
                isMoreActive || moreOpen ? 'text-[#8C6D46] font-semibold scale-105' : 'text-[#6B6862]'
              }`}
            >
              {moreOpen ? <X size={20} strokeWidth={2} /> : <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.3 : 1.8} />}
              <span className="text-[10px] mt-0.5 tracking-tight leading-tight">More</span>
              {isMoreActive && !moreOpen && <span className="w-1 h-1 rounded-full bg-[#8C6D46] mt-0.5" />}
            </button>

            {/* More Popup Menu */}
            {moreOpen && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl border border-[#E8E2D5] shadow-lg overflow-hidden">
                {moreNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-wide transition-all border-b border-[#F2EFE9] last:border-0 ${
                        active
                          ? 'bg-[#1A1A1A] text-white'
                          : 'text-[#4A4742] hover:bg-[#FAF9F5]'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-[#C5A880]' : 'text-stone-400'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {/* Divider + Quick Actions */}
                <div className="border-t border-[#E8E2D5]">
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-[#6B6862] hover:bg-[#FAF9F5] transition-all"
                  >
                    <ExternalLink size={15} className="text-stone-400" />
                    <span>View Store</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-red-500 hover:bg-red-50 transition-all"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
