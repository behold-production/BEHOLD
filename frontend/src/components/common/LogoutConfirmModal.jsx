import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel, onClose }) {
  const closeAction = onClose || onCancel;

  const handleClose = (e) => {
    if (e) {
      e.stopPropagation?.();
    }
    if (closeAction) closeAction();
  };

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    document.body.classList.add('no-scroll');
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose(e);
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleConfirm = (e) => {
    if (e) e.stopPropagation?.();
    if (onConfirm) onConfirm();
    handleClose(e);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
    >
      {/* Premium Glassmorphic Backdrop */}
      <div
        className="fixed inset-0 bg-[#0e1111]/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in z-[99999]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative z-[100000] w-full max-w-sm rounded-md animate-in zoom-in-95 duration-300 ease-out bg-[#fbf8f1] border border-[#e6dfd0] text-[#0e1111] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - Optimized for Touch & Mobile Tap Target */}
        <button
          type="button"
          onClick={handleClose}
          onTouchEnd={(e) => {
            e.preventDefault();
            handleClose(e);
          }}
          aria-label="Close sign out confirmation"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-md bg-white/80 hover:bg-[#e6dfd0] text-[#55605f] hover:text-[#0e1111] transition-colors cursor-pointer border border-[#e6dfd0] z-30"
        >
          <X className="w-4 h-4 pointer-events-none" />
        </button>

        <div className="p-8 text-center space-y-6 relative z-10">
          {/* Animated warning icon */}
          <div className="mx-auto w-16 h-16 rounded-md bg-[#0e7490]/10 border border-[#0e7490]/20 flex items-center justify-center text-[#0e7490]">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0e7490] block">
              Session Security
            </span>
            <h3
              id="logout-confirm-title"
              className="text-2xl sm:text-3xl font-serif font-bold text-[#0e1111]"
            >
              Sign Out
            </h3>
            <p className="text-xs text-[#55605f] font-normal leading-relaxed px-1">
              You are about to end your current session. You can sign back in anytime with your phone number.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0e1111] hover:bg-rose-700 text-white font-medium text-sm rounded-md transition-all cursor-pointer border-none shadow-md"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Yes, Sign Out</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 bg-white hover:bg-[#e6dfd0]/50 text-[#0e1111] font-medium text-sm rounded-md transition-all border border-[#e6dfd0] cursor-pointer"
            >
              Stay Signed In
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
