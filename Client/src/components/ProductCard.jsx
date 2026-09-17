import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, MessageCircle, ArrowRight, Sparkles, Plus, Check } from 'lucide-react';
import { getImageUrl } from '../services/api';
import { useCustomer } from '../context/CustomerContext';
import { useBulkEnquiry } from '../context/BulkEnquiryContext';

export const ProductCard = ({ product, onInquireClick }) => {
  const { hasRestrictedAccess, openAccessModal, settings } = useCustomer();
  const { isInBulk, toggleBulk } = useBulkEnquiry();

  const inBulk = isInBulk(product?._id);

  const isRestricted = product.visibility === 'restricted';
  const isLocked = isRestricted && !hasRestrictedAccess;

  const imageUrl = getImageUrl(product.images?.[0]);

  const whatsapp = settings?.whatsapp_number || '+91 98765 43210';
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(
    `Hello Janki Traders, I would like to inquire about door: "${product.name}" (Code: ${product.product_code || 'N/A'}).`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodedText}`;

  return (
    <div className="group bg-white rounded-lg border border-[#E8E2D5] overflow-hidden luxury-card flex flex-col h-full shadow-xs">
      {/* Product Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F2EFE9]">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
            isLocked ? 'filter blur-[1px] brightness-95' : ''
          }`}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.category_id?.name && (
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-white/90 backdrop-blur-sm text-[#1A1A1A] rounded-sm shadow-xs border border-[#E8E2D5]">
              {product.category_id.name}
            </span>
          )}

          {isRestricted ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-[#1A1A1A] text-[#FAF9F5] rounded-sm flex items-center gap-1 shadow-sm">
              <Lock size={11} className="text-[#C5A880]" />
              <span>Restricted</span>
            </span>
          ) : product.featured ? (
            <span className="px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-[#8C6D46] text-white rounded-sm flex items-center gap-1 shadow-sm">
              <Sparkles size={11} />
              <span>Featured</span>
            </span>
          ) : null}
        </div>

        {/* Product Code & Bulk Selection Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.product_code && (
            <span className="text-[clamp(9px,2.2vw,10.5px)] font-mono tracking-widest font-semibold px-2 py-0.5 rounded-sm bg-black/60 backdrop-blur-sm text-white border border-white/20">
              {product.product_code}
            </span>
          )}
          {inBulk && (
            <span className="ml-auto text-[clamp(9px,2.2vw,10.5px)] font-medium tracking-wide px-2 py-0.5 rounded-sm bg-[#8C6D46] text-white shadow-xs flex items-center gap-1">
              <Check size={10} className="stroke-[3]" />
              <span>In List</span>
            </span>
          )}
        </div>

        {/* Restricted Locked Overlay (if locked) */}
        {isLocked && (
          <div className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A]/90 border border-[#C5A880] flex items-center justify-center text-[#C5A880] mb-2 shadow-lg">
              <Lock size={20} />
            </div>
            <p className="text-white text-[clamp(11px,2.8vw,12px)] font-medium font-sans max-w-[180px] mb-3 leading-snug drop-shadow-sm">
              Exclusive Trade Catalogue. Active 7-day access required.
            </p>
            <button
              onClick={openAccessModal}
              className="px-3.5 py-1.5 rounded-md bg-[#FAF9F5] hover:bg-white text-[#1A1A1A] text-[clamp(10px,2.6vw,12px)] font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              Unlock Access
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-[clamp(14px,3.5vw,20px)] flex flex-col flex-grow justify-between bg-white">
        <div>
          <h3 className="font-serif text-[clamp(16px,3.8vw,20px)] font-semibold text-[#1A1A1A] group-hover:text-[#8C6D46] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <p className="mt-2 text-[clamp(11px,2.6vw,12.5px)] text-[#6B6862] line-clamp-2 leading-relaxed font-light">
            {product.description || 'Premium architectural door crafted with precision engineering and high-durability specifications.'}
          </p>
        </div>

        {/* Actions bar */}
        <div className="mt-4 pt-3.5 border-t border-[#F2EFE9] flex items-center justify-between gap-1.5 sm:gap-2">
          {isLocked ? (
            <button
              onClick={openAccessModal}
              className="w-full py-2 px-3 rounded-md border border-[#8C6D46] text-[#8C6D46] hover:bg-[#8C6D46] hover:text-white text-[clamp(10.5px,2.5vw,12px)] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Lock size={12} />
              <span>Unlock to View Details</span>
            </button>
          ) : (
            <>
              <Link
                to={`/shop/${product._id}`}
                className="flex-1 py-2 px-[clamp(5px,1.8vw,10px)] rounded-md bg-[#FAF9F5] hover:bg-[#E8E2D5]/70 text-[#1A1A1A] text-[clamp(10px,2.4vw,12px)] font-semibold border border-[#E8E2D5] flex items-center justify-center gap-1 transition-colors min-w-0 truncate"
                title="View Door Details"
              >
                <span>Details</span>
                <ArrowRight size={13} className="text-[#8C6D46] shrink-0" />
              </Link>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleBulk(product);
                }}
                className={`py-2 px-[clamp(6px,2vw,10px)] rounded-md text-[clamp(10px,2.4vw,12px)] font-medium transition-all flex items-center justify-center gap-1 cursor-pointer border shrink-0 ${
                  inBulk
                    ? 'bg-[#8C6D46] hover:bg-[#785c39] text-white border-[#8C6D46] shadow-xs'
                    : 'bg-[#FAF9F5] hover:bg-[#E8E2D5] text-[#4A4742] border-[#E8E2D5]'
                }`}
                title={inBulk ? 'Remove from Bulk Enquiry' : 'Add to Bulk Enquiry'}
              >
                {inBulk ? <Check size={12} className="stroke-[2.5] shrink-0" /> : <Plus size={12} className="shrink-0" />}
                <span>{inBulk ? 'Selected' : 'Bulk'}</span>
              </button>

              <button
                onClick={() => onInquireClick ? onInquireClick(product) : null}
                className="py-2 px-[clamp(6px,2vw,10px)] rounded-md bg-[#1A1A1A] hover:bg-[#8C6D46] text-white text-[clamp(10px,2.4vw,12px)] font-medium transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer shrink-0"
                title="Send Instant Enquiry"
              >
                <span>Inquire</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors border border-[#25D366]/30 flex items-center justify-center shrink-0"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={15} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
