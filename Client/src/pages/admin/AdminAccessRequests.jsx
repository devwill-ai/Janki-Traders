import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const AdminAccessRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(7); // 7 days default

  // Inbuilt Confirm / Alert Dialog State
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showInput: false,
    inputLabel: '',
    defaultValue: '',
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
      showInput: false,
      onConfirm: () => setConfirmDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.getAccessRequests(params);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Failed to load requests:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleApprove = async (id, duration = 7) => {
    try {
      setActionLoading(id);
      await api.approveAccessRequest(id, { durationDays: duration });
      await fetchRequests();
    } catch (err) {
      showInbuiltAlert('Approval Failed', err.message || 'Error approving request.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (id, applicantName = 'Applicant') => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reject Access Request',
      message: `Decline 7-day trade catalogue access for ${applicantName}? You can provide an optional rejection note.`,
      type: 'warning',
      confirmText: 'Reject Request',
      cancelText: 'Cancel',
      showInput: true,
      inputLabel: 'Rejection Reason / Notes',
      defaultValue: 'Requirements not matching trade criteria',
      inputPlaceholder: 'Reason for rejecting this request...',
      onConfirm: async (reason) => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          setActionLoading(id);
          await api.rejectAccessRequest(id, { reason: reason || 'Requirements not matching trade criteria' });
          await fetchRequests();
        } catch (err) {
          showInbuiltAlert('Rejection Failed', err.message || 'Error rejecting request.', 'danger');
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
            Catalogue Access Requests
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
            Manage customer 7-day trade catalogue access requests per Section 11.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-xs">
        {/* Status Pills with smooth mobile swipe */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {['all', 'pending', 'approved', 'rejected', 'expired'].map((st) => (
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

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          />
        </form>
      </div>

      {/* Adaptive Data Presentation: Mobile Request Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5]">
            <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5] text-xs">
            No access requests found matching the filter.
          </div>
        ) : (
          requests.map((req) => {
            const custName = req.customer_id?.name || 'Customer';
            const custMobile = req.customer_id?.mobile || 'N/A';

            return (
              <div
                key={req._id}
                className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-xs space-y-3 hover:border-[#8C6D46] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-[#1A1A1A]">
                      {custName}
                    </h3>
                    <a
                      href={`tel:${custMobile}`}
                      className="inline-block font-mono text-xs text-[#8C6D46] hover:underline mt-0.5"
                    >
                      {custMobile}
                    </a>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      req.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-[11px] text-stone-500 space-y-1 pt-1 border-t border-[#F2EFE9]">
                  <div className="flex justify-between">
                    <span>Requested:</span>
                    <span className="font-medium text-stone-700">
                      {new Date(req.requested_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  {req.status === 'approved' && req.expires_at && (
                    <div className="flex justify-between text-emerald-800 font-medium">
                      <span>Access Expiry:</span>
                      <span>{new Date(req.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-2 border-t border-[#F2EFE9]">
                    <button
                      onClick={() => handleApprove(req._id, 7)}
                      disabled={actionLoading === req._id}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Approve (7 Days)</span>
                    </button>
                    <button
                      onClick={() => handleReject(req._id, req.customer_id?.name || 'Customer')}
                      disabled={actionLoading === req._id}
                      className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-stone-600 font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle size={13} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Requests Table (hidden on mobile, visible md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#E8E2D5] text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Customer Name</th>
                <th className="py-3.5 px-6">Mobile Number</th>
                <th className="py-3.5 px-6">Request Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Access Validity</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No access requests found matching the filter.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const custName = req.customer_id?.name || 'Customer';
                  const custMobile = req.customer_id?.mobile || 'N/A';

                  return (
                    <tr key={req._id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                        {custName}
                      </td>
                      <td className="py-4 px-6 font-mono text-stone-600">
                        <a href={`tel:${custMobile}`} className="hover:text-[#8C6D46]">
                          {custMobile}
                        </a>
                      </td>
                      <td className="py-4 px-6 text-stone-500">
                        {new Date(req.requested_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-stone-600">
                        {req.status === 'approved' && req.expires_at ? (
                          <span>
                            Expires: {new Date(req.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {req.status === 'pending' ? (
                          <div className="inline-flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleApprove(req._id, 7)}
                              disabled={actionLoading === req._id}
                              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                              title="Approve for 7 days"
                            >
                              <CheckCircle2 size={13} />
                              <span>Approve (7d)</span>
                            </button>
                            <button
                              onClick={() => handleReject(req._id, custName)}
                              disabled={actionLoading === req._id}
                              className="px-3 py-1.5 rounded-md bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reject Request"
                            >
                              <XCircle size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : req.status === 'approved' ? (
                          <span className="text-emerald-700 font-medium text-[11px]">
                            Approved & Active
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">
                            Processed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inbuilt Confirm / Prompt Modal */}
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
