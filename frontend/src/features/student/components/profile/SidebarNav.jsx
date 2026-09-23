import React, { useState } from 'react';
import { Bell, LayoutDashboard, User, Calendar, BarChart3, LogOut, Phone } from 'lucide-react';
import { TABS } from '../../utils/studentProfileConstants';
import { useAuth } from '../../../../context/AuthContext';
import LogoutConfirmModal from '../../../../components/common/LogoutConfirmModal';

const ICON_MAP = {
  LayoutDashboard,
  User,
  Calendar,
  BarChart3
};

const SidebarNav = ({ currentSection, handleSectionChange, bookedSessions, testProfile, enableAptitude }) => {
  const { logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const visibleTabs = TABS.filter(tab => {
    if (tab.id === 'results' && enableAptitude === false) return false;
    return true;
  });

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col p-5 bg-white border border-slate-200 rounded-[20px] shadow-md sticky top-32 max-h-[calc(100vh-130px)] overflow-y-auto overscroll-contain scrollbar-hide">
        <div className="space-y-2 flex-1">
          {visibleTabs.map(tab => {
            const Icon = ICON_MAP[tab.iconName];
            const isActive = currentSection === tab.id;
            const badge =
              tab.id === 'booked' ? bookedSessions.length :
              tab.id === 'results' && !testProfile ? '!' : null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'bg-[#00e5ff] text-white scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-slate-50' : 'bg-slate-500 group-hover:bg-[#00e5ff]'} transition-colors`} />
                <span className="flex-1 text-left text-[15px]">{tab.label}</span>
                {badge !== null && badge !== 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-slate-50 text-[#00e5ff]'
                      : tab.id === 'results' && !testProfile
                      ? 'bg-whitember-500/20 text-amber-400 animate-pulse'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <hr className="border-slate-100 my-6" />

        {/* Emergency Support Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 text-left">
          <h4 className="text-rose-500 font-bold text-[14px] flex items-center gap-2 mb-2">
            <span className="animate-pulse">🚨</span> 24/7 Crisis Support
          </h4>
          <p className="text-slate-600 text-xs mb-4 leading-relaxed">
            If you need immediate help, our emergency hotline is open.
          </p>
          <a href="tel:911" className="block w-full text-center px-4 py-2.5 bg-slate-50 border border-rose-500/50 text-rose-500 text-sm font-bold rounded-xl hover:bg-rose-500/10 transition-colors">
            Call Helpline Now
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={() => setIsLogoutOpen(true)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 group"
        >
          <span className="flex-1 text-left text-[15px]">Sign Out</span>
        </button>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-slate-100 pb-[calc(env(safe-area-inset-bottom,0px)+4px)]">
        <div className="grid max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${visibleTabs.length + 1}, minmax(0, 1fr))` }}>
          {visibleTabs.map(tab => {
            const Icon = ICON_MAP[tab.iconName];
            const isActive = currentSection === tab.id;
            const badge = tab.id === 'booked' ? bookedSessions.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1.5 min-h-[64px] py-2 px-1 transition-colors ${
                  isActive ? 'text-[#00e5ff]' : 'text-slate-500'
                }`}
              >
                <div className="relative">
                  {Icon && <Icon className="w-5 h-5" />}
                  {badge !== null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[9px] font-bold px-1.5 min-w-[16px] h-4 rounded-full bg-[#00e5ff] text-[#030712] flex items-center justify-center shadow-sm">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold tracking-widest truncate max-w-full">{tab.short}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#00e5ff] rounded-b-md shadow-sm" />
                )}
              </button>
            );
          })}
          
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1.5 min-h-[64px] py-2 px-1 transition-colors text-rose-500 hover:text-rose-400 cursor-pointer border-none bg-transparent"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold tracking-widest truncate max-w-full">Logout</span>
          </button>
        </div>
      </nav>

      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          logout();
          setIsLogoutOpen(false);
        }}
      />
    </>
  );
};

export default SidebarNav;
