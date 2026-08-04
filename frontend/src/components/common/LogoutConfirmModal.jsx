import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X, AlertTriangle } from 'lucide-react';

/**
 * LogoutConfirmModal
 * Props:
 * isOpen - boolean
 * onConfirm - () => void (actually log out)
 * onCancel - () => void (close modal)
 * theme - 'dark' | 'light' (default: 'dark')
 */
export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel, theme = 'dark' }) {
 useEffect(() => {
 if (!isOpen) return;
 document.body.classList.add('no-scroll');
 const handleEsc = (e) => {
 if (e.key === 'Escape') onCancel();
 };
 document.addEventListener('keydown', handleEsc);
 return () => {
 document.body.classList.remove('no-scroll');
 document.removeEventListener('keydown', handleEsc);
 };
 }, [isOpen, onCancel]);

 if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onCancel}
    >
      {/* Opaque Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[99999]"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative z-[100000] w-full max-w-sm rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 bg-white border border-surface-200 text-[#0f172a]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close sign out confirmation"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-surface-100 hover:bg-surface-200 text-[#0f172a] transition cursor-pointer border border-surface-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 text-center space-y-5">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-[#0f172a] border border-[#00e5ff]/30 shadow-xs">
            <AlertTriangle className="w-6 h-6 text-[#00e5ff]" />
          </div>

          <div className="space-y-1.5">
            <h3
              id="logout-confirm-title"
              className="text-lg font-black text-[#0f172a] uppercase tracking-wide font-sans"
            >
              Sign Out<span className="text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] font-black">?</span>
            </h3>
            <p className="text-xs text-surface-600 font-normal leading-relaxed">
              You are about to end your current session. You will need to sign in again to access your dashboard.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 bg-surface-100 hover:bg-surface-200 text-[#0f172a] font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-surface-200 cursor-pointer"
            >
              Stay Signed In
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs uppercase tracking-widest rounded-full transition-all border border-[#00e5ff]/30 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
