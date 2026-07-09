import React, { useState } from 'react';
import { Bell, LayoutDashboard, User, Calendar, BarChart3, LogOut } from 'lucide-react';
import { TABS } from '../studentProfileConstants';
import { useAuth } from '../../../../shared/context/AuthContext';
import LogoutConfirmModal from '../../../../shared/components/LogoutConfirmModal';

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
 <nav className="hidden lg:flex flex-col gap-0.5 p-1.5 bg-white border border-surface-200 rounded-[10px] shadow-square-light sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden">
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
 className={`relative flex items-center gap-2.5 px-3 min-h-[44px] rounded-[10px] text-xs font-bold tracking-widest transition-all duration-150 group cursor-pointer ${isActive
 ? 'bg-[#00E5FF] text-[#0a121e] font-black shadow-[0_4px_15px_rgba(0,229,255,0.28)]'
 : 'text-surface-600 hover:bg-[#00E5FF]/15 hover:text-[#0a121e]'
 }`}
 >
 {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0a121e]' : 'text-surface-400 group-hover:text-[#0a121e]'}`} />}
 <span className="flex-1 text-left">{tab.label}</span>
 {badge !== null && badge !== 0 && (
 <span className={`text-[10px] font-black px-1.5 min-w-[20px] h-5 rounded-[10px] flex items-center justify-center ${isActive
 ? 'bg-[#0a121e] text-[#00E5FF]'
 : tab.id === 'results' && !testProfile
 ? 'bg-amber-100 text-amber-700'
 : 'bg-surface-100 text-surface-600'
 }`}>
 {badge}
 </span>
 )}
 </button>
 );
 })}

 <div className="mt-2 mx-1 p-3 bg-surface-50 border border-surface-200 rounded-[10px]">
 <div className="flex items-center gap-2 mb-1">
 <Bell className="w-3.5 h-3.5 text-surface-400" />
 <span className="text-[10px] tracking-widest font-bold text-surface-700">Need help?</span>
 </div>
 <p className="text-xs text-surface-500 leading-relaxed">
 Data securely synced in Cloud. Contact your coordinator for support.
 </p>
 </div>

 <button
 onClick={() => setIsLogoutOpen(true)}
 className="mt-2 mx-1 flex items-center gap-2.5 px-3 min-h-[44px] rounded-[10px] text-xs font-bold tracking-widest transition-all duration-150 cursor-pointer text-red-600 hover:bg-red-50 border-none bg-transparent group"
 >
 <LogOut className="w-4 h-4 shrink-0 text-red-400 group-hover:text-red-600" />
 <span className="flex-1 text-left">Sign Out</span>
 </button>
 </nav>

 {/* Mobile bottom tab bar */}
 <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200">
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
 className={`relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors ${isActive ? 'text-surface-900' : 'text-surface-400'

 }`}
 >
 <div className="relative">
 {Icon && <Icon className="w-5 h-5" />}
 {badge !== null && badge > 0 && (
 <span className="absolute -top-1.5 -right-2 text-[10px] font-black px-1 min-w-[14px] h-3.5 rounded-[10px] bg-surface-900 text-white flex items-center justify-center">
 {badge}
 </span>
 )}
 </div>
 <span className="text-[10px] font-bold tracking-widest truncate max-w-full">{tab.short}</span>
 {isActive && (
 <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-surface-900 rounded-[10px]" />
 )}
 </button>
 );
 })}
 
 <button
 type="button"
 onClick={() => setIsLogoutOpen(true)}
 className="relative flex flex-col items-center justify-center gap-1 min-h-[60px] py-2 px-1 transition-colors text-red-500 hover:text-red-600 cursor-pointer border-none bg-transparent"
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
