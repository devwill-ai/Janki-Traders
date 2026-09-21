import { useState, useEffect, useRef } from 'react';
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
  MoreHorizontal,
  X,
} from 'lucide-react';

export const AdminLayout = () => {
  const { isAuthenticated, adminUser, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
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

  const currentNavItem = navLinks.find((item) => isActive(item.path)) || { label: 'Admin Panel' };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#E8E2D5] flex-col justify-between shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#E8E2D5]">
            <div className="flex items-center gap-3">
              <img
                src="/logo-crest.webp"
                alt="Janki Traders Crest Logo"
                className="w-10 h-10 object-contain drop-shadow-xs"
              />
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
              className="p-1.5 rounded-md text-stone-500 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
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

      {/* Mobile Sticky Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2D5] px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-crest.webp"
            alt="Janki Traders Crest"
            className="w-8 h-8 object-contain drop-shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-base font-semibold text-[#1A1A1A] leading-tight">
                Janki Traders
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#8C6D46] border border-[#E8E2D5]">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-none mt-0.5 font-medium">
              {currentNavItem.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            target="_blank"
            className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[#1A1A1A] hover:text-[#8C6D46] transition-colors"
            title="View Public Storefront"
          >
            <ExternalLink size={15} />
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-stone-500 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main ref={mainContentRef} className="flex-1 overflow-y-auto min-h-screen pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E2D5] px-2 py-1 safe-pb shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-5 items-center max-w-md mx-auto">
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
                <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-[58px] text-center">
                  {item.label.split(' ')[0]}
                </span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-0.5" />}
              </Link>
            );
          })}

          {/* More Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`w-full flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all ${
              isMoreActive || moreOpen ? 'text-[#8C6D46] font-semibold scale-105' : 'text-[#6B6862]'
            }`}
          >
            {moreOpen ? <X size={19} strokeWidth={2.4} /> : <MoreHorizontal size={19} strokeWidth={isMoreActive ? 2.4 : 1.8} />}
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight">More</span>
            {isMoreActive && !moreOpen && <span className="w-1.5 h-1.5 rounded-full bg-[#8C6D46] mt-0.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-up Bottom Sheet for "More" Navigation */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-fadeIn">
          {/* Backdrop Touch Closes Sheet */}
          <div className="flex-1" onClick={() => setMoreOpen(false)} />

          {/* Sheet Modal Container */}
          <div className="bg-white rounded-t-2xl border-t border-[#E8E2D5] p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto safe-pb animate-slideUp">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#8C6D46]" />
                <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">
                  More Admin Sections
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
                title="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Links Grid */}
            <div className="grid grid-cols-1 gap-2">
              {moreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all border active:scale-[0.99] cursor-pointer ${
                      active
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                        : 'bg-[#FAF9F5] text-[#33312E] border-[#E8E2D5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={active ? 'text-[#C5A880]' : 'text-[#8C6D46]'} />
                      <span>{item.label}</span>
                    </div>
                    {active && <span className="text-[10px] font-mono text-[#C5A880]">Active</span>}
                  </Link>
                );
              })}
            </div>

            {/* Admin Profile & Actions */}
            <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">
                    {adminUser?.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-stone-500 uppercase font-mono">
                    {adminUser?.email || ''}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 uppercase">
                  {adminUser?.role || 'Admin'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setMoreOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-white border border-[#E8E2D5] text-[#1A1A1A] text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Public Store</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    handleLogout();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
