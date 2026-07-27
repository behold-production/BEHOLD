import React, { useEffect } from 'react';
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

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-confirm-title"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 bg-[#f7f4ef] border border-[#d6cecb] text-[#1c1514]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close sign out confirmation"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] transition cursor-pointer border border-[#d8d0c7]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 text-center space-y-5">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-[#eae4dc] border border-[#d8d0c7]">
            <AlertTriangle className="w-6 h-6 text-[#2b211e]" />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 id="logout-confirm-title" className="text-lg font-bold uppercase tracking-tight text-[#1c1514]">
              Sign Out?
            </h3>
            <p className="text-xs text-[#6e635e] leading-relaxed">
              You are about to end your current session. You will need to sign in again to access your dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="min-h-[44px] flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-[#d8d0c7] bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514]"
            >
              Stay Signed In
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="min-h-[44px] flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer border-none bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] flex items-center justify-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
