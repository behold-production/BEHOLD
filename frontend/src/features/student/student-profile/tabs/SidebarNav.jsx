import React from 'react';
import { Bell, LayoutDashboard, User, Calendar, BarChart3 } from 'lucide-react';
import { TABS } from '../studentProfileConstants';

const ICON_MAP = {
  LayoutDashboard,
  User,
  Calendar,
  BarChart3
};

const SidebarNav = ({ currentSection, handleSectionChange, bookedSessions, testProfile }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:flex flex-col gap-0.5 p-1.5 card-luxury border-none rounded-xl shadow-sm sticky top-24">
        {TABS.map(tab => {
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
              className={`relative flex items-center gap-2.5 px-3 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${isActive
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
            >
              {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-600'}`} />}
              <span className="flex-1 text-left">{tab.label}</span>
              {badge !== null && badge !== 0 && (
                <span className={`text-xs font-semibold px-1.5 min-w-[20px] h-5 rounded-full flex items-center justify-center ${isActive
                  ? 'bg-white/20 text-white'
                  : tab.id === 'results' && !testProfile
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-zinc-100 text-zinc-600'
                  }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-2 mx-1 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-700">Need help?</span>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Data securely synced in Cloud. Contact your coordinator for support.
          </p>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200">
        <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
          {TABS.map(tab => {
            const Icon = ICON_MAP[tab.iconName];
            const isActive = currentSection === tab.id;
            const badge =
              tab.id === 'booked' ? bookedSessions.length : null;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSectionChange(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors ${isActive ? 'text-zinc-900' : 'text-zinc-400'
                  }`}
              >
                <div className="relative">
                  {Icon && <Icon className="w-5 h-5" />}
                  {badge !== null && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 text-xs font-bold px-1 min-w-[14px] h-3.5 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium capitalize tracking-wide truncate max-w-full">{tab.short}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-zinc-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default SidebarNav;
