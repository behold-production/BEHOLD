import React from 'react';
import { User, Clock, Video, BarChart3, LogOut, X } from 'lucide-react';

const SidebarNav = ({
  user,
  profile,
  currentSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  setIsProfileDrawerOpen,
  handleNavClick,
  setIsLogoutConfirmOpen
}) => {
  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Fixed Sidebar */}
      <div className={`fixed lg:sticky lg:top-0 h-screen lg:h-screen overflow-hidden inset-y-0 left-0 z-50 w-64 lg:w-64 bg-white border-r border-zinc-200 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:flex shadow-sm lg:shadow-none`}>
        <div className="flex flex-col flex-1 min-h-0 space-y-6">
          {/* Logo & Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-header font-bold text-lg tracking-tighter text-zinc-900">
                BEHOLD<span className="text-brand font-bold">.</span>
              </span>
            </div>
            {/* Close Button inside Drawer (Mobile Only) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer border-none"
              title="Close Navigation Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User profile details — click to open drawer */}
          <button
            type="button"
            onClick={() => setIsProfileDrawerOpen(true)}
            className="w-full flex items-center gap-3 bg-zinc-50 hover:bg-zinc-100/80 p-3 rounded-xl border border-zinc-200/60 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-header font-bold text-sm border border-brand/20 shrink-0 overflow-hidden">
              {user?.profilePic ? (
                <img src={user.profilePic} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                (() => { const c = (profile?.name || '').trim(); return c.length > 1 ? (c[0] + c[c.length - 1]).toUpperCase() : c.toUpperCase() || 'ST'; })()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-zinc-900 truncate leading-tight capitalize font-header">
                {profile.name || 'Counsellor'}
              </h4>
              <span className="text-xs text-zinc-500 font-medium capitalize truncate block">
                {profile.education || 'Consultant'}
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-200 hover:scrollbar-thumb-zinc-300">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'profile', label: 'Consultant Profile', icon: User },
              { id: 'availability', label: 'Manage Timings', icon: Clock },
              { id: 'bookings', label: 'Client Bookings', icon: Video }
            ].map(sec => {
              const Icon = sec.icon;
              const isActive = currentSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => handleNavClick(sec.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all text-left cursor-pointer border-none ${
                    isActive
                      ? 'bg-brand text-zinc-900 shadow-sm'
                      : 'bg-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 mt-6 lg:mt-0">
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2.5 border border-rose-200 hover:border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-sm capitalize rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Exit Console
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarNav;
