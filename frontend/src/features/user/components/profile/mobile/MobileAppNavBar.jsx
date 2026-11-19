import React from 'react';
import { createPortal } from 'react-dom';
import { Home, Calendar, FileText, User } from 'lucide-react';

/**
 * MobileAppNavBar
 * Bottom Navigation Bar matching CarePro flutter app (AppNavBar)
 * Fixed to the bottom on mobile viewports with clean tab indicator pills.
 */
export default function MobileAppNavBar({ activeTab = 0, onTabChange, upcomingCount = 0 }) {
  const navItems = [
    { id: 0, label: 'Home', icon: Home },
    { id: 1, label: 'Appointments', icon: Calendar, badge: upcomingCount > 0 ? upcomingCount : null },
    { id: 2, label: 'Records', icon: FileText },
    { id: 3, label: 'Profile', icon: User },
  ];

  const content = (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] md:hidden"
      style={{ paddingBottom: 'max(0.65rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-around px-3 py-1.5">
        {navItems.map((item) => {
          const isSelected = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer border-none bg-transparent ${
                isSelected
                  ? 'text-[#0E7490] font-semibold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isSelected ? 'bg-[#0E7490]/10 text-[#0E7490]' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isSelected ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />

                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] tracking-tight mt-0.5 ${isSelected ? 'font-bold text-[#0E7490]' : 'text-slate-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}
