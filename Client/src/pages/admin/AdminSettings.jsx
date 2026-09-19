import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAdmin } from '../../context/AdminContext';
import {
  Settings,
  Lock,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';

export const AdminSettings = () => {
  const { adminUser } = useAdmin();

  // Settings form state
  const [settings, setSettings] = useState({
    company_name: '',
    tagline: '',
    default_access_duration_days: 7,
    whatsapp_number: '',
    contact_number: '',
    email: '',
    address: '',
    google_maps_url: '',
    business_hours: '',
    about_text: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminSettings();
        if (res.success && res.data) {
          setSettings({
            company_name: res.data.company_name || 'Janki Traders',
            tagline: res.data.tagline || '',
            default_access_duration_days: res.data.default_access_duration_days || 7,
            whatsapp_number: res.data.whatsapp_number || '',
            contact_number: res.data.contact_number || '',
            email: res.data.email || '',
            address: res.data.address || '',
            google_maps_url: res.data.google_maps_url || '',
            business_hours: res.data.business_hours || '',
            about_text: res.data.about_text || '',
          });
        }
      } catch (err) {
        console.warn('Failed to load settings:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsFeedback(null);

    try {
      const res = await api.updateAdminSettings(settings);
      if (res.success) {
        setSettingsFeedback({ type: 'success', message: 'Settings saved successfully!' });
      }
    } catch (err) {
      setSettingsFeedback({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setChangingPassword(true);

    try {
      const res = await api.changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.success) {
        setPasswordFeedback({ type: 'success', message: 'Password updated successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Failed to change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-[clamp(1.35rem,4.5vw,1.875rem)] font-semibold text-[#1A1A1A] leading-tight">
          Store & System Settings
        </h1>
        <p className="text-[clamp(0.75rem,2.2vw,0.8125rem)] text-[#6B6862] mt-0.5">
          Configure default access duration, store contacts, WhatsApp channels, and admin credentials per Section 16.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column: Store Configuration */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#E8E2D5] p-4 sm:p-6 md:p-8 shadow-xs space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <h3 className="font-serif text-[clamp(1.05rem,3.2vw,1.25rem)] font-semibold text-[#1A1A1A]">
              Catalogue & Contact Parameters
            </h3>
            <span className="text-[10px] uppercase font-mono text-[#8C6D46] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E2D5]">
              Public Channels
            </span>
          </div>

          {settingsFeedback && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                settingsFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {settingsFeedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{settingsFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Company Name</label>
                <input
                  type="text"
                  value={settings.company_name}
                  onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              {/* Default Catalogue Access Duration (Section 16: default 7 days) */}
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">
                  Default Access Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.default_access_duration_days}
                  onChange={(e) => setSettings({ ...settings, default_access_duration_days: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
                <span className="text-[10px] text-stone-500">Specified default: 7 days.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">WhatsApp Number</label>
                <div className="relative">
                  <MessageCircle size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Calling Contact Number</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={settings.contact_number}
                    onChange={(e) => setSettings({ ...settings, contact_number: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full pl-8 pr-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-stone-700">Physical Showroom Address</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Business Hours</label>
                <input
                  type="text"
                  value={settings.business_hours}
                  onChange={(e) => setSettings({ ...settings, business_hours: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Official Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#8C6D46] text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                <Save size={14} />
                <span>{savingSettings ? 'Saving Settings...' : 'Save Store Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Admin Profile & Change Password (Section 16) */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Admin Profile Box */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="font-serif text-[clamp(1.05rem,3.2vw,1.25rem)] font-semibold text-[#1A1A1A]">
              Admin Account
            </h3>
            <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] text-xs space-y-2 text-stone-600">
              <p><strong className="text-[#1A1A1A]">Name:</strong> {adminUser?.name || 'Janki Traders Admin'}</p>
              <p className="truncate"><strong className="text-[#1A1A1A]">Email:</strong> {adminUser?.email || 'admin@jankitraders.com'}</p>
              <p><strong className="text-[#1A1A1A]">Role:</strong> <span className="uppercase text-[#8C6D46] font-semibold">{adminUser?.role || 'superadmin'}</span></p>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl border border-[#E8E2D5] p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-[clamp(1.05rem,3.2vw,1.25rem)] font-semibold text-[#1A1A1A]">
              Change Password
            </h3>

            {passwordFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  passwordFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {passwordFeedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-stone-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full py-2.5 rounded-lg bg-[#1A1A1A] hover:bg-[#8C6D46] text-white font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
                >
                  <Key size={14} />
                  <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
