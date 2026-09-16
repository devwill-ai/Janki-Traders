import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { api, getImageUrl } from '../services/api';
import { X, MessageSquare, Phone, User, Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

export const EnquiryModal = ({ isOpen, onClose, product, onEnquirySuccess }) => {
  const { customerName, customerMobile, settings } = useCustomer();

  const [name, setName] = useState(customerName || '');
  const [mobile, setMobile] = useState(customerMobile || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setMessage(`Hello Janki Traders, I am interested in "${product.name}" (Code: ${product.product_code || 'N/A'}). Please share pricing, availability, and lead time.`);
    }
    if (customerName) setName(customerName);
    if (customerMobile) setMobile(customerMobile);
  }, [product, customerName, customerMobile]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError('Please provide both your name and mobile number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitEnquiry({
        name,
        mobile,
        product_id: product._id,
        message,
      });

      if (res.success) {
        setSubmittedData(res);
        if (onEnquirySuccess) onEnquirySuccess(product);
      } else {
        setError(res.message || 'Failed to submit enquiry.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedData(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E8E2D5] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#8C6D46] flex items-center justify-center text-white">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold leading-tight">
                Product Enquiry
              </h3>
              <p className="text-[11px] text-[#C5A880] tracking-wide">
                Direct trade assistance from Janki Traders
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {submittedData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 size={30} />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                  Enquiry Registered!
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  This product is now saved to your <span className="font-semibold text-[#1A1A1A]">Inquired Products</span> dashboard.
                </p>
              </div>

              {submittedData.whatsappUrl && (
                <div className="pt-2">
                  <a
                    href={submittedData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Open WhatsApp Chat Directly</span>
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#1A1A1A] text-xs font-medium hover:bg-[#E8E2D5]/50 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product mini summary */}
              <div className="flex items-center gap-3 p-3 bg-[#FAF9F5] rounded-lg border border-[#E8E2D5]">
                {product.images?.[0] && (
                  <img
                    src={getImageUrl(product.images[0])}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md border border-[#E8E2D5] shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h4 className="font-serif font-semibold text-sm text-[#1A1A1A] truncate">
                    {product.name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#8C6D46] font-semibold">
                    Code: {product.product_code || 'N/A'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Message / Quantity Requirements
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Enquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
