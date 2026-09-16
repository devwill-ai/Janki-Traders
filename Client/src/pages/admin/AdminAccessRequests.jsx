import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
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
      alert(err.message || 'Error approving request.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Optional rejection reason / notes:', 'Requirements not matching trade criteria');
    if (reason === null) return; // User cancelled

    try {
      setActionLoading(id);
      await api.rejectAccessRequest(id, { reason });
      await fetchRequests();
    } catch (err) {
      alert(err.message || 'Error rejecting request.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
            Catalogue Access Requests
          </h1>
          <p className="text-xs text-[#6B6862] mt-0.5">
            Manage customer 7-day trade catalogue access requests per Section 11.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="self-start sm:self-auto px-4 py-2 rounded-md bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'pending', 'approved', 'rejected', 'expired'].map((st) => (
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

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          />
        </form>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
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
                        {custMobile}
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
                              onClick={() => handleReject(req._id)}
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
    </div>
  );
};
