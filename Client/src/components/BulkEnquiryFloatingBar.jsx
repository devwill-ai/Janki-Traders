import { useState, useRef, useEffect } from 'react';
import { useBulkEnquiry } from '../context/BulkEnquiryContext';
import { ArrowRight, Check, Layers, X } from 'lucide-react';

export const BulkEnquiryFloatingBar = () => {
  const { distinctCount, totalQuantity, openBulkModal, isBulkModalOpen, notification } = useBulkEnquiry();
  const [isMinimized, setIsMinimized] = useState(false);
  const prevCountRef = useRef(distinctCount);

  // Automatically re-expand if a new item is added to the enquiry list
  useEffect(() => {
    if (distinctCount > prevCountRef.current) {
      setIsMinimized(false);
    }
    prevCountRef.current = distinctCount;
  }, [distinctCount]);

  if (distinctCount === 0) return null;

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

      {/* Floating Bar or Minimized Corner Pill */}
      {!isBulkModalOpen && (
        isMinimized ? (
          /* Minimized Compact Corner Pill (Option C) */
          <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fadeIn pointer-events-auto">
            <button
              onClick={openBulkModal}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#1A1A1A]/95 hover:bg-[#1A1A1A] backdrop-blur-md text-white shadow-2xl border border-[#C5A880]/80 transition-all hover:scale-105 cursor-pointer group"
              aria-label={`Open bulk enquiry basket (${distinctCount} items)`}
              title="View selected door models"
            >
              <div className="relative flex items-center justify-center">
                <Layers className="text-[#C5A880] w-[18px] h-[18px]" />
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#8C6D46] text-white text-[10px] font-bold flex items-center justify-center border border-white/30 shadow-xs">
                  {distinctCount}
                </span>
              </div>
              <span className="text-xs font-medium text-stone-200 tracking-wide pr-0.5">
                Enquiry
              </span>
            </button>
          </div>
        ) : (
          /* Full Responsive Floating Bottom Bar with Dismiss × */
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fadeIn pointer-events-auto w-max max-w-[92vw]">
            <div className="inline-flex items-center rounded-full bg-[#1A1A1A]/95 backdrop-blur-md text-white shadow-2xl border border-[#C5A880]/70 pl-2.5 pr-1.5 py-1 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              {/* Clickable Area to open enquiry modal */}
              <button
                onClick={openBulkModal}
                className="flex items-center gap-2 py-0.5 text-left cursor-pointer group"
                aria-label="Open bulk enquiry basket"
              >
                {/* Counter Badge */}
                <div className="w-6 h-6 rounded-full bg-[#8C6D46] flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm border border-white/20">
                  {distinctCount}
                </div>

                {/* Center Fluid Text */}
                <div className="px-1 text-left">
                  <div className="text-xs font-semibold tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                    <span>{distinctCount} {distinctCount === 1 ? 'Door Model' : 'Door Models'}</span>
                    <span className="text-[10px] text-[#C5A880] font-normal">
                      ({totalQuantity} {totalQuantity === 1 ? 'unit' : 'units'})
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-300 font-light whitespace-nowrap">
                    Tap to review & enquire
                  </div>
                </div>

                {/* Right Arrow */}
                <div className="w-5 h-5 rounded-full bg-white/10 group-hover:bg-[#8C6D46] flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="text-[#FAF9F5] w-3 h-3" />
                </div>
              </button>

              {/* Dismiss / Minimize button (Option C) */}
              <div className="h-4 w-px bg-white/20 mx-1" />
              <button
                onClick={() => setIsMinimized(true)}
                className="w-6 h-6 rounded-full hover:bg-white/15 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Dismiss to corner pill"
                aria-label="Dismiss enquiry bar"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};
