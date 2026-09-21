import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import {
  MessageSquare,
  MessageCircle,
  Clock,
  CheckCircle2,
  Phone,
  Search,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

export const InquiredProductsPage = () => {
  const { customerMobile, settings } = useCustomer();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupMobile, setLookupMobile] = useState(customerMobile || '');
  const [isSearching, setIsSearching] = useState(false);

  const fetchEnquiries = async (mobileToQuery) => {
    try {
      setLoading(true);
      const params = {};
      if (mobileToQuery) params.mobile = mobileToQuery;

      const res = await api.getMyEnquiries(params);
      if (res.success) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.warn('Failed to load enquiries:', err.message);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (customerMobile) {
      fetchEnquiries(customerMobile);
    } else {
      setLoading(false);
    }
  }, [customerMobile]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (!lookupMobile.trim()) return;
    setIsSearching(true);
    fetchEnquiries(lookupMobile.trim());
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold flex items-center gap-1">
            <Clock size={12} />
            <span>New / Under Review</span>
          </span>
        );
      case 'contacted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold flex items-center gap-1">
            <Phone size={12} />
            <span>Contacted by Rep</span>
          </span>
        );
      case 'converted':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Order Finalized</span>
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[11px] font-semibold">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px]">
            {status}
          </span>
        );
    }
  };

  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E2D5] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
              Customer Inquiries
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1A1A] tracking-tight">
              My Inquired Products
            </h1>
            <p className="text-sm sm:text-base text-[#6B6862] font-light leading-relaxed">
              Track the door models you've enquired about, review admin response statuses, or continue direct discussions over WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Lookup Bar (if mobile not known or user wants to check a different number) */}
        <div className="bg-white rounded-lg border border-[#E8E2D5] p-4 sm:p-6 mb-8 shadow-xs">
          <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="tel"
                placeholder="Enter your registered mobile number (e.g. 9825012345)..."
                value={lookupMobile}
                onChange={(e) => setLookupMobile(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <Search size={14} />
              <span>{isSearching ? 'Searching...' : 'Find My Inquiries'}</span>
            </button>
          </form>
        </div>

        {/* Inquiries Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-white rounded-lg border border-[#E8E2D5] animate-pulse" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-12 text-center space-y-4 max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center mx-auto">
              <MessageSquare size={24} />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
              No Inquiries Recorded Yet
            </h3>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              When you inquire about any door in our catalogue, it will automatically appear here with live status updates.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-[clamp(11px,2.8vw,12px)] sm:text-xs font-semibold tracking-wider uppercase transition-colors text-center"
              >
                <ShoppingBag size={14} className="shrink-0" />
                <span>Explore Door Catalogue</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-2">
              <span>Showing {enquiries.length} Inquired Items</span>
              <button
                onClick={() => fetchEnquiries(lookupMobile || customerMobile)}
                className="hover:text-[#8C6D46] flex items-center gap-1 font-medium"
              >
                <RefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {enquiries.map((item) => {
                const img = getImageUrl(item.product_image);

                const waText = encodeURIComponent(
                  `Hello Janki Traders, I am following up on my enquiry for "${item.product_name}" (Code: ${item.product_code || 'N/A'}).`
                );
                const waUrl = `https://wa.me/${cleanWhatsapp}?text=${waText}`;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-[#E8E2D5] p-5 shadow-xs hover:border-[#8C6D46]/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                  >
                    {/* Left: Product Thumbnail & Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-[#FAF9F5] border border-[#E8E2D5] shrink-0">
                        <img
                          src={img}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-semibold tracking-wider text-[#8C6D46] px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E8E2D5]">
                            {item.product_code || 'JT-CUSTOM'}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                              Qty: {item.quantity}
                            </span>
                          )}
                          {item.bulk_id && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#8C6D46]/10 text-[#8C6D46] border border-[#8C6D46]/20">
                              Bulk Enquiry
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#1A1A1A] truncate">
                          {item.product_name}
                        </h4>
                        <div className="text-[11px] text-stone-500">
                          Enquiry Date: {new Date(item.enquiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status badge & WhatsApp Follow-up action */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2EFE9]">
                      <div>{getStatusBadge(item.status)}</div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/shop/${item.product_id}`}
                          className="px-3 py-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5] text-[#1A1A1A] text-xs font-semibold border border-[#E8E2D5] transition-colors"
                        >
                          View Door
                        </Link>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp Follow-up</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
