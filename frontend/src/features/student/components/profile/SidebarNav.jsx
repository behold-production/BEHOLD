import React, { useState } from 'react';
import { LayoutDashboard, User, Calendar, LogOut } from 'lucide-react';
import { TABS } from '../../utils/studentProfileConstants';
import { useAuth } from '../../../../context/AuthContext';
import LogoutConfirmModal from '../../../../components/common/LogoutConfirmModal';

const ICON_MAP = {
  LayoutDashboard,
  Calendar,
  User
};

const SidebarNav = ({ currentSection, handleSectionChange, bookedSessions = [] }) => {
  const { logout } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col gap-1.5 p-3.5 bg-white border border-[#e6dfd0] rounded-2xl shadow-xs sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden">
        <div className="px-3 pt-1 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#7c8785]">Menu</p>
        </div>

        {TABS.map(tab => {
          const Icon = ICON_MAP[tab.iconName];
          const isActive = currentSection === tab.id;
          const badge = tab.id === 'booked' ? bookedSessions.length : null;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSectionChange(tab.id)}
              className={`relative flex items-center gap-3 px-4 min-h-[46px] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 group cursor-pointer border ${
                isActive
                  ? 'bg-[#0e1111] text-white border-[#0e7490]/40 shadow-xs scale-[1.01]'
                  : 'text-[#55605f] hover:bg-[#f6f1e6] hover:text-[#0e1111] border-transparent'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#0e7490]' : 'text-[#7c8785] group-hover:text-[#0e1111]'
                  }`}
                />
              )}
              <span className="flex-1 text-left">{tab.label}</span>
              {badge !== null && badge > 0 && (
                <span
                  className={`text-[10px] font-semibold px-2 min-w-[20px] h-5 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-[#0e7490] text-white' : 'bg-[#f1eadc] text-[#0e1111]'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="my-2 border-t border-[#f1eadc]" />

        <button
          onClick={() => setIsLogoutOpen(true)}
          className="flex items-center gap-3 px-4 min-h-[44px] rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 group"
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-[#e6dfd0] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+2px)]">
        <div className="grid max-w-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${TABS.length + 1}, minmax(0, 1fr))` }}>
          {TABS.map(tab => {
            const Icon = ICON_MAP[tab.iconName];
            const isActive = currentSection === tab.id;
            const badge = tab.id === 'booked' ? bookedSessions.length : null;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors cursor-pointer border-none bg-transparent ${
                  isActive ? 'text-[#0e1111]' : 'text-[#9aa29f]'
                }`}
              >
                <div className="relative">
                  {Icon && <Icon className="w-5 h-5" />}
                  {badge !== null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-[10px] font-semibold px-1 min-w-[14px] h-3.5 rounded-full bg-[#0e1111] text-white flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold tracking-wider truncate max-w-full">{tab.short}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0e1111] rounded-full" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            className="relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors text-rose-500 hover:text-rose-600 cursor-pointer border-none bg-transparent"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-wider truncate max-w-full">Sign Out</span>
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
