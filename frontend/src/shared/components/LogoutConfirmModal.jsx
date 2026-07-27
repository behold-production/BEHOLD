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
        className="relative z-[100000] w-full max-w-sm rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 bg-[#f7f4ef] border border-[#d6cecb] text-[#1c1514]"
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
            <AlertTriangle className="w-6 h-6 text-[#1c1514]" />
          </div>

          <div className="space-y-1.5">
            <h3
              id="logout-confirm-title"
              className="text-lg font-bold text-[#1c1514] uppercase tracking-wide font-sans"
            >
              Sign Out?
            </h3>
            <p className="text-xs text-[#6e635e] font-normal leading-relaxed">
              You are about to end your current session. You will need to sign in again to access your dashboard.
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 bg-[#eae4dc] hover:bg-[#e2dad2] text-[#1c1514] font-bold text-xs uppercase tracking-wider rounded-full transition-all border border-[#d8d0c7] cursor-pointer"
            >
              Stay Signed In
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full py-3 bg-[#2b211e] hover:bg-[#1c1514] text-[#f7f4ef] font-bold text-xs uppercase tracking-widest rounded-full transition-all border-none cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
