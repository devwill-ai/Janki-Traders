import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  Search,
  RefreshCw,
  CalendarPlus,
  Eye,
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
      showInbuiltAlert('Extension Failed', err.message || 'Failed to extend access.', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = (customer) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Catalogue Access',
      message: `Are you sure you want to revoke 7-day trade catalogue access for ${customer.name} (${customer.mobile})?`,
      type: 'danger',
      confirmText: 'Revoke Access',
      cancelText: 'Keep Access',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.revokeCustomerAccess(customer._id);
          await fetchCustomers();
        } catch (err) {
          showInbuiltAlert('Action Failed', err.message || 'Failed to revoke access.', 'danger');
        }
      },
    });
  };

  const handleToggleBlock = (customer) => {
    const isBlocked = customer.status === 'blocked';
    const action = isBlocked ? 'Unblock' : 'Block';

    setConfirmDialog({
      isOpen: true,
      title: `${action} Customer`,
      message: isBlocked
        ? `Unblock customer "${customer.name}"? They will regain access to browse and request trade passes.`
        : `Are you sure you want to block "${customer.name}"? Blocked customers cannot request catalogue access or submit enquiries.`,
      type: isBlocked ? 'info' : 'danger',
      confirmText: `${action} Customer`,
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        try {
          await api.toggleBlockCustomer(customer._id);
          await fetchCustomers();
        } catch (err) {
          showInbuiltAlert('Action Failed', err.message || 'Failed to toggle block status.', 'danger');
        }
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
            Customer Management
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
            View customer identities, monitor 7-day catalogue passes, extend or revoke access per Section 12.
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-[#E8E2D5] p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          {['all', 'active', 'pending', 'expired', 'rejected', 'blocked'].map((st) => (
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
            placeholder="Search name or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
          />
        </form>
      </div>

      {/* Adaptive Data Presentation: Mobile Customer Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5]">
            <div className="w-6 h-6 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer data...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-stone-400 bg-white rounded-xl border border-[#E8E2D5] text-xs">
            No customers found matching criteria.
          </div>
        ) : (
          customers.map((cust) => (
            <div
              key={cust._id}
              className="bg-white rounded-xl border border-[#E8E2D5] p-4 shadow-xs space-y-3 hover:border-[#8C6D46] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A]">
                    {cust.name}
                  </h3>
                  <a
                    href={`tel:${cust.mobile}`}
                    className="inline-block font-mono text-xs text-[#8C6D46] hover:underline mt-0.5"
                  >
                    {cust.mobile}
                  </a>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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
              </div>

              <div className="text-[11px] text-stone-500 space-y-1 pt-1 border-t border-[#F2EFE9]">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-medium text-stone-700">
                    {cust.access_start ? new Date(cust.access_start).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Date:</span>
                  <span className={cust.access_expiry && new Date(cust.access_expiry) < new Date() ? 'text-rose-600 font-semibold' : 'text-emerald-700 font-semibold'}>
                    {cust.access_expiry ? new Date(cust.access_expiry).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              {/* Touch Actions Bar */}
              {cust.status === 'active' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F2EFE9]">
                  <button
                    onClick={() => setViewCustomer(cust)}
                    className="w-full py-2 px-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <Eye size={13} className="shrink-0 text-stone-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setExtendModalCustomer(cust);
                      setExtendDays(7);
                    }}
                    className="w-full py-2 px-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-[#1A1A1A] font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <CalendarPlus size={13} className="shrink-0 text-[#8C6D46]" />
                    <span>Extend</span>
                  </button>

                  <button
                    onClick={() => handleRevoke(cust)}
                    className="w-full py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <span>Revoke</span>
                  </button>

                  <button
                    onClick={() => handleToggleBlock(cust)}
                    className="w-full py-2 px-2.5 rounded-lg bg-stone-50 hover:bg-rose-50 hover:text-rose-700 border border-stone-300 hover:border-rose-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <span>Block</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F2EFE9]">
                  <button
                    onClick={() => setViewCustomer(cust)}
                    className="w-full py-2 px-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <Eye size={13} className="shrink-0 text-stone-500" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      setExtendModalCustomer(cust);
                      setExtendDays(7);
                    }}
                    className="w-full py-2 px-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-[#1A1A1A] font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors"
                  >
                    <CalendarPlus size={13} className="shrink-0 text-[#8C6D46]" />
                    <span>Extend</span>
                  </button>

                  <button
                    onClick={() => handleToggleBlock(cust)}
                    className={`w-full py-2 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer transition-colors ${
                      cust.status === 'blocked'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                    }`}
                  >
                    <span>{cust.status === 'blocked' ? 'Unblock' : 'Block'}</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (hidden on mobile, visible md:block) */}
      <div className="hidden md:block bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
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
                      <a href={`tel:${cust.mobile}`} className="hover:text-[#8C6D46]">
                        {cust.mobile}
                      </a>
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
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="px-2 py-1 rounded-md hover:bg-stone-100 text-stone-600 text-xs font-medium cursor-pointer"
                          title="View Customer Details"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setExtendModalCustomer(cust);
                            setExtendDays(7);
                          }}
                          className="px-2.5 py-1 rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-[#1A1A1A] font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Extend Access"
                        >
                          <CalendarPlus size={13} className="text-[#8C6D46]" />
                          <span>Extend</span>
                        </button>

                        {cust.status === 'active' && (
                          <button
                            onClick={() => handleRevoke(cust)}
                            className="px-2 py-1 rounded-md hover:bg-rose-50 text-rose-700 text-[11px] font-semibold cursor-pointer"
                            title="Revoke Access"
                          >
                            Revoke
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleBlock(cust)}
                          className={`px-2.5 py-1 rounded-md border text-xs font-semibold cursor-pointer transition-colors ${
                            cust.status === 'blocked'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                          }`}
                          title={cust.status === 'blocked' ? 'Unblock Customer' : 'Block Customer'}
                        >
                          {cust.status === 'blocked' ? 'Unblock' : 'Block'}
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

      {/* Extend Access Modal (Responsive Sheet on Mobile, Dialog on Desktop) */}
      {extendModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#E8E2D5] max-w-sm w-full p-5 sm:p-6 space-y-4 shadow-xl safe-pb">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[clamp(1.1rem,3.5vw,1.3rem)] font-semibold text-[#1A1A1A]">
                Extend Customer Access
              </h3>
              <button
                onClick={() => setExtendModalCustomer(null)}
                className="p-1 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
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
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
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
                  className="flex-1 py-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-xs font-semibold text-stone-600 cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                >
                  {actionLoading ? 'Extending...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-2xl sm:rounded-xl border border-[#E8E2D5] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-xl safe-pb">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[clamp(1.1rem,3.5vw,1.3rem)] font-semibold text-[#1A1A1A]">
                Customer Record
              </h3>
              <button
                onClick={() => setViewCustomer(null)}
                className="p-1 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#1A1A1A]">
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Name:</span>
                  <span className="font-semibold">{viewCustomer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Mobile Number:</span>
                  <a href={`tel:${viewCustomer.mobile}`} className="font-mono font-semibold text-[#8C6D46]">
                    {viewCustomer.mobile}
                  </a>
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
                className="w-full py-2.5 rounded-lg bg-[#1A1A1A] text-white text-xs font-semibold cursor-pointer active:scale-95"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

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
