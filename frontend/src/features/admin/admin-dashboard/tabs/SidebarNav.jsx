import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { X, Menu, User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, ChevronRight, ChevronLeft, Mail, Shield, Brain, Download, FileText, Eye, EyeOff, Bell, Send, CreditCard } from 'lucide-react';

export default function SidebarNav(props) {
 const {
 isMobileMenuOpen, setIsMobileMenuOpen, setIsProfileDrawerOpen, user, isSuperAdmin, parseStaffDetails, handleNavClick, currentSection, logout, isLogoutConfirmOpen, setIsLogoutConfirmOpen, hasUserPermission, hasPsyPermission, hasBookingPermission
 } = props;

 return (
 <>
 <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-zinc-900 border-b border-zinc-805 px-5 py-4 w-full">
 <div className="flex items-center gap-3">
 {/* Hamburger Menu Icon */}
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
 className="p-1.5 bg-zinc-955 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
 title={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
 >
 {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
 </button>

 <div className="flex items-center gap-1.5">
 <span className="font-header font-bold text-base tracking-tighter text-white">
 BEHOLD<span className="text-brand font-bold">.</span>
 </span>
 <span className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-400 px-1 py-0.2 rounded font-bold ">
 CONSOLE
 </span>
 </div>
 </div>

 {/* Profile Icon / Trigger */}
 <button
 type="button"
 onClick={() => setIsProfileDrawerOpen(true)}
 className="w-8 h-8 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white hover:border-brand/30 flex items-center justify-center shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all shrink-0"
 title="Open Profile Menu"
 >
 <User className="w-4 h-4 text-brand" />
 </button>
 </div>

 {/* Mobile Sidebar Backdrop (Overlay) */}
 {isMobileMenuOpen && (
 <div
 className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
 onClick={() => setIsMobileMenuOpen(false)}
 />
 )}

 {/* 1. Left Fixed Sidebar (Drawer on Mobile, static on Desktop) */}
 <div className={`fixed lg:sticky lg:top-0 h-screen lg:h-screen overflow-hidden inset-y-0 left-0 z-50 w-64 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between shrink-0 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
 <div className="flex flex-col flex-1 min-h-0 space-y-6">
 {/* Logo & Header */}
 <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
 <div className="flex items-center gap-2">
 <span className="font-header font-bold text-lg tracking-tighter text-white">
 BEHOLD<span className="text-brand font-bold">.</span>
 </span>
 <span className="text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded font-bold ">
 CONSOLE
 </span>
 </div>
 {/* Close Button inside Drawer (Mobile Only) */}
 <button
 type="button"
 onClick={() => setIsMobileMenuOpen(false)}
 className="lg:hidden p-1 bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer border-none"
 title="Close Navigation Drawer"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* User profile details — click to open drawer */}
 {(() => {
 const { cleanName, roleTitle } = parseStaffDetails(user);
 return (
 <button
 type="button"
 onClick={() => setIsProfileDrawerOpen(true)}
 className="w-full flex items-center gap-3 bg-zinc-955/60 hover:bg-zinc-950 p-3 rounded-xl border border-zinc-850 hover:border-brand/30 transition-all cursor-pointer text-left"
 >
 <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-accent text-zinc-955 flex items-center justify-center font-header font-bold text-sm shrink-0">
 {(cleanName || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="text-sm font-semibold text-white truncate leading-tight ">
 {cleanName}
 </h4>
 <span className="text-xs text-zinc-550 font-bold ">
 {isSuperAdmin ? 'SUPER ADMIN' : (roleTitle || 'SUB ADMIN')}
 </span>
 </div>
 </button>
 );
 })()}

 {/* Nav Links organized into categories with cleaner font weights */}
 <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto pr-2.5 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700">
 {(() => {
 const categories = [
 {
 title: "Core Console",
 items: [
 { id: 'overview', label: 'Overview', icon: BarChart3, visible: isSuperAdmin },
 { id: 'analytics', label: 'Analytics Console', icon: BarChart3, visible: isSuperAdmin },
 { id: 'revenue', label: 'Revenue Console', icon: CreditCard, visible: isSuperAdmin },
 ]
 },
 {
 title: "User Directories",
 items: [
 { id: 'users', label: 'Student Database', icon: User, visible: hasUserPermission },
 { id: 'psychologists', label: 'Psychologists DB', icon: Award, visible: hasPsyPermission },
 { id: 'subadmins', label: 'Roles & Scopes', icon: KeyRound, visible: isSuperAdmin },
 ]
 },
 {
 title: "Operations",
 items: [
 { id: 'bookings', label: 'Client Bookings', icon: Calendar, visible: hasBookingPermission },
 { id: 'refunds', label: 'Refund Requests', icon: ShieldAlert, visible: isSuperAdmin },
 ]
 },
 {
 title: "Academics & Helpdesk",
 items: [
 { id: 'aptitude', label: 'Aptitude Questions', icon: Brain, visible: isSuperAdmin },
 { id: 'testresults', label: 'Aptitude Results', icon: FileSpreadsheet, visible: isSuperAdmin },
 { id: 'inquiries', label: 'Student Inquiries', icon: MessageSquare, visible: isSuperAdmin },
 { id: 'faqs', label: 'FAQ Manager', icon: HelpCircle, visible: isSuperAdmin },
 ]
 },
 {
 title: "System settings",
 items: [
 { id: 'settings', label: 'Site Settings', icon: Settings, visible: isSuperAdmin },
 { id: 'trash', label: 'Trash', icon: Trash, visible: isSuperAdmin, isTrash: true },
 ]
 }
 ];

 return categories.map((cat, catIdx) => {
 const visibleItems = cat.items.filter(item => item.visible);
 if (visibleItems.length === 0) return null;

 return (
 <div key={catIdx} className="space-y-1 mt-3 first:mt-0">
 <div className="text-[10px] font-bold text-zinc-550 tracking-widest px-3.5 mb-1.5 mt-2">
 {cat.title}
 </div>
 {visibleItems.map(item => {
 const Icon = item.icon;
 const isActive = currentSection === item.id;

 const btnClass = item.isTrash
 ? (isActive
 ? 'bg-rose-955/30 border border-rose-905 text-rose-455 font-semibold'
 : 'bg-transparent text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 font-medium')
 : (isActive
 ? 'bg-brand text-zinc-955 font-semibold shadow-sm'
 : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-850/60 font-medium');

 return (
 <button
 key={item.id}
 onClick={() => handleNavClick(item.id)}
 className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] transition-all text-left cursor-pointer border-none ${btnClass}`}
 >
 <Icon className="w-4 h-4 shrink-0" />
 <span>{item.label}</span>
 </button>
 );
 })}
 </div>
 );
 });
 })()}
 </nav>
 </div>

 {/* Sidebar Footer */}
 <div className="space-y-4 pt-4 border-t border-zinc-800 mt-auto shrink-0">
 <button
 onClick={() => setIsLogoutConfirmOpen(true)}
 className="w-full py-2 border border-rose-900/50 hover:border-rose-600 text-rose-500 bg-rose-950/20 hover:bg-rose-900 hover:text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" /> Sign Out Portal
 </button>
 </div>
 </div>
 </>
 );
}