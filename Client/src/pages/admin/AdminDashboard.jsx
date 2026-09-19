import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ConfirmModal } from '../../components/ConfirmModal';
import {
  ShoppingBag,
  Eye,
  Lock,
  Clock,
  Unlock,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

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

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Error loading dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickApprove = async (requestId) => {
    try {
      setActionLoading(requestId);
      await api.approveAccessRequest(requestId, { durationDays: 7 });
      await fetchDashboard();
    } catch (err) {
      showInbuiltAlert('Approval Failed', err.message || 'Failed to approve request.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickReject = async (requestId) => {
    try {
      setActionLoading(requestId);
      await api.rejectAccessRequest(requestId, { reason: 'Declined from dashboard' });
      await fetchDashboard();
    } catch (err) {
      showInbuiltAlert('Rejection Failed', err.message || 'Failed to reject request.', 'danger');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#8C6D46] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 uppercase tracking-wider">Loading Dashboard KPIs...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  const kpiCards = [
    { label: 'Total Products', value: stats.totalProducts || 0, icon: ShoppingBag, color: 'text-stone-900', bg: 'bg-white', link: '/admin/products' },
    { label: 'Public Products', value: stats.publicProducts || 0, icon: Eye, color: 'text-emerald-700', bg: 'bg-emerald-50/50', link: '/admin/products?visibility=public' },
    { label: 'Restricted Products', value: stats.restrictedProducts || 0, icon: Lock, color: 'text-amber-700', bg: 'bg-amber-50/50', link: '/admin/products?visibility=restricted' },
    { label: 'Pending Requests', value: stats.pendingRequests || 0, icon: Clock, color: 'text-orange-700', bg: 'bg-orange-50/50', link: '/admin/access-requests?status=pending' },
    { label: 'Active Access', value: stats.activeAccess || 0, icon: Unlock, color: 'text-indigo-700', bg: 'bg-indigo-50/50', link: '/admin/customers?status=active' },
    { label: 'Expired Access', value: stats.expiredAccess || 0, icon: ShieldAlert, color: 'text-rose-700', bg: 'bg-rose-50/50', link: '/admin/customers?status=expired' },
    { label: 'Total Enquiries', value: stats.totalEnquiries || 0, icon: MessageSquare, color: 'text-[#8C6D46]', bg: 'bg-[#FAF9F5]', link: '/admin/enquiries' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
            Catalogue Dashboard
          </h1>
          <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-1">
            Key operational metrics, customer access controls, and enquiry tracking.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-white border border-[#E8E2D5] text-[#1A1A1A] hover:border-[#8C6D46] text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          <RefreshCw size={13} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 7 KPI Cards (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          const isLastOnMobile = idx === kpiCards.length - 1;

          return (
            <Link
              key={idx}
              to={kpi.link}
              className={`p-3.5 sm:p-5 rounded-xl border border-[#E8E2D5] ${kpi.bg} shadow-xs hover:border-[#8C6D46] transition-all hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between ${
                isLastOnMobile ? 'col-span-2 sm:col-span-1' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 uppercase tracking-wider line-clamp-1">
                  {kpi.label}
                </span>
                <div className="p-1.5 rounded-lg bg-white/70 border border-[#E8E2D5]/60 shrink-0">
                  <Icon size={16} className={kpi.color} />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-4">
                <span className="font-serif text-[clamp(1.4rem,4.5vw,2rem)] font-bold text-[#1A1A1A] leading-none">
                  {kpi.value}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two-Column Cards: Recent Requests & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Recent Access Requests */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[clamp(1.05rem,3.2vw,1.25rem)] font-semibold text-[#1A1A1A]">
                Recent Access Requests
              </h3>
              <p className="text-[clamp(0.6875rem,2vw,0.75rem)] text-stone-500">
                Customers requesting 7-day trade catalogue access
              </p>
            </div>
            <Link
              to="/admin/access-requests"
              className="text-xs font-semibold text-[#8C6D46] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#F2EFE9]">
            {!data?.recentRequests || data.recentRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No recent access requests found.
              </div>
            ) : (
              data.recentRequests.map((req) => (
                <div key={req._id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#FAF9F5]/70 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-semibold text-[#1A1A1A] truncate">
                        {req.customer_id?.name || 'Customer'}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                      {req.customer_id?.mobile || 'No Mobile'} • Requested: {new Date(req.requested_at).toLocaleDateString()}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
                      <button
                        onClick={() => handleQuickApprove(req._id)}
                        disabled={actionLoading === req._id}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve 7d</span>
                      </button>
                      <button
                        onClick={() => handleQuickReject(req._id)}
                        disabled={actionLoading === req._id}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 active:bg-rose-100 text-stone-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-[clamp(1.05rem,3.2vw,1.25rem)] font-semibold text-[#1A1A1A]">
                Recent Door Enquiries
              </h3>
              <p className="text-[clamp(0.6875rem,2vw,0.75rem)] text-stone-500">
                New trade inquiries from visitors
              </p>
            </div>
            <Link
              to="/admin/enquiries"
              className="text-xs font-semibold text-[#8C6D46] hover:underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-[#F2EFE9]">
            {!data?.recentEnquiries || data.recentEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No recent enquiries found.
              </div>
            ) : (
              data.recentEnquiries.map((enq) => (
                <div key={enq._id} className="p-3.5 sm:p-4 space-y-1 hover:bg-[#FAF9F5]/70 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#1A1A1A] truncate">
                      {enq.customer_name} <span className="font-mono font-normal text-stone-500">({enq.customer_mobile})</span>
                    </span>
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold shrink-0">
                      {enq.status}
                    </span>
                  </div>
                  <p className="text-xs font-serif font-medium text-[#8C6D46]">
                    Door: {enq.product_name}
                  </p>
                  <p className="text-[11px] text-stone-500 line-clamp-1 italic">
                    "{enq.message}"
                  </p>
                </div>
              ))
            )}
          </div>
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
