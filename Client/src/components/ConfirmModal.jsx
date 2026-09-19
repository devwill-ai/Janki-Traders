import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, HelpCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = 'Confirmation Required',
  message,
  type = 'danger', // 'danger' | 'warning' | 'info' | 'prompt'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showInput = false,
  inputLabel,
  inputPlaceholder = '',
  defaultValue = '',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm(showInput ? inputValue : undefined);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
        );
      case 'prompt':
        return (
          <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#8C6D46] flex items-center justify-center shrink-0">
            <HelpCircle size={20} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    if (type === 'danger') {
      return 'bg-rose-600 hover:bg-rose-700 text-white';
    }
    if (type === 'warning') {
      return 'bg-amber-600 hover:bg-amber-700 text-white';
    }
    return 'bg-[#1A1A1A] hover:bg-[#8C6D46] text-white';
  };

  const handleClose = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-xl border border-[#E8E2D5] max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl safe-pb z-10 animate-slideUp sm:animate-none">
        <div className="flex items-start gap-3.5">
          {getIcon()}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-serif text-[clamp(1.1rem,3.5vw,1.3rem)] font-semibold text-[#1A1A1A] leading-tight">
              {title}
            </h3>
            {message && (
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-[#1A1A1A] hover:bg-[#FAF9F5] cursor-pointer"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-1">
          {showInput && (
            <div className="space-y-1.5">
              {inputLabel && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  {inputLabel}
                </label>
              )}
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-lg text-sm sm:text-xs text-[#1A1A1A] focus:outline-none focus:border-[#8C6D46]"
              />
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-2">
            {cancelText && (
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#E8E2D5] border border-[#E8E2D5] text-stone-700 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
              >
                {cancelText}
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all ${getConfirmButtonClasses()}`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
