import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel, onClose }) {
  const handleClose = onClose || onCancel;

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('no-scroll');
    const handleEsc = (e) => {
      if (e.key === 'Escape' && handleClose) handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.body.classList.remove('no-scroll');
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (handleClose) handleClose();
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
        className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in z-[99999]"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative z-[100000] w-full max-w-sm rounded-[24px] animate-in zoom-in-95 duration-300 ease-out bg-white/95 backdrop-blur-2xl border border-white/60 text-[#0f172a] overflow-hidden shadow-[0_24px_48px_-12px_rgba(15,23,42,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close sign out confirmation"
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 hover:bg-surface-200 text-surface-500 hover:text-[#0f172a] transition-all cursor-pointer border-none z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-8 text-center space-y-6 relative z-10">
          {/* Animated warning icon */}
          <div className="relative mx-auto w-16 h-16 flex items-center justify-center group">
            <div className="absolute inset-0 bg-[#0f172a] rounded-2xl rotate-3 transition-transform duration-300 group-hover:rotate-6 shadow-lg shadow-[#0f172a]/20" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl -rotate-3 transition-transform duration-300 group-hover:rotate-0" />
            <AlertTriangle className="w-7 h-7 text-[#00e5ff] relative z-10 drop-shadow-[0_0_10px_rgba(0,229,255,0.6)] animate-pulse" />
          </div>

          <div className="space-y-2.5">
            <h3
              id="logout-confirm-title"
              className="text-2xl font-semibold text-[#0f172a] font-sans"
            >
              Sign Out
            </h3>
            <p className="text-sm text-surface-500 font-medium leading-relaxed px-1">
              You are about to end your current session. You will need to sign in again to access your dashboard.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="button"
              onClick={handleConfirm}
              className="group relative w-full flex items-center justify-center gap-2.5 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer border-none shadow-lg shadow-[#0f172a]/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0f172a]/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <LogOut className="w-4 h-4 text-[#00e5ff]" />
              <span>Yes, Sign Out</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3.5 bg-surface-100 hover:bg-surface-200 text-[#0f172a] font-semibold text-sm rounded-xl transition-all border-none cursor-pointer"
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
