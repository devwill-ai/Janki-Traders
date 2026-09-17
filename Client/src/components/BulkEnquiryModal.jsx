import React, { useState, useEffect } from 'react';
import { useCustomer } from '../context/CustomerContext';
import { useBulkEnquiry } from '../context/BulkEnquiryContext';
import { api, getImageUrl } from '../services/api';
import {
  X,
  Layers,
  Phone,
  User,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BulkEnquiryModal = () => {
  const { customerName, customerMobile, refreshEnquiries } = useCustomer();
  const {
    items,
    isBulkModalOpen,
    closeBulkModal,
    removeFromBulk,
    updateQuantity,
    clearBulk,
    distinctCount,
    totalQuantity,
  } = useBulkEnquiry();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerName) setName(customerName);
    if (customerMobile) setMobile(customerMobile);
  }, [customerName, customerMobile, isBulkModalOpen]);

  if (!isBulkModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setError('Please provide your name and mobile number.');
      return;
    }

    if (items.length === 0) {
      setError('Your enquiry list is empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        mobile: mobile.trim(),
        items: items.map((it) => ({
          product_id: it.product._id,
          quantity: it.quantity || 1,
          notes: it.notes || '',
        })),
        message: notes.trim() || undefined,
      };

      const res = await api.submitEnquiry(payload);

      if (res.success) {
        setSubmittedData(res);
        clearBulk();
        if (refreshEnquiries) refreshEnquiries();
      } else {
        setError(res.message || 'Failed to submit bulk enquiry.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedData(null);
    setError(null);
    closeBulkModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E8E2D5] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1A1A1A] text-white px-[clamp(14px,3.5vw,24px)] py-[clamp(12px,2.5vw,16px)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-[clamp(8px,2.5vw,12px)] min-w-0">
            <div className="w-[clamp(30px,7.5vw,36px)] h-[clamp(30px,7.5vw,36px)] rounded-lg bg-[#8C6D46] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Layers className="w-[clamp(15px,4vw,18px)] h-[clamp(15px,4vw,18px)]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-[clamp(16px,4.2vw,20px)] font-semibold leading-tight flex items-center gap-2 flex-wrap">
                <span>Bulk Door Enquiry</span>
                {distinctCount > 0 && (
                  <span className="text-[clamp(9.5px,2.4vw,11px)] font-sans font-medium px-2 py-0.5 rounded-full bg-[#8C6D46]/40 text-[#FAF9F5] border border-[#C5A880]/30 whitespace-nowrap">
                    {distinctCount} {distinctCount === 1 ? 'model' : 'models'}
                  </span>
                )}
              </h3>
              <p className="text-[clamp(10px,2.5vw,11.5px)] text-[#C5A880] tracking-wide truncate">
                Consolidated enquiry with single WhatsApp transmission
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
            {items.length > 0 && !submittedData && (
              <button
                type="button"
                onClick={clearBulk}
                className="text-[clamp(10.5px,2.5vw,12px)] text-stone-400 hover:text-rose-400 transition-colors px-1.5 py-1"
                title="Clear all selected doors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-[clamp(16px,4.5vw,20px)] h-[clamp(16px,4.5vw,20px)]" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-[clamp(14px,3.5vw,24px)] overflow-y-auto flex-1">
          {submittedData ? (
            /* Success View */
            <div className="text-center py-6 space-y-4">
              <div className="w-[clamp(48px,12vw,64px)] h-[clamp(48px,12vw,64px)] rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-sm">
                <CheckCircle2 className="w-[clamp(26px,6vw,34px)] h-[clamp(26px,6vw,34px)]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-[clamp(18px,4.5vw,24px)] font-semibold text-[#1A1A1A]">
                  Bulk Enquiry Submitted!
                </h4>
                <p className="text-[clamp(11.5px,2.8vw,13.5px)] text-stone-600 max-w-md mx-auto leading-relaxed">
                  Your enquiry has been registered in our database. All selected door models are now tracked under your{' '}
                  <Link to="/inquired" onClick={handleClose} className="font-semibold text-[#8C6D46] underline">
                    Inquired Products
                  </Link>{' '}
                  history.
                </p>
              </div>

              {submittedData.whatsappUrl && (
                <div className="pt-2 max-w-md mx-auto space-y-2">
                  <a
                    href={submittedData.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-[clamp(12px,2.8vw,13.5px)] font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.01]"
                  >
                    <MessageCircle size={17} />
                    <span>Send via WhatsApp with 1-Click</span>
                  </a>
                  <p className="text-[clamp(10px,2.4vw,11px)] text-stone-500">
                    Includes formatted list of door models, quantities, and reference codes.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-[#E8E2D5] flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-md bg-[#1A1A1A] text-white text-[clamp(11px,2.6vw,12px)] font-semibold hover:bg-[#8C6D46] transition-colors cursor-pointer"
                >
                  Return to Catalogue
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="text-center py-10 sm:py-12 space-y-3 sm:space-y-4">
              <div className="w-[clamp(44px,11vw,56px)] h-[clamp(44px,11vw,56px)] rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#8C6D46] flex items-center justify-center mx-auto">
                <Layers className="w-[clamp(20px,5vw,26px)] h-[clamp(20px,5vw,26px)]" />
              </div>
              <div>
                <h4 className="font-serif text-[clamp(17px,4vw,21px)] font-semibold text-[#1A1A1A]">
                  Enquiry List is Empty
                </h4>
                <p className="text-[clamp(11px,2.7vw,12.5px)] text-[#6B6862] max-w-sm mx-auto mt-1.5 leading-relaxed">
                  You haven't selected any doors yet. Click <span className="font-semibold text-[#1A1A1A]">+ Bulk</span> on any door model in our catalogue to create a multi-item enquiry.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/shop"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-[clamp(11px,2.6vw,12.5px)] font-semibold transition-colors"
                >
                  <span>Explore Door Catalogue</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            /* Main Form with Items & Details */
            <form onSubmit={handleSubmit} className="space-y-[clamp(14px,3vw,20px)]">
              {error && (
                <div className="p-3 rounded-md text-[clamp(11px,2.6vw,12px)] flex items-start gap-2 bg-red-50 text-red-700 border border-red-200">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#F2EFE9]">
                  <span className="text-[clamp(10.5px,2.6vw,12px)] font-semibold text-[#1A1A1A] uppercase tracking-wider">
                    Selected Door Models ({distinctCount})
                  </span>
                  <span className="text-[clamp(10px,2.4vw,11.5px)] text-stone-500">
                    Total: <strong className="text-[#1A1A1A]">{totalQuantity}</strong> units
                  </span>
                </div>

                <div className="space-y-2 max-h-56 sm:max-h-64 overflow-y-auto pr-1">
                  {items.map((it) => {
                    const imgUrl = getImageUrl(it.product.images?.[0]);
                    return (
                      <div
                        key={it.product._id}
                        className="flex items-center gap-[clamp(8px,2.2vw,12px)] p-[clamp(8px,2.2vw,12px)] rounded-lg border border-[#E8E2D5] bg-[#FAF9F5] hover:bg-white transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-[clamp(44px,12vw,56px)] h-[clamp(52px,14vw,64px)] rounded overflow-hidden bg-stone-200 shrink-0 border border-[#E8E2D5]">
                          <img
                            src={imgUrl}
                            alt={it.product.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[clamp(12px,3vw,14px)] font-serif font-semibold text-[#1A1A1A] truncate">
                            {it.product.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {it.product.product_code && (
                              <span className="text-[clamp(9px,2.2vw,10.5px)] font-mono font-medium px-1.5 py-0.2 rounded bg-white text-[#8C6D46] border border-[#E8E2D5]">
                                {it.product.product_code}
                              </span>
                            )}
                            {it.product.category_id?.name && (
                              <span className="text-[clamp(9px,2.2vw,10.5px)] text-stone-500 uppercase tracking-wide truncate max-w-[110px] sm:max-w-none">
                                {it.product.category_id.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1 shrink-0 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md border border-[#E8E2D5]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(it.product._id, (it.quantity || 1) - 1)}
                            disabled={(it.quantity || 1) <= 1}
                            className="w-[clamp(18px,4.5vw,22px)] h-[clamp(18px,4.5vw,22px)] flex items-center justify-center text-stone-500 hover:text-[#1A1A1A] disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="w-[clamp(10px,2.5vw,12px)] h-[clamp(10px,2.5vw,12px)]" />
                          </button>
                          <span className="text-[clamp(11px,2.8vw,12.5px)] font-semibold w-4 sm:w-5 text-center text-[#1A1A1A]">
                            {it.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(it.product._id, (it.quantity || 1) + 1)}
                            className="w-[clamp(18px,4.5vw,22px)] h-[clamp(18px,4.5vw,22px)] flex items-center justify-center text-stone-500 hover:text-[#1A1A1A] cursor-pointer"
                          >
                            <Plus className="w-[clamp(10px,2.5vw,12px)] h-[clamp(10px,2.5vw,12px)]" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          type="button"
                          onClick={() => removeFromBulk(it.product._id)}
                          className="p-1 sm:p-2 text-stone-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
                          title="Remove from list"
                        >
                          <Trash2 className="w-[clamp(13px,3.5vw,15px)] h-[clamp(13px,3.5vw,15px)]" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* User Contact Details */}
              <div className="pt-2 border-t border-[#F2EFE9] space-y-3 sm:space-y-4">
                <span className="text-[clamp(10.5px,2.5vw,12px)] font-semibold text-[#1A1A1A] uppercase tracking-wider block">
                  Your Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[clamp(11px,2.5vw,12px)] font-medium text-[#1A1A1A]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-[clamp(12px,2.8vw,13.5px)] text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="block text-[clamp(11px,2.5vw,12px)] font-medium text-[#1A1A1A]">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9825012345"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-[clamp(12px,2.8vw,13.5px)] text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional notes / Project requirements */}
                <div className="space-y-1">
                  <label className="block text-[clamp(11px,2.5vw,12px)] font-medium text-[#1A1A1A]">
                    Project Notes or Specifications <span className="text-stone-400">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need pricing and delivery timeline for 10 flats in Surat..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-[clamp(11.5px,2.7vw,13px)] text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46] resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 sm:py-3 px-4 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] text-[clamp(11px,2.6vw,12px)] font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <MessageCircle size={15} />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Consolidated Enquiry'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="py-2.5 sm:py-3 px-4 rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5] text-[#1A1A1A] text-[clamp(11px,2.6vw,12px)] font-semibold border border-[#E8E2D5] transition-colors cursor-pointer"
                >
                  Continue Selecting
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
