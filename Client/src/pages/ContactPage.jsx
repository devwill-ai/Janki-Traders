import React, { useState } from 'react';
import { useCustomer } from '../context/CustomerContext';
import {
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  ShieldCheck,
  Send,
  CheckCircle2,
} from 'lucide-react';

export const ContactPage = () => {
  const { settings } = useCustomer();

  const phone = settings?.contact_number || '+91 98765 43210';
  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const email = settings?.email || 'sales@jankitraders.com';
  const address = settings?.address || 'Plot No. 42, Timber & Architectural Market, Ring Road, Ahmedabad, Gujarat 380001';
  const mapsUrl = settings?.google_maps_url || 'https://maps.google.com/?q=Janki+Traders+Ahmedabad';
  const hours = settings?.business_hours || 'Monday - Saturday: 9:30 AM to 8:00 PM (Sunday Closed)';

  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', mobile: '', message: '' });

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setFormSent(true);
  };

  const whatsappDirectUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Janki Traders, I would like to inquire about your door collections and showroom visits.')}`;

  return (
    <div className="min-h-screen bg-[#FAF9F5] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E2D5] py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
              Contact & Showroom
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#1A1A1A] tracking-tight">
              Connect with Janki Traders
            </h1>
            <p className="text-sm sm:text-base text-[#6B6862] font-light leading-relaxed">
              Reach our architectural door sales desk, plan a showroom visit to inspect material samples, or speak with our commercial wholesale estimators.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            {/* Showroom card */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#FAF9F5] border border-[#C5A880] text-[#8C6D46] flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">
                    Showroom & Depot
                  </h3>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider">
                    Physical Address
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#4A4742] leading-relaxed font-light">
                {address}
              </p>

              <div className="pt-2">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C6D46] hover:text-[#1A1A1A] transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Direct Calls & WhatsApp CTAs (Section 7) */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] p-[clamp(12px,3vw,24px)] shadow-xs space-y-4">
              <h3 className="font-serif text-[clamp(1.15rem,3vw,1.35rem)] font-semibold text-[#1A1A1A]">
                Direct Communications
              </h3>

              <div className="space-y-3 pt-1">
                <a
                  href={`tel:${phone}`}
                  className="w-full py-2.5 sm:py-3 px-[clamp(8px,2.2vw,16px)] rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5]/60 border border-[#E8E2D5] text-[#1A1A1A] text-[clamp(10px,2.5vw,12px)] font-semibold flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Phone size={15} className="text-[#8C6D46] shrink-0" />
                    <span className="truncate">Call Sales Desk: <span className="font-mono">{phone}</span></span>
                  </div>
                  <span className="text-[clamp(9px,2.2vw,11px)] text-[#8C6D46] font-medium shrink-0 whitespace-nowrap">Direct Call →</span>
                </a>

                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 sm:py-3 px-[clamp(8px,2.2vw,16px)] rounded-md bg-[#25D366] hover:bg-[#20ba59] text-white text-[clamp(10px,2.5vw,12px)] font-semibold flex items-center justify-between gap-2 shadow-xs transition-colors"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <MessageCircle size={15} className="shrink-0" />
                    <span className="truncate">Chat on WhatsApp: <span className="font-mono">{whatsapp}</span></span>
                  </div>
                  <span className="text-[clamp(9px,2.2vw,11px)] text-white/90 font-medium shrink-0 whitespace-nowrap">Instant Reply →</span>
                </a>

                <div className="pt-1 flex items-center gap-2 text-[clamp(10px,2.5vw,12px)] text-stone-600 truncate">
                  <Mail size={15} className="text-[#8C6D46] shrink-0" />
                  <span className="truncate">Email: <a href={`mailto:${email}`} className="text-[#1A1A1A] font-medium">{email}</a></span>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] p-6 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8C6D46]">
                <Clock size={15} />
                <span>Showroom Hours</span>
              </div>
              <p className="text-xs text-[#4A4742] leading-relaxed">
                {hours}
              </p>
            </div>
          </div>

          {/* Right: Interactive Inquiry Form & Map Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl border border-[#E8E2D5] p-6 sm:p-8 shadow-xs">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C6D46]">
                Direct Message
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#1A1A1A] mt-1 mb-6">
                Send a Message or Project Specification
              </h3>

              {formSent ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                    <CheckCircle2 size={30} />
                  </div>
                  <h4 className="font-serif text-2xl font-semibold text-[#1A1A1A]">
                    Message Dispatched
                  </h4>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, {formData.name}. Our architectural door specialist will reach you at {formData.mobile} promptly.
                  </p>
                  <button
                    onClick={() => setFormSent(false)}
                    className="mt-4 px-4 py-2 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-xs font-semibold text-[#1A1A1A]"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleGeneralSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9825012345"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider">
                      Message / Project Quantities
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Specify your door requirements, sizes, or question..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 bg-[#FAF9F5] border border-[#E8E2D5] rounded-md text-sm text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Send size={14} />
                      <span>Submit Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Google Map Mock / Frame */}
            <div className="bg-white rounded-xl border border-[#E8E2D5] p-2 overflow-hidden shadow-xs">
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-[#F2EFE9] relative flex items-center justify-center">
                <iframe
                  title="Janki Traders Location Map"
                  src="https://maps.google.com/maps?q=Timber+Market+Ahmedabad&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
