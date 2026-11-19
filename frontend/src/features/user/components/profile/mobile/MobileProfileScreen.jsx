import React, { useState } from 'react';
import { 
  Camera, Edit3, User, Bell, FileText, Shield, 
  PhoneCall, LogOut, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import MobileEditProfileModal from './MobileEditProfileModal';

export default function MobileProfileScreen({
  profile = {},
  formData = {},
  handleChange,
  handleSave,
  isSaving = false,
  handleProfilePicUpload,
  permissionState,
  handleEnableNotifications,
  onNavigateTab,
}) {
  const { user, logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  const initial = (formData.name || profile.name || user?.name || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out of your BEHOLD account?')) {
      logout();
    }
  };

  if (!user) {
    return (
      <div className="pb-24 pt-8 px-4 bg-[#F8FAFC] min-h-screen text-slate-900 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-cyan-100/70 border-2 border-cyan-500/20 text-[#0E7490] flex items-center justify-center mb-4 shadow-sm">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Welcome to BEHOLD</h2>
        <p className="text-xs text-slate-500 mb-6 max-w-xs leading-relaxed">
          Sign in or create your account to view your bookings, therapeutic records, and personalized care plan.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('behold:open_auth'))}
          className="w-full max-w-xs py-3 rounded-xl bg-[#0E7490] text-white text-xs font-bold shadow-md hover:bg-[#0B5C73] active:scale-95 transition-all cursor-pointer border-none"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 bg-[#F8FAFC] min-h-screen text-slate-900">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-slate-900">My Profile</h2>
        <p className="text-xs text-slate-500 mt-0.5">Account, vitals & wellness settings</p>
      </div>

      {/* User Avatar Card (Matching CarePro Profile Screen) */}
      <div className="flex flex-col items-center justify-center pt-2 pb-4">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-cyan-100/70 border-3 border-cyan-500/20 text-[#0E7490] font-black text-3xl shadow-md">
            {profile.profilePic || formData.profilePic ? (
              <img
                src={profile.profilePic || formData.profilePic}
                alt={formData.name || 'User'}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>

          {/* Camera Upload Badge */}
          <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#0E7490] text-white shadow-md ring-2 ring-white hover:bg-[#0B5C73] transition-colors">
            <Camera className="h-3.5 w-3.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleProfilePicUpload(file);
              }}
            />
          </label>
        </div>

        <h3 className="mt-3 text-lg font-bold text-slate-900">
          {formData.name || profile.name || 'Client'}
        </h3>
        <p className="text-xs text-slate-500">{formData.email || profile.email}</p>

        {/* Member Badge */}
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-md bg-cyan-50 px-2 py-0.5 text-[10.5px] font-bold text-[#0E7490] border border-cyan-100">
            ID: {profile._id ? `BEHOLD-${profile._id.slice(-5).toUpperCase()}` : 'BEHOLD-CLIENT'}
          </span>
          <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            CONFIDENTIAL CLIENT
          </span>
        </div>

        {/* Edit Full Profile button */}
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-cyan-200 bg-white px-4 py-1.5 text-xs font-bold text-[#0E7490] shadow-2xs hover:bg-cyan-50 active:scale-95 transition-all"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit Full Profile & Vitals
        </button>
      </div>

      {/* Vitals Row (Height, Weight, Blood) */}
      <div className="mt-2 grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">HEIGHT</span>
          <span className="text-base font-extrabold text-slate-800 block mt-0.5">{formData.height || 172}</span>
          <span className="text-[10px] font-semibold text-slate-400">CM</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">WEIGHT</span>
          <span className="text-base font-extrabold text-slate-800 block mt-0.5">{formData.weight || 68}</span>
          <span className="text-[10px] font-semibold text-slate-400">KG</span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">BLOOD</span>
          <span className="text-base font-extrabold text-[#0E7490] block mt-0.5">{formData.bloodGroup || 'O+'}</span>
          <span className="text-[10px] font-semibold text-slate-400">TYPE</span>
        </div>
      </div>

      {/* Actions and Settings Group */}
      <div className="mt-5 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          SETTINGS &amp; RECORDS
        </span>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
              <User className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Personal Information</span>
              <span className="text-[11px] text-slate-400 block">Name, phone, birthday & gender</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab(2)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-[#0E7490]">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Digital Invoices &amp; Receipts</span>
              <span className="text-[11px] text-slate-400 block">Download past session receipts</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={handleEnableNotifications}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Notifications &amp; Alerts</span>
              <span className="text-[11px] text-slate-400 block">
                {permissionState === 'granted' ? 'Active • Alerts enabled' : 'Tap to enable browser alerts'}
              </span>
            </div>
          </div>
          {permissionState === 'granted' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowHelplineModal(true)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">24/7 Crisis Support Helpline</span>
              <span className="text-[11px] text-slate-400 block">Immediate assistance (112, KIRAN)</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <LogOut className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-700 block">Log Out</span>
              <span className="text-[11px] text-rose-500/80 block">Sign out of your account</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-rose-400" />
        </button>
      </div>

      <MobileEditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        formData={formData}
        handleChange={handleChange}
        handleSave={handleSave}
        isSaving={isSaving}
      />

      {/* Helpline modal */}
      {showHelplineModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-1">
              <PhoneCall className="h-4 w-4" />
              24/7 Emergency &amp; Crisis Support
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Behold provides scheduled professional counselling consultations and is not an emergency psychiatric crisis intervention service.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href="tel:112"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>National Emergency Services</span>
                <span className="text-rose-600">112</span>
              </a>
              <a
                href="tel:18005990019"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>KIRAN Mental Health Helpline</span>
                <span className="text-[#0E7490]">1800-599-0019</span>
              </a>
              <a
                href="tel:14416"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <span>Tele-MANAS Toll-Free</span>
                <span className="text-[#0E7490]">14416</span>
              </a>
            </div>
            <button
              type="button"
              onClick={() => setShowHelplineModal(false)}
              className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
