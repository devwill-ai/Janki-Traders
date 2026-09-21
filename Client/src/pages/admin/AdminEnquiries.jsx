import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
} from 'lucide-react';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Inbuilt Confirm / Alert Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
  });

  const showInbuiltAlert = (title, message, type = 'warning') => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'OK',
      cancelText: null,
      onConfirm: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.getAdminEnquiries(params);
      if (res.success) {
        setEnquiries(res.data);
      }
    } catch (err) {
      console.warn('Error loading enquiries:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleStatusChange = async (enquiryId, newStatus) => {
    try {
      setUpdatingId(enquiryId);
      await api.updateEnquiryStatus(enquiryId, newStatus);
      await fetchEnquiries();
    } catch (err) {
      showInbuiltAlert('Status Update Error', err.message || 'Failed to update enquiry status.', 'danger');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
            Product Enquiries Desk
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
            Monitor customer enquiries, update follow-up progress, and initiate WhatsApp chats per Section 15.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {['all', 'new', 'contacted', 'converted', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-[#FAF9F5] text-[#6B6862] hover:bg-[#E8E2D5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search customer, mobile, door..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          />
        </form>
      </div>

      {/* Adaptive Data Presentation: Mobile Enquiry Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5]">
            <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading enquiries...
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5] text-xs">
            No enquiries recorded matching this filter.
          </div>
        ) : (
          enquiries.map((enq) => {
            const img = getImageUrl(enq.product_image || enq.product_id?.images?.[0]);
            const cleanCustMobile = enq.customer_mobile?.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/${cleanCustMobile}?text=${encodeURIComponent(
              `Hello ${enq.customer_name}, this is Janki Traders regarding your enquiry for "${enq.product_name}". How can we assist with your requirements?`
            )}`;

            return (
              <div
                key={enq._id}
                className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-xs space-y-3 hover:border-[#8C6D46] transition-colors"
              >
                {/* Customer and Status Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1A1A1A]">
                      {enq.customer_name}
                    </h3>
                    <a
                      href={`tel:${enq.customer_mobile}`}
                      className="inline-block font-mono text-xs text-[#8C6D46] hover:underline mt-0.5"
                    >
                      {enq.customer_mobile}
                    </a>
                  </div>

                  <select
                    value={enq.status}
                    disabled={updatingId === enq._id}
                    onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                    className="px-2.5 py-1 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Enquired Door Info */}
                <div className="flex items-center gap-3 p-2.5 bg-[#FAF9F5] rounded-lg border border-[#E8E2D5]">
                  <img
                    src={img}
                    alt={enq.product_name}
                    className="w-12 h-14 rounded-md object-cover border border-[#E8E2D5] shrink-0 bg-white"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#8C6D46] font-semibold uppercase">
                      Code: {enq.product_code || 'N/A'}
                    </span>
                    <h4 className="font-serif font-semibold text-xs text-[#1A1A1A] truncate">
                      {enq.product_name}
                    </h4>
                    <span className="text-[10px] text-stone-500 block">
                      Enquired on {new Date(enq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Message Quote */}
                {enq.message && (
                  <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 italic leading-relaxed">
                    "{enq.message}"
                  </p>
                )}

                {/* Direct Mobile Contact Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#F2EFE9]">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href={`tel:${enq.customer_mobile}`}
                    className="py-2 px-3.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] active:bg-[#ded9cc] border border-[#E8E2D5] text-[#1A1A1A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    title="Call Customer"
                  >
                    <Phone size={14} className="text-[#8C6D46]" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (hidden on mobile, visible md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E8E2D5] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Enquired Door</th>
                <th className="py-3.5 px-6">Enquiry Date</th>
                <th className="py-3.5 px-6">Message / Requirements</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading enquiries...
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No enquiries recorded matching this filter.
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => {
                  const img = getImageUrl(enq.product_image || enq.product_id?.images?.[0]);

                  const cleanCustMobile = enq.customer_mobile?.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanCustMobile}?text=${encodeURIComponent(
                    `Hello ${enq.customer_name}, this is Janki Traders regarding your enquiry for "${enq.product_name}". How can we assist with your requirements?`
                  )}`;

                  return (
                    <tr key={enq._id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#1A1A1A]">{enq.customer_name}</div>
                        <a href={`tel:${enq.customer_mobile}`} className="font-mono text-stone-500 text-[11px] hover:text-[#8C6D46]">
                          {enq.customer_mobile}
                        </a>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={img}
                            alt={enq.product_name}
                            className="w-10 h-10 rounded object-cover border border-[#E8E2D5] shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-[#1A1A1A] block">{enq.product_name}</span>
                            <span className="text-[10px] font-mono text-[#8C6D46] uppercase font-medium">
                              Code: {enq.product_code || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-stone-600">
                        {new Date(enq.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-6 text-stone-600 max-w-xs truncate" title={enq.message}>
                        {enq.message}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={enq.status}
                          disabled={updatingId === enq._id}
                          onChange={(e) => handleStatusChange(enq._id, e.target.value)}
                          className="px-2 py-1 bg-[#FAF9F5] border border-[#E8E2D5] rounded text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                          <a
                            href={`tel:${enq.customer_mobile}`}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600"
                            title="Call Customer"
                          >
                            <Phone size={15} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inbuilt Confirm / Alert Dialog */}
      <ConfirmModal
        {...confirmDialog}
        onCancel={() => {
          if (confirmDialog.onCancel) confirmDialog.onCancel();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
};
