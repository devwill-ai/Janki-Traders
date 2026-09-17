import React from 'react';
import { useBulkEnquiry } from '../context/BulkEnquiryContext';
import { ArrowRight, Check, Layers } from 'lucide-react';

export const BulkEnquiryFloatingBar = () => {
  const { distinctCount, totalQuantity, openBulkModal, isBulkModalOpen, notification } = useBulkEnquiry();

  return (
    <>
      {/* Dynamic Toast Notification when item added / removed */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 pointer-events-none animate-fadeIn w-[calc(100%-2rem)] sm:w-auto max-w-sm">
          <div className="bg-[#1A1A1A]/95 backdrop-blur-md text-white px-[clamp(10px,3vw,16px)] py-[clamp(8px,2vw,12px)] rounded-xl shadow-2xl border border-[#8C6D46] flex items-center gap-[clamp(6px,2vw,10px)] text-[clamp(11px,2.8vw,13px)]">
            <div className="w-[clamp(18px,4.5vw,22px)] h-[clamp(18px,4.5vw,22px)] rounded-full bg-[#8C6D46] text-white flex items-center justify-center shrink-0">
              <Check size={12} className="stroke-[3] w-[clamp(10px,2.5vw,12px)] h-[clamp(10px,2.5vw,12px)]" />
            </div>
            <span className="font-medium truncate">{notification}</span>
          </div>
        </div>
      )}

      {/* Responsive Floating Bottom Bar when items are selected */}
      {distinctCount > 0 && !isBulkModalOpen && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-bounce-subtle pointer-events-auto w-[calc(100%-1.5rem)] max-w-fit sm:max-w-md">
          <button
            onClick={openBulkModal}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-[clamp(8px,2.5vw,14px)] px-[clamp(12px,3.5vw,22px)] py-[clamp(8px,2.2vw,13px)] rounded-full bg-[#1A1A1A]/95 hover:bg-[#1A1A1A] backdrop-blur-md text-white shadow-2xl border border-[#C5A880]/70 transition-all hover:scale-[1.02] cursor-pointer group"
            aria-label="Open bulk enquiry basket"
          >
            {/* Counter Badge */}
            <div className="w-[clamp(24px,6.5vw,32px)] h-[clamp(24px,6.5vw,32px)] rounded-full bg-[#8C6D46] flex items-center justify-center text-white text-[clamp(11px,3vw,13px)] font-bold shrink-0 shadow-sm border border-white/20">
              {distinctCount}
            </div>

            {/* Center Fluid Text */}
            <div className="text-left min-w-0 pr-1 flex-1 sm:flex-initial">
              <div className="text-[clamp(11px,3vw,13.5px)] font-semibold tracking-wide flex items-center gap-[clamp(4px,1.5vw,8px)] whitespace-nowrap">
                <span>{distinctCount} {distinctCount === 1 ? 'Door Model' : 'Door Models'} Selected</span>
                <span className="text-[clamp(9.5px,2.5vw,11.5px)] text-[#C5A880] font-normal">
                  ({totalQuantity} {totalQuantity === 1 ? 'unit' : 'units'})
                </span>
              </div>
              <div className="text-[clamp(9.5px,2.4vw,11px)] text-stone-300 font-light truncate max-w-[200px] sm:max-w-none">
                Tap to review & enquire
              </div>
            </div>

            {/* Right Arrow */}
            <div className="w-[clamp(24px,6.5vw,30px)] h-[clamp(24px,6.5vw,30px)] rounded-full bg-white/10 group-hover:bg-[#8C6D46] flex items-center justify-center transition-colors shrink-0">
              <ArrowRight className="text-[#FAF9F5] w-[clamp(12px,3vw,14px)] h-[clamp(12px,3vw,14px)]" />
            </div>
          </button>
        </div>
      )}
    </>
  );
};
