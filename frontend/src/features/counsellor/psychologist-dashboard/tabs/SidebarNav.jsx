import React from 'react';
import { User, Clock, Video, BarChart3, LogOut, X, CreditCard } from 'lucide-react';

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
 <div className={`fixed lg:sticky lg:top-0 h-screen lg:h-screen overflow-hidden inset-y-0 left-0 z-50 w-64 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
 isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
 } lg:flex shadow-sm lg:shadow-none`}>
 <div className="flex flex-col flex-1 min-h-0 space-y-6">
 {/* Logo & Header */}
 <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
 <div className="flex items-center gap-2">
 <span className="font-header font-bold text-lg tracking-tighter text-white">
 BEHOLD<span className="text-brand font-bold">.</span>
 </span>
 </div>
 {/* Close Button inside Drawer (Mobile Only) */}
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(false)}
 className="lg:hidden p-1.5 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-[10px] transition-colors cursor-pointer border-none"
 title="Close Navigation Drawer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* User profile details — click to open drawer */}
 <button
 type="button"
 onClick={() => setIsProfileDrawerOpen(true)}
 className="w-full flex items-center gap-3 bg-zinc-955/60 hover:bg-zinc-950 p-3 rounded-[10px] border border-zinc-850 hover:border-brand/30 transition-all cursor-pointer text-left"
 >
 <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-bold text-sm shrink-0 overflow-hidden">
 {(profile.profilePic || user?.profilePic || profile.image || user?.image) ? (
 <img src={profile.profilePic || user?.profilePic || profile.image || user?.image} alt={profile.name} className="w-full h-full object-cover" />
 ) : (
 (() => { const c = (profile?.name || '').trim(); return c.length > 1 ? (c[0] + c[c.length - 1]).toUpperCase() : c.toUpperCase() || 'ST'; })()
 )}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-bold text-white truncate leading-tight font-header">
 {profile.name || 'Counsellor'}
 </h4>
 <span className="text-xs text-zinc-500 font-bold truncate block">
 {profile.education || 'Consultant'}
 </span>
 </div>
 </button>

 {/* Nav Links organized into categories with clean typography */}
 <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2.5 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
 {(() => {
 const categories = [
 {
 title: "Core Console",
 items: [
 { id: 'overview', label: 'Overview', icon: BarChart3 },
 { id: 'revenue', label: 'Revenue Console', icon: CreditCard }
 ]
 },
 {
 title: "My Workspace",
 items: [
 { id: 'profile', label: 'Consultant Profile', icon: User },
 { id: 'availability', label: 'Manage Timings', icon: Clock },
 { id: 'bookings', label: 'Client Bookings', icon: Video }
 ]
 }
 ];

 return categories.map((cat, catIdx) => (
 <div key={catIdx} className="space-y-1 mt-3 first:mt-0">
 <div className="text-[10px] font-bold text-zinc-500 tracking-widest px-3.5 mb-1.5 mt-2">
 {cat.title}
 </div>
 {cat.items.map(item => {
 const Icon = item.icon;
 const isActive = currentSection === item.id;

 return (
 <button
 key={item.id}
 onClick={() => handleNavClick(item.id)}
 className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-[13px] transition-all text-left cursor-pointer border-none ${
 isActive
 ? 'bg-brand text-zinc-955 font-semibold shadow-sm'
 : 'bg-transparent text-zinc-450 hover:text-white hover:bg-zinc-850/60 font-medium'
 }`}
 >
 <Icon className="w-4 h-4 shrink-0" />
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>
 ));
 })()}
 </nav>
 </div>

 {/* Sidebar Footer */}
 <div className="space-y-4 pt-4 border-t border-zinc-800 mt-6 lg:mt-0">
 <button
 onClick={() => setIsLogoutConfirmOpen(true)}
 className="w-full py-2 border border-rose-900/50 hover:border-rose-650 text-rose-500 bg-rose-955/20 hover:bg-rose-900/40 hover:text-white font-semibold text-xs rounded-[10px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" /> Exit Console
 </button>
 </div>
 </div>
 </>
 );
};

export default SidebarNav;
