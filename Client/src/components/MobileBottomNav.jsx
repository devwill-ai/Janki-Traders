import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MessageSquareText, Phone } from 'lucide-react';

export const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: ShoppingBag },
    { label: 'Inquired', path: '/inquired', icon: MessageSquareText },
    { label: 'Contact', path: '/contact', icon: Phone },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E8E2D5] px-2 h-16 shadow-lg flex items-center justify-center">
      <div className="grid grid-cols-4 items-center w-full max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all ${
                active ? 'text-[#8C6D46] font-semibold scale-105' : 'text-[#6B6862] hover:text-[#1A1A1A]'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-[#8C6D46] mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
