import React from 'react';
import { Link } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { Phone, MessageCircle, MapPin, Clock, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const { settings } = useCustomer();

  const phone = settings?.contact_number || '+91 98765 43210';
  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const address = settings?.address || 'Plot No. 42, Timber & Architectural Market, Ring Road, Ahmedabad, Gujarat 380001';
  const hours = settings?.business_hours || 'Mon - Sat: 9:30 AM to 8:00 PM (Sunday Closed)';

  return (
    <footer className="bg-[#181818] text-[#E8E2D5] pt-16 pb-24 md:pb-16 border-t border-[#2D2B28]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#2D2B28]">
          {/* Col 1: Brand intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo-crest.webp"
                alt="Janki Traders Crest Logo"
                className="w-12 h-12 object-contain drop-shadow-sm"
              />
              <div>
                <span className="font-serif text-2xl font-semibold tracking-wide text-white block">
                  Janki Traders
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-[#C5A880] block font-medium">
                  Architectural Doors
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-400 font-light leading-relaxed">
              Distributor and wholesaler of high-grade architectural doors. Specializing in 100% waterproof WPC & FRP doors, fluted glass double doors, solid Burma teak, and designer pivot entrances.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-[#C5A880]">
              <ShieldCheck size={16} />
              <span>Certified Quality & Moisture-Resistant Formulations</span>
            </div>
          </div>

          {/* Col 2: Door Categories */}
          <div>
            <h4 className="font-serif text-lg text-white font-medium mb-4 tracking-wide">
              Door Collections
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/shop?category=waterproof-doors" className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5">
                  <span>Waterproof WPC & FRP Doors</span>
                </Link>
              </li>
              <li>
                <Link to="/shop?category=glass-doors" className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5">
                  <span>Fluted & Frosted Glass Doors</span>
                </Link>
              </li>
              <li>
                <Link to="/shop?category=wooden-doors" className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5">
                  <span>Solid Burma Teak Wood Doors</span>
                </Link>
              </li>
              <li>
                <Link to="/shop?category=laminated-membrane-doors" className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5">
                  <span>Laminated & Membrane Doors</span>
                </Link>
              </li>
              <li>
                <Link to="/shop?category=designer-entrance-doors" className="hover:text-[#C5A880] transition-colors flex items-center gap-1.5">
                  <span>Luxury Pivot Entrance Doors</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Navigation */}
          <div>
            <h4 className="font-serif text-lg text-white font-medium mb-4 tracking-wide">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#C5A880] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#C5A880] transition-colors">
                  Browse Product Catalogue
                </Link>
              </li>
              <li>
                <Link to="/inquired" className="hover:text-[#C5A880] transition-colors">
                  My Inquired Doors
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C5A880] transition-colors">
                  Showroom Location & Contact
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#C5A880] transition-colors flex items-center gap-1">
                  <span>Admin Management</span>
                  <ArrowUpRight size={13} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact channels */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg text-white font-medium tracking-wide">
              Showroom & Contacts
            </h4>
            <div className="space-y-3 text-xs text-stone-400 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#C5A880] shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#C5A880] shrink-0" />
                <span>{hours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#C5A880] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello Janki Traders, I would like to inquire about your doors collection.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20ba59] transition-colors shadow-sm"
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Janki Traders. Digital Catalogue System. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Controlled Catalogue Access Protocol</span>
            <span>•</span>
            <span>Architectural Doors Division</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
