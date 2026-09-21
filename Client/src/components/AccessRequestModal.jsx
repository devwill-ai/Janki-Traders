import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import {
  X,
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  User,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AccessRequestModal = () => {
  const {
    isAccessModalOpen,
    closeAccessModal,
    requestAccess,
    checkAccess,
    status,
    daysRemaining,
    hoursRemaining,
    customer,
  } = useCustomer();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [viewMode, setViewMode] = useState('form'); // 'form' | 'status'

  if (!isAccessModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!mobile.trim() || mobile.replace(/[^0-9]/g, '').length < 10) {
      setFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const result = await requestAccess({ name, mobile });
    setIsSubmitting(false);

    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message,
      });
      setViewMode('status');
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

  const handleStatusRefresh = async () => {
    setIsSubmitting(true);
    await checkAccess();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E8E2D5] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#1A1A1A] text-[#FAF9F5] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#8C6D46] flex items-center justify-center text-white">
              <Lock size={16} />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold leading-tight text-white">
                Unlock Catalogue Access
              </h3>
              <p className="text-[11px] text-[#C5A880] tracking-wider uppercase font-sans">
                Instant Unlock for Registered Users • 7-Day Access
              </p>
            </div>
          </div>
          <button
            onClick={closeAccessModal}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Active Status Display */}
          {status === 'active' ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF5EE] text-[#2E7D32] flex items-center justify-center mx-auto border-2 border-[#A7D7B5] shadow-xs">
                <Unlock size={32} />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                  Access Active & Verified
                </h4>
                <p className="text-sm text-[#6B6862] mt-1 font-light">
                  You have full access to explore both public and restricted door models.
                </p>
              </div>

              <div className="bg-[#FAF9F5] p-4 rounded-lg border border-[#E8E2D5] text-xs text-[#1A1A1A] space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Registered Name:</span>
                  <span className="font-semibold">{customer?.name || 'Authorized Visitor'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mobile:</span>
                  <span className="font-mono font-semibold">{customer?.mobile}</span>
                </div>
                <div className="flex justify-between text-[#8C6D46] font-semibold border-t border-[#E8E2D5] pt-2">
                  <span>Remaining Time:</span>
                  <span>{daysRemaining > 0 ? `${daysRemaining} Days` : `${hoursRemaining} Hours`}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={closeAccessModal}
                  className="w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#8C6D46] transition-colors"
                >
                  Continue Browsing Catalogue
                </button>
              </div>
            </div>
          ) : status === 'pending' || viewMode === 'status' ? (
            /* Pending Review Display */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF8E7] text-[#8C6D46] flex items-center justify-center mx-auto border-2 border-[#F3DB9F] shadow-xs">
                <Clock size={32} className="animate-spin" />
              </div>
              <div>
                <h4 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                  Request Pending Review
                </h4>
                <p className="text-xs text-[#6B6862] mt-1.5 leading-relaxed">
                  Your request has been received. Our administration will review and activate your 7-day catalogue access.
                </p>
              </div>

              <div className="bg-[#FAF9F5] p-3.5 rounded-lg border border-[#E8E2D5] text-xs space-y-1.5 text-left">
                <p className="text-stone-600 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#8C6D46]" />
                  <span>No OTP verification needed.</span>
                </p>
                <p className="text-stone-600 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#8C6D46]" />
                  <span>Access starts immediately upon admin approval.</span>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleStatusRefresh}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-md bg-[#FAF9F5] border border-[#8C6D46] text-[#8C6D46] text-xs font-semibold hover:bg-[#E8E2D5]/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} className={isSubmitting ? 'animate-spin' : ''} />
                  <span>Refresh Status</span>
                </button>
                <button
                  onClick={closeAccessModal}
                  className="flex-1 py-2.5 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-[#8C6D46] transition-colors"
                >
                  Done
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setViewMode('form')}
                  className="text-xs text-stone-500 hover:text-[#8C6D46] underline"
                >
                  Enter a different name or number
                </button>
              </div>
            </div>
          ) : (
            /* Input Form (Name + Mobile per Section 8.2) */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-[#6B6862] leading-relaxed">
                Enter your mobile number to <span className="font-semibold text-[#1A1A1A]">instantly unlock full access</span> if you have an active approval, or submit details to request 7-day trade access.
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                    feedback.type === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46] transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9825012345"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-stone-500">
                  Approved members regain access instantly without re-approval.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-[#FAF9F5] text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Verifying Access...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Unlock Access</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 bg-[#FAF9F5] border-t border-[#E8E2D5] text-[11px] text-stone-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-[#8C6D46]" />
            <span>Secure 7-Day Catalogue Verification</span>
          </span>
          <button
            onClick={closeAccessModal}
            className="text-[#1A1A1A] hover:text-[#8C6D46] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
