import React, { useEffect } from 'react';
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
} from 'lucide-react';

export const AdminLayout = () => {
  const { isAuthenticated, adminUser, logout } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-[#E8E2D5] flex flex-col justify-between shrink-0">
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
              const active = location.pathname === item.path;

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
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
