import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Users,
  Search,
  RefreshCw,
  Plus,
  ShieldBan,
  ShieldCheck,
  CalendarPlus,
  XCircle,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [extendModalCustomer, setExtendModalCustomer] = useState(null);
  const [extendDays, setExtendDays] = useState(7);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.getCustomers(params);
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.warn('Failed to load customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!extendModalCustomer) return;

    try {
      setActionLoading(true);
      await api.extendCustomerAccess(extendModalCustomer._id, { days: Number(extendDays) });
      setExtendModalCustomer(null);
      await fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to extend access.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (customer) => {
    if (!window.confirm(`Revoke catalogue access for ${customer.name}?`)) return;

    try {
      await api.revokeCustomerAccess(customer._id);
      await fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to revoke access.');
    }
  };

  const handleToggleBlock = async (customer) => {
    const action = customer.status === 'blocked' ? 'Unblock' : 'Block';
    if (!window.confirm(`${action} customer ${customer.name}?`)) return;

    try {
      await api.toggleBlockCustomer(customer._id);
      await fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to toggle block status.');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A]">
            Customer Management
          </h1>
          <p className="text-xs text-[#6B6862] mt-0.5">
            View customer identities, monitor 7-day catalogue passes, extend or revoke access per Section 12.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start sm:self-auto px-4 py-2 rounded-md bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'active', 'pending', 'expired', 'rejected', 'blocked'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
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
            placeholder="Search name or mobile..."
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
                <th className="py-3.5 px-6">Name</th>
                <th className="py-3.5 px-6">Mobile Number</th>
                <th className="py-3.5 px-6">Access Status</th>
                <th className="py-3.5 px-6">Access Start</th>
                <th className="py-3.5 px-6">Access Expiry</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE9] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading customer data...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No customers found matching the criteria.
                  </td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                      {cust.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-stone-600">
                      {cust.mobile}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          cust.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cust.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : cust.status === 'expired'
                            ? 'bg-rose-100 text-rose-800'
                            : cust.status === 'blocked'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-600">
                      {cust.access_start ? new Date(cust.access_start).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-4 px-6 text-stone-600">
                      {cust.access_expiry ? (
                        <span className={new Date(cust.access_expiry) < new Date() ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-medium'}>
                          {new Date(cust.access_expiry).toLocaleDateString()}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600"
                          title="View Customer Details"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => {
                            setExtendModalCustomer(cust);
                            setExtendDays(7);
                          }}
                          className="px-2.5 py-1 rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-[#1A1A1A] font-semibold text-[11px] flex items-center gap-1"
                          title="Extend Access"
                        >
                          <CalendarPlus size={13} className="text-[#8C6D46]" />
                          <span>Extend</span>
                        </button>

                        {cust.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(cust)}
                            className="px-2 py-1 rounded-md hover:bg-rose-50 text-rose-700 text-[11px] font-semibold"
                            title="Revoke Access"
                          >
                            Revoke
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleBlock(cust)}
                          className={`p-1.5 rounded-md ${
                            cust.status === 'blocked'
                              ? 'text-emerald-700 hover:bg-emerald-50'
                              : 'text-stone-400 hover:text-purple-700 hover:bg-purple-50'
                          }`}
                          title={cust.status === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {cust.status === 'blocked' ? <ShieldCheck size={15} /> : <ShieldBan size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extend Access Modal */}
      {extendModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E8E2D5] max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                Extend Customer Access
              </h3>
              <button
                onClick={() => setExtendModalCustomer(null)}
                className="text-stone-400 hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Grant additional catalogue browsing days to <span className="font-semibold text-[#1A1A1A]">{extendModalCustomer.name}</span> ({extendModalCustomer.mobile}).
            </p>

            <form onSubmit={handleExtendSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Additional Days
                </label>
                <select
                  value={extendDays}
                  onChange={(e) => setExtendDays(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                >
                  <option value={7}>+7 Days (Standard Week Extension)</option>
                  <option value={14}>+14 Days (Two Weeks)</option>
                  <option value={30}>+30 Days (One Month)</option>
                  <option value={60}>+60 Days (Two Months)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendModalCustomer(null)}
                  className="flex-1 py-2 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-xs font-semibold text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  {actionLoading ? 'Extending...' : 'Confirm Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E8E2D5] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                Customer Record
              </h3>
              <button
                onClick={() => setViewCustomer(null)}
                className="text-stone-400 hover:text-[#1A1A1A]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#1A1A1A]">
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer ID:</span>
                  <span className="font-mono">{viewCustomer._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Name:</span>
                  <span className="font-semibold">{viewCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mobile Number:</span>
                  <span className="font-mono font-semibold">{viewCustomer.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Computed Status:</span>
                  <span className="font-semibold uppercase text-[#8C6D46]">{viewCustomer.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Access Expiry:</span>
                  <span>{viewCustomer.access_expiry ? new Date(viewCustomer.access_expiry).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Created At:</span>
                  <span>{new Date(viewCustomer.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewCustomer(null)}
                className="w-full py-2.5 rounded-md bg-[#1A1A1A] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
