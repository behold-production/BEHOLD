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
 <nav className="hidden lg:flex flex-col gap-1.5 p-3 bg-white border border-slate-200/80 rounded-lg shadow-md sticky top-24 max-h-[calc(100vh-110px)] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden">
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
 className={`relative flex items-center gap-3 px-4 min-h-[46px] rounded-lg text-xs font-bold tracking-wider transition-all duration-200 group cursor-pointer border-0 ${
 isActive
 ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black shadow-lg shadow-blue-500/25 scale-[1.02]'
 : 'text-slate-600 hover:bg-slate-100/80 hover:text-blue-600'
 }`}
 >
 {Icon && <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />}
 <span className="flex-1 text-left">{tab.label}</span>
 {badge !== null && badge !== 0 && (
 <span className={`text-[10px] font-black px-2 min-w-[20px] h-5 rounded-full flex items-center justify-center ${
 isActive
 ? 'bg-white text-blue-600 shadow-xs'
 : tab.id === 'results' && !testProfile
 ? 'bg-amber-100 text-amber-700 font-black animate-pulse'
 : 'bg-slate-100 text-slate-600'
 }`}>
 {badge}
 </span>
 )}
 </button>
 );
 })}

 <div className="mt-3 mx-1 p-4 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/50 border border-blue-200/80 rounded-lg shadow-xs">
 <div className="flex items-center gap-2 mb-1.5">
 <div className="w-6 h-6 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
 <Bell className="w-3.5 h-3.5 text-blue-600" />
 </div>
 <span className="text-[10px] tracking-wider font-extrabold text-slate-900 uppercase">Need help?</span>
 </div>
 <p className="text-xs text-slate-600 leading-relaxed font-medium">
 Data securely synced in Cloud. Contact your coordinator for guidance & support.
 </p>
 </div>

 <button
 onClick={() => setIsLogoutOpen(true)}
 className="mt-1 mx-1 flex items-center gap-3 px-4 min-h-[44px] rounded-lg text-xs font-bold tracking-wider transition-all duration-150 cursor-pointer text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 group"
 >
 <LogOut className="w-4 h-4 shrink-0 text-rose-500 group-hover:scale-110 transition-transform" />
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
