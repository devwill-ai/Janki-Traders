import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdmin();

  const [email, setEmail] = useState('admin@jankitraders.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // If already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message || 'Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E8E2D5] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white p-8 text-center space-y-3">
          <img
            src="/logo-crest.webp"
            alt="Janki Traders Crest Logo"
            className="w-16 h-16 object-contain mx-auto drop-shadow-md"
          />
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-white">
              Janki Traders Admin
            </h2>
            <p className="text-xs text-[#C5A880] tracking-wider uppercase font-sans mt-0.5">
              Digital Catalogue Control Desk
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jankitraders.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E8E2D5] text-center">
            <Link
              to="/"
              className="text-xs text-stone-500 hover:text-[#8C6D46] transition-colors"
            >
              ← Back to Customer Storefront
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
