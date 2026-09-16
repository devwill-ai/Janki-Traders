import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  MessageSquare,
  Search,
  RefreshCw,
  MessageCircle,
  Phone,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';

export const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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
      alert(err.message || 'Failed to update enquiry status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
            Product Enquiries Desk
          </h1>
          <p className="text-xs text-[#6B6862] mt-0.5">
            Monitor customer enquiries, update follow-up progress, and initiate WhatsApp chats per Section 15.
          </p>
        </div>

        <button
          onClick={fetchEnquiries}
          className="self-start sm:self-auto px-4 py-2 rounded-md bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'new', 'contacted', 'converted', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-[#FAF9F5] text-[#6B6862] hover:bg-[#E8E2D5]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search customer, mobile, door..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
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
                  const img = enq.product_image || enq.product_id?.images?.[0]
                    ? (enq.product_image || enq.product_id?.images?.[0]).startsWith('/uploads')
                      ? `http://localhost:5000${enq.product_image || enq.product_id?.images?.[0]}`
                      : enq.product_image || enq.product_id?.images?.[0]
                    : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

                  const cleanCustMobile = enq.customer_mobile?.replace(/[^0-9]/g, '');
                  const waUrl = `https://wa.me/${cleanCustMobile}?text=${encodeURIComponent(
                    `Hello ${enq.customer_name}, this is Janki Traders regarding your enquiry for "${enq.product_name}". How can we assist with your requirements?`
                  )}`;

                  return (
                    <tr key={enq._id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#1A1A1A]">{enq.customer_name}</div>
                        <div className="font-mono text-stone-500 text-[11px]">{enq.customer_mobile}</div>
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
    </div>
  );
};
