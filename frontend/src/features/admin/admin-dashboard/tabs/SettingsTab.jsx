import React, { useState } from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send, Loader2 } from 'lucide-react';

const isNotificationSupported = () => 'Notification' in window;

export default function SettingsTab(props) {
 const {
 currentSection,
 setCurrentSection,
 permissionState,
 setPermissionState,
 announcementTitle,
 setAnnouncementTitle,
 announcementMessage,
 setAnnouncementMessage,
 announcementRole,
 setAnnouncementRole,
 isSendingAnnouncement,
 setIsSendingAnnouncement,
 activeStatHighlight,
 setActiveStatHighlight,
 overviewActivityTab,
 setOverviewActivityTab,
 selectedOverviewBooking,
 setSelectedOverviewBooking,
 isScanning,
 setIsScanning,
 scanProgress,
 setScanProgress,
 scanResults,
 setScanResults,
 usersDb,
 setUsersDb,
 bookingsDb,
 setBookingsDb,
 inquiriesDb,
 setInquiriesDb,
 testResultsDb,
 setTestResultsDb,
 faqsDb,
 setFaqsDb,
 aptitudeQuestionsDb,
 setAptitudeQuestionsDb,
 rolesDb,
 setRolesDb,
 isDbLoading,
 setIsDbLoading,
 newRoleName,
 setNewRoleName,
 newRoleDescription,
 setNewRoleDescription,
 editingRoleId,
 setEditingRoleId,
 activeRoleTab,
 setActiveRoleTab,
 newRolePermissions,
 setNewRolePermissions,
 roleError,
 setRoleError,
 roleSuccess,
 setRoleSuccess,
 roleToDelete,
 setRoleToDelete,
 searchUser,
 setSearchUser,
 searchPsy,
 setSearchPsy,
 psyFilter,
 setPsyFilter,
 searchInquiry,
 setSearchInquiry,
 searchTestResult,
 setSearchTestResult,
 searchBooking,
 setSearchBooking,
 searchAptitude,
 setSearchAptitude,
 bookingStatusFilter,
 setBookingStatusFilter,
 studentPage,
 setStudentPage,
 studentLimit,
 setStudentLimit,
 psyPage,
 setPsyPage,
 psyLimit,
 setPsyLimit,
 bookingPage,
 setBookingPage,
 bookingLimit,
 setBookingLimit,
 inquiryPage,
 setInquiryPage,
 inquiryLimit,
 setInquiryLimit,
 aptitudePage,
 setAptitudePage,
 aptitudeLimit,
 setAptitudeLimit,
 isAddFaqOpen,
 setIsAddFaqOpen,
 isEditFaqOpen,
 setIsEditFaqOpen,
 faqForm,
 setFaqForm,
 faqFormError,
 setFaqFormError,
 faqFormSuccess,
 setFaqFormSuccess,
 isAddAptitudeOpen,
 setIsAddAptitudeOpen,
 isEditAptitudeOpen,
 setIsEditAptitudeOpen,
 aptitudeForm,
 setAptitudeForm,
 aptitudeFormError,
 setAptitudeFormError,
 aptitudeFormSuccess,
 setAptitudeFormSuccess,
 loginEmail,
 setLoginEmail,
 loginPassword,
 setLoginPassword,
 showPassword,
 setShowPassword,
 loginError,
 setLoginError,
 isLoggingIn,
 setIsLoggingIn,
 subAdminForm,
 setSubAdminForm,
 selectedPermissions,
 setSelectedPermissions,
 subAdminError,
 setSubAdminError,
 subAdminSuccess,
 setSubAdminSuccess,
 isRegistering,
 setIsRegistering,
 isAddUserOpen,
 setIsAddUserOpen,
 isEditUserOpen,
 setIsEditUserOpen,
 userForm,
 setUserForm,
 userFormError,
 setUserFormError,
 userFormSuccess,
 setUserFormSuccess,
 userProfilePicFile,
 setUserProfilePicFile,
 isUserPicUploading,
 setIsUserPicUploading,
 isAddPsyOpen,
 setIsAddPsyOpen,
 isEditPsyOpen,
 setIsEditPsyOpen,
 psyForm,
 setPsyForm,
 psyFormError,
 setPsyFormError,
 psyFormSuccess,
 setPsyFormSuccess,
 psyProfilePicFile,
 setPsyProfilePicFile,
 isPsyPicUploading,
 setIsPsyPicUploading,
 adminActiveDays,
 setAdminActiveDays,
 adminAvailableSlots,
 setAdminAvailableSlots,
 adminAllSlots,
 setAdminAllSlots,
 adminCustomHour,
 setAdminCustomHour,
 adminCustomMinute,
 setAdminCustomMinute,
 adminCustomPeriod,
 setAdminCustomPeriod,
 adminFromHour,
 setAdminFromHour,
 adminFromMinute,
 setAdminFromMinute,
 adminFromPeriod,
 setAdminFromPeriod,
 adminToHour,
 setAdminToHour,
 adminToMinute,
 setAdminToMinute,
 adminToPeriod,
 setAdminToPeriod,
 isAddBookingOpen,
 setIsAddBookingOpen,
 isEditBookingOpen,
 setIsEditBookingOpen,
 bookingForm,
 setBookingForm,
 bookingFormError,
 setBookingFormError,
 bookingFormSuccess,
 setBookingFormSuccess,
 viewingStudent,
 setViewingStudent,
 viewingPsychologist,
 setViewingPsychologist,
 editingSubAdmin,
 setEditingSubAdmin,
 adminCigiFile,
 setAdminCigiFile,
 adminCigiDate,
 setAdminCigiDate,
 adminCigiTime,
 setAdminCigiTime,
 adminCigiNote,
 setAdminCigiNote,
 adminCigiEditingId,
 setAdminCigiEditingId,
 isAdminCigiUploading,
 setIsAdminCigiUploading,
 isMobileMenuOpen,
 setIsMobileMenuOpen,
 editSubAdminRoleName,
 setEditSubAdminRoleName,
 editSubAdminPermissionsObj,
 setEditSubAdminPermissionsObj,
 editSubAdminError,
 setEditSubAdminError,
 editSubAdminSuccess,
 setEditSubAdminSuccess,
 selectedBookingIds,
 setSelectedBookingIds,
 settingsForm,
 setSettingsForm,
 settingsSuccess,
 setSettingsSuccess,
 isSavingSettings,
 inquiryNotesText,
 setInquiryNotesText,
 isProfileDrawerOpen,
 setIsProfileDrawerOpen,
 isLogoutConfirmOpen,
 setIsLogoutConfirmOpen,
 getPageNumbers,
 getLocalTodayString,
 handleExportPDF,
 handleExportImage,
 downloadPDFReceipt,
 downloadDiagnosticPDF,
 printTextSection,
 handleEnableNotifications,
 handleTestNotification,
 handleSendAnnouncement,
 handleAdminCigiUpload,
 handleAdminCigiDelete,
 handleAdminStartEditCigi,
 handleAdminCancelEditCigi,
 reloadData,
 getAdvisorSlotsForBookingForm,
 handleNavClick,
 handleAdminLogin,
 handleCreateUser,
 handleOpenEditUser,
 handleUpdateUser,
 handleDeleteUser,
 handleGenerateResetToken,
 handleCreateAptitudeQuestion,
 handleOpenEditAptitudeQuestion,
 handleUpdateAptitudeQuestion,
 handleDeleteAptitudeQuestion,
 parseAdminTimeToMinutes,
 formatAdminMinutesToTime,
 addAdminTimeRangeSlots,
 handleAddAdminCustomSlot,
 handleRemoveAdminSlot,
 toggleAdminDay,
 handleCreatePsy,
 handleOpenEditPsy,
 handleUpdatePsy,
 handleDeletePsy,
 handleRejectPsy,
 handleCreateBooking,
 handleOpenEditBooking,
 handleUpdateBooking,
 handleDeleteBooking,
 handleRoleChangeInForm,
 handleCreateRole,
 handleDeleteRole,
 handleDuplicateRole,
 executeDeleteRole,
 handleCreateSubAdmin,
 togglePermission,
 toggleNewRolePermission,
 toggleModuleAllPermissions,
 toggleChildAction,
 handleEditRoleClick,
 parseStaffDetails,
 handleResolveInquiry,
 handleDeleteInquiry,
 handleToggleStudentStatus,
 handleTogglePsyVerification,
 handleTogglePsyTopFive,
 handleSaveSettings,
 handleAddPromoCode,
 handleUpdatePromoCode,
 handleRemovePromoCode,
 handleRunSecurityCheck,
 handleOpenEditSubAdmin,
 handleEditSubAdminRoleChange,
 toggleEditSubAdminModuleAll,
 toggleEditSubAdminChildAction,
 handleSaveSubAdminPermissions,
 handleSaveInquiryNote,
 handleBulkClearResolvedInquiries,
 handleExportAptitudeResults,
 handleToggleSelectBooking,
 handleBulkBookingStatus,
 handleBulkDeleteBookings,
 handleDeleteTestResult,
 handleCreateFaq,
 handleOpenEditFaq,
 handleUpdateFaq,
 handleDeleteFaq,
 handleExportStudentsCSV,
 showAlert,
 showConfirm,
 showPrompt,
 user,
 login,
 register,
 logout,
 isLoading,
 getInitials,
 PRIVILEGE_MODULES,
 isSuperAdmin,
 hasBookingPermission
 } = props;

 const [activeSettingsTab, setActiveSettingsTab] = useState('general');

 const settingsTabs = [
 { id: 'general', label: 'General & Contact', icon: Settings },
 { id: 'landing', label: 'Landing Page Content', icon: Brain },
 { id: 'modes', label: 'Services & Session Modes', icon: Video },
 { id: 'payments', label: 'Payments & Taxation', icon: KeyRound },
 { id: 'security', label: 'Security & System', icon: ShieldCheck },
 { id: 'promo', label: 'Promo Codes', icon: FileSpreadsheet },
 { id: 'legal', label: 'Policies & Legal', icon: Shield }
 ];

 return (
 <>
 <div className="space-y-6 animate-in fade-in duration-200 text-sm">
 <div className="border-b border-zinc-800 pb-3">
 <h3 className="text-sm font-bold text-white font-header">Site Configuration Panel</h3>
 <p className="text-sm text-zinc-500 font-medium pt-1">Manage global landing page titles, support endpoints, and booking behavior</p>
 </div>

 <div className="flex flex-col md:flex-row gap-6 items-start">
 {/* Tabs Sidebar Nav */}
 <div className="w-full md:w-64 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0 border-b md:border-b-0 border-zinc-800/60 md:border-r md:border-zinc-800/60 md:pr-4 scrollbar-none flex-nowrap">
 {settingsTabs.map((tab) => {
 const Icon = tab.icon;
 const isActive = activeSettingsTab === tab.id;
 return (
 <button
 key={tab.id}
 type="button"
 onClick={() => setActiveSettingsTab(tab.id)}
 className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-155 border cursor-pointer select-none text-left w-auto md:w-full shrink-0 ${isActive
 ? 'bg-brand/10 border-brand/40 text-brand shadow-sm shadow-brand/5 md:border-l-4 md:border-l-brand'
 : 'bg-zinc-900/40 hover:bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
 }`}
 >
 <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-brand' : 'text-zinc-500'}`} />
 <span className="truncate">{tab.label}</span>
 </button>
 );
 })}
 </div>

 {/* Form / Content Panel */}
 <div className="flex-1 w-full min-w-0">
 {/* TAB 1: General & Contact */}
 {activeSettingsTab === 'general' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-6 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <Settings className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">General & Contact Settings</h4>
 </div>

 <div className="bg-zinc-950/20 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 Branding Details
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wider">Custom Site Brand Name</label>
 <input
 type="text"
 required
 value={settingsForm.siteName}
 onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. BEHOLD"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wider">Site Footer Copyright Notice</label>
 <input
 type="text"
 required
 value={settingsForm.siteCopyright}
 onChange={(e) => setSettingsForm({ ...settingsForm, siteCopyright: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. © 2026 Behold. All rights reserved."
 />
 </div>
 </div>
 </div>

 <div className="bg-zinc-955/20 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 Contact & Support Endpoints
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">WhatsApp Support Endpoint Link</label>
 <input
 type="url"
 required
 value={settingsForm.whatsapp}
 onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. https://wa.me/919497174011"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Contact Support Email Address</label>
 <input
 type="email"
 required
 value={settingsForm.contactEmail}
 onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. support@behold.com"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Contact Phone Number</label>
 <input
 type="text"
 required
 value={settingsForm.contactPhone || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. 9207 07 51 51"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Open Hours</label>
 <input
 type="text"
 required
 value={settingsForm.openHours || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, openHours: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. Open Hours: Mon - Sat: 9:00 AM - 9:00 PM"
 />
 </div>
 </div>
 </div>

 {/* Top Alert Banner Notice */}
 <div className="border border-zinc-800 p-5 rounded-xl space-y-4 bg-zinc-955/20">
 <div className="flex items-center justify-between gap-4">
 <div>
 <span className="text-sm font-bold text-zinc-300 block">System Banner Notification Bar</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">Display an alert message at the very top of all student-facing views.</span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.showBanner}
 onChange={(e) => setSettingsForm({ ...settingsForm, showBanner: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 {settingsForm.showBanner && (
 <div className="space-y-1 animate-in slide-in-from-top duration-200">
 <label className="text-xs font-bold text-zinc-400 ">Alert Message Text</label>
 <input
 type="text"
 value={settingsForm.bannerNotice}
 onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="Write dynamic alert banner message..."
 />
 </div>
 )}
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save General & Contact Settings</span>
 </button>
 </div>
 </form>
 )}

 {/* TAB 2: Landing Page Content */}
 {activeSettingsTab === 'landing' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-6 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <Brain className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Landing Page Content</h4>
 </div>

 {/* Hero Section */}
 <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-xl space-y-4">
 <div className="flex justify-between items-center">
 <h4 className="text-xs font-bold text-brand tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 Hero Carousel Slides
 </h4>
 <button
 type="button"
 onClick={() => {
 const newSlide = { image: '', title: '', subtitle: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' };
 setSettingsForm(prev => ({ ...prev, heroSlides: [...(prev.heroSlides || []), newSlide] }));
 }}
 className="px-3 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand rounded flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
 >
 <Plus className="w-3 h-3" />
 Add Slide
 </button>
 </div>
 
 <div className="space-y-4">
 {!(settingsForm.heroSlides?.length > 0) ? (
 <div className="p-4 border border-dashed border-zinc-700 rounded-lg text-center text-zinc-500 text-xs">
 No custom slides configured. Default fallback slides will be used on the landing page.
 </div>
 ) : (
 settingsForm.heroSlides.map((slide, index) => (
 <div key={index} className="p-4 border border-zinc-800 bg-zinc-900/60 rounded-lg space-y-4 shadow-sm">
 <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
 <span className="text-xs font-bold text-zinc-300">Slide {index + 1}</span>
 <div className="flex items-center gap-2">
 <button type="button" disabled={index === 0} onClick={() => {
 const newSlides = [...settingsForm.heroSlides];
 [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
 setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
 }} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer"><ChevronUp className="w-4 h-4 text-zinc-400" /></button>
 <button type="button" disabled={index === settingsForm.heroSlides.length - 1} onClick={() => {
 const newSlides = [...settingsForm.heroSlides];
 [newSlides[index + 1], newSlides[index]] = [newSlides[index], newSlides[index + 1]];
 setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
 }} className="p-1 hover:bg-zinc-800 rounded disabled:opacity-30 cursor-pointer"><ChevronDown className="w-4 h-4 text-zinc-400" /></button>
 <button type="button" onClick={() => {
 const newSlides = settingsForm.heroSlides.filter((_, i) => i !== index);
 setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
 }} className="p-1 hover:bg-red-500/20 rounded cursor-pointer"><Trash className="w-4 h-4 text-red-400" /></button>
 </div>
 </div>
 
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 ">Background Image / Video URL</label>
          <input type="url" value={slide.image || ''} onChange={(e) => {
            const newSlides = [...settingsForm.heroSlides];
            newSlides[index] = { ...newSlides[index], image: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none" placeholder="https://images.unsplash.com/photo-... or video.mp4" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-zinc-500">Heading (use {`{ }`} for highlight)</label>
            <span className="text-[9px] text-zinc-500">({120 - (slide.title || '').length} remaining)</span>
          </div>
          <input type="text" maxLength={120} value={slide.title || ''} onChange={(e) => {
            const newSlides = [...settingsForm.heroSlides];
            newSlides[index] = { ...newSlides[index], title: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none" placeholder="Bridging You To Your {True Growth.}" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-bold text-zinc-500">Description / Subtitle</label>
            <span className="text-[9px] text-zinc-500">({300 - (slide.subtitle || '').length} remaining)</span>
          </div>
          <textarea rows={2} maxLength={300} value={slide.subtitle || ''} onChange={(e) => {
            const newSlides = [...settingsForm.heroSlides];
            newSlides[index] = { ...newSlides[index], subtitle: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white resize-none outline-none" placeholder="Description text..." />
        </div>
      </div>
 </div>
 ))
 )}
 </div>
 </div>

    {/* Hero Section Global Buttons Customization */}
    <div className="bg-zinc-955/40 border border-zinc-800 p-5 rounded-xl space-y-4 mb-4">
      <h4 className="text-xs font-bold text-brand tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
        Hero Section Global Buttons Settings
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 p-3 border border-zinc-800/80 rounded bg-zinc-955/40">
          <span className="text-[10px] text-zinc-400 font-bold block mb-1">Primary Button (Left)</span>
          <input type="text" value={settingsForm.heroSlides?.[0]?.btn1Text || ''} onChange={(e) => {
            const newSlides = [...(settingsForm.heroSlides || [])];
            if (newSlides.length === 0) newSlides.push({ image: '', title: '', subtitle: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' });
            newSlides[0] = { ...newSlides[0], btn1Text: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none mb-2" placeholder="Button Text (e.g. Book A Session)" />
          <input type="text" value={settingsForm.heroSlides?.[0]?.btn1Link || ''} onChange={(e) => {
            const newSlides = [...(settingsForm.heroSlides || [])];
            if (newSlides.length === 0) newSlides.push({ image: '', title: '', subtitle: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' });
            newSlides[0] = { ...newSlides[0], btn1Link: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none" placeholder="Link Route (e.g. /booking)" />
        </div>
        
        <div className="space-y-2 p-3 border border-zinc-800/80 rounded bg-zinc-955/40">
          <span className="text-[10px] text-zinc-400 font-bold block mb-1">Secondary Button (Right)</span>
          <input type="text" value={settingsForm.heroSlides?.[0]?.btn2Text || ''} onChange={(e) => {
            const newSlides = [...(settingsForm.heroSlides || [])];
            if (newSlides.length === 0) newSlides.push({ image: '', title: '', subtitle: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' });
            newSlides[0] = { ...newSlides[0], btn2Text: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none mb-2" placeholder="Button Text (e.g. Explore Aptitude)" />
          <input type="text" value={settingsForm.heroSlides?.[0]?.btn2Link || ''} onChange={(e) => {
            const newSlides = [...(settingsForm.heroSlides || [])];
            if (newSlides.length === 0) newSlides.push({ image: '', title: '', subtitle: '', btn1Text: '', btn1Link: '', btn2Text: '', btn2Link: '' });
            newSlides[0] = { ...newSlides[0], btn2Link: e.target.value };
            setSettingsForm(prev => ({ ...prev, heroSlides: newSlides }));
          }} className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none" placeholder="Link Route (e.g. /aptitude-test)" />
        </div>
      </div>
    </div>

    {/* Career Mentoring Section */}
 <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-brand tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 Career Mentoring Card Customization
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Badge / Category</label>
 <input
 type="text"
 required
 value={settingsForm.careerBadge || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, careerBadge: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Title / Header</label>
 <input
 type="text"
 required
 value={settingsForm.careerTitle || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, careerTitle: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Subtitle / Hook</label>
 <input
 type="text"
 required
 value={settingsForm.careerSubtitle || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, careerSubtitle: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Button Text</label>
 <input
 type="text"
 required
 value={settingsForm.careerBtnText || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, careerBtnText: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="sm:col-span-2 space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Description</label>
 <textarea
 rows={3}
 required
 value={settingsForm.careerDesc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, careerDesc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 </div>
 </div>

 {/* Psychological Counselling Section */}
 <div className="bg-zinc-950/40 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-brand tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 Psychological Counselling Card Customization
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Badge / Category</label>
 <input
 type="text"
 required
 value={settingsForm.counselBadge || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, counselBadge: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Title / Header</label>
 <input
 type="text"
 required
 value={settingsForm.counselTitle || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, counselTitle: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Subtitle / Hook</label>
 <input
 type="text"
 required
 value={settingsForm.counselSubtitle || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, counselSubtitle: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Button Text</label>
 <input
 type="text"
 required
 value={settingsForm.counselBtnText || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, counselBtnText: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="sm:col-span-2 space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Description</label>
 <textarea
 rows={3}
 required
 value={settingsForm.counselDesc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, counselDesc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800/80 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 </div>
 </div>

 {/* What We Offer Section */}
 <div className="bg-zinc-955/40 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-brand tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 "What We Offer" Section Customization
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Section Title</label>
 <input
 type="text"
 required
 value={settingsForm.aboutTitle || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, aboutTitle: e.target.value })}
 className="w-full px-3.5 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Section Subheading</label>
 <input
 type="text"
 required
 value={settingsForm.aboutSub || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, aboutSub: e.target.value })}
 className="w-full px-3.5 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 />
 </div>

 <div className="sm:col-span-2 border-t border-zinc-800/80 pt-4 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Offer 1 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 01</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer1Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer1Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer1Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer1Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 {/* Offer 2 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 02</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer2Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer2Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer2Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer2Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 {/* Offer 3 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 03</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer3Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer3Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer3Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer3Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 {/* Offer 4 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 04</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer4Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer4Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer4Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer4Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 {/* Offer 5 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 05</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer5Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer5Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer5Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer5Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 {/* Offer 6 */}
 <div className="space-y-2 border border-zinc-800/40 p-3 rounded-lg bg-zinc-950/20">
 <h5 className="font-bold text-zinc-500 text-xs">Card 06</h5>
 <input
 type="text"
 required
 placeholder="Title"
 value={settingsForm.offer6Title || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer6Title: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold mb-2 transition-colors"
 />
 <textarea
 rows={2}
 required
 placeholder="Description"
 value={settingsForm.offer6Desc || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, offer6Desc: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 />
 </div>
 </div>
 </div>
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Landing Page Content</span>
 </button>
 </div>
 </form>
 )}

 {/* TAB 3: Services & Session Modes */}
 {activeSettingsTab === 'modes' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-6 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <Video className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Services & Session Modes</h4>
 </div>
 {/* Feature Toggles */}
 <div className="border border-zinc-800 p-5 rounded-xl space-y-4 bg-zinc-955/20">
 <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/40">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Psychological Counselling</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, psychological counselling services will be hidden from the public website.</span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enablePsychology}
 onChange={(e) => setSettingsForm({ ...settingsForm, enablePsychology: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/40">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Career Mentoring</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, career mentoring services will be hidden from the public website.</span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enableCareerMentoring !== false}
 onChange={(e) => setSettingsForm({ ...settingsForm, enableCareerMentoring: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/40">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Aptitude Test & Services</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, CDAT Aptitude sessions and career aptitude buttons will be hidden from the public website.</span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enableAptitude}
 onChange={(e) => setSettingsForm({ ...settingsForm, enableAptitude: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/40">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Online Sessions (Video Call)</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, Online / Video booking options will be disabled and hidden everywhere.</span>
 </div>
 <label className="relative inline-flex inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enableOnline}
 onChange={(e) => setSettingsForm({ ...settingsForm, enableOnline: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 <div className="flex items-center justify-between gap-4 py-2 border-b border-zinc-800/40">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Offline Sessions (At Center)</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, Offline At Center booking options will be disabled and hidden everywhere.</span>
 </div>
 <label className="relative inline-flex inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enableOffline}
 onChange={(e) => setSettingsForm({ ...settingsForm, enableOffline: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 <div className="flex items-center justify-between gap-4 py-2">
 <div>
 <span className="text-sm font-bold text-brand block">Enable Doorstep Sessions (Home Visit)</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">If disabled, Doorstep Home Visit booking options will be disabled and hidden everywhere.</span>
 </div>
 <label className="relative inline-flex inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.enableDoorstep}
 onChange={(e) => setSettingsForm({ ...settingsForm, enableDoorstep: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Services & Session Modes</span>
 </button>
 </div>
 </form>
 )}

 {/* TAB 4: Payments & Taxation */}
 {activeSettingsTab === 'payments' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-6 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <KeyRound className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Payments & Taxation</h4>
 </div>

 {/* GST / Tax Configuration */}
 <div className="bg-zinc-955/20 border border-zinc-800 rounded-xl p-5 space-y-4">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
 Tax / GST Configuration
 </h4>

 <div className="flex items-center justify-between gap-4">
 <div>
 <span className="text-sm font-bold text-brand block">Enable GST on Bookings</span>
 <span className="text-xs text-zinc-500 block font-medium mt-1 leading-relaxed">When enabled, GST will be applied to the session fee on the booking checkout page.</span>
 </div>
 <label className="relative inline-flex items-center cursor-pointer shrink-0">
 <input
 type="checkbox"
 checked={settingsForm.gstEnabled}
 onChange={(e) => setSettingsForm({ ...settingsForm, gstEnabled: e.target.checked })}
 className="sr-only peer"
 />
 <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
 </label>
 </div>

 {settingsForm.gstEnabled && (
 <div className="space-y-1 max-w-xs animate-in slide-in-from-top-2 duration-200 pt-2">
 <label className="text-xs font-bold text-zinc-400 ">GST Percentage (%)</label>
 <input
 type="number"
 min={0}
 max={100}
 step={0.5}
 value={settingsForm.gstPercent}
 onChange={(e) => {
 let val = parseFloat(e.target.value);
 if (isNaN(val)) val = 0;
 if (val < 0) val = 0;
 if (val > 100) val = 100;
 setSettingsForm({ ...settingsForm, gstPercent: val });
 }}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. 18"
 />
 <p className="text-[11px] text-zinc-500 font-medium">Set to 0 to show ₹0 for GST. Common values: 5%, 12%, 18%, 28%</p>
 </div>
 )}
 </div>

 {/* Razorpay Route Commission Split Configuration */}
 <div className="bg-zinc-955/20 border border-zinc-800 rounded-xl p-5 space-y-4">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
 Razorpay Route Split Configuration
 </h4>

 <div className="space-y-1 max-w-xs animate-in slide-in-from-top-2 duration-200">
 <label className="text-xs font-bold text-zinc-400 ">Counsellor Payment Share (%)</label>
 <input
 type="number"
 min={0}
 max={100}
 value={settingsForm.counsellorSplitPercent !== undefined ? settingsForm.counsellorSplitPercent : 50}
 onChange={(e) => {
 let val = parseInt(e.target.value);
 if (isNaN(val)) val = 0;
 if (val < 0) val = 0;
 if (val > 100) val = 100;
 setSettingsForm({ ...settingsForm, counsellorSplitPercent: val });
 }}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. 50"
 />
 <p className="text-[11px] text-zinc-500 font-medium leading-relaxed pt-1">Configure the percentage of the booking payment routed automatically to the counsellor's Razorpay linked account. The remaining percentage will be kept by the platform.</p>
 </div>
 </div>

 {/* Platform Payout Bank Details */}
 <div className="bg-zinc-955/20 border border-zinc-800 rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
 Platform Payout Bank Account Details
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Bank Account Name</label>
 <input
 type="text"
 value={settingsForm.adminBankAccountName || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, adminBankAccountName: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 placeholder="e.g. BEHOLD Platform Pvt Ltd"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Bank Account Number</label>
 <input
 type="text"
 value={settingsForm.adminBankAccountNumber || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, adminBankAccountNumber: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 placeholder="e.g. 50200012345678"
 />
 </div>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">IFSC Code</label>
 <input
 type="text"
 value={settingsForm.adminBankIfscCode || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, adminBankIfscCode: e.target.value })}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 placeholder="e.g. HDFC0000123"
 />
 </div>
 </div>
 <p className="text-[11px] text-zinc-500 font-medium">Used for platform reference, manual transfers, or share split bookkeeping when offline sessions are repaid.</p>
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Payments & Taxation Settings</span>
 </button>
 </div>
 </form>
 )}

 {/* TAB 5: Security & System */}
 {activeSettingsTab === 'security' && (
 <div className="space-y-6">
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-5 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <ShieldCheck className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Security & System</h4>
 </div>

 <div className="bg-zinc-955/20 border border-zinc-800 p-5 rounded-xl space-y-4">
 <h4 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-brand" />
 CDAT Group Integration Code
 </h4>
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wider">CDAT Group / School Code</label>
 <input
 type="text"
 required
 value={settingsForm.cdatGroupCode || ''}
 onChange={(e) => setSettingsForm({ ...settingsForm, cdatGroupCode: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="e.g. cdat@behold"
 />
 <span className="text-[11px] text-zinc-500 block font-medium">Global group/school referral code for CDAT registrations.</span>
 </div>
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Security Settings</span>
 </button>
 </div>
 </form>

 {/* Browser Notification Settings Widget */}
 <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-lg">
 <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/60">
 <div className="w-8 h-8 rounded-lg bg-zinc-955 border border-zinc-800/60 flex items-center justify-center">
 <Bell className="w-4 h-4 text-indigo-400" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-white">Desktop Alerts & Reminders</h3>
 <p className="text-xs text-zinc-500 font-medium mt-0.5">Receive real-time notifications for system alerts and platform events</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-955/20 p-4 rounded-xl border border-zinc-800 text-left">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <span className={`w-2.5 h-2.5 rounded-full ${!isNotificationSupported()
 ? 'bg-rose-500'
 : permissionState === 'granted'
 ? 'bg-emerald-555'
 : permissionState === 'denied'
 ? 'bg-rose-500'
 : 'bg-zinc-600'
 }`} />
 <span className="text-[10px] font-bold tracking-wider text-zinc-400">
 {!isNotificationSupported()
 ? 'Not Supported'
 : permissionState === 'granted'
 ? 'Active / Enabled'
 : permissionState === 'denied'
 ? 'Blocked'
 : 'Disabled'}
 </span>
 </div>
 <p className="text-xs text-zinc-500 font-medium leading-relaxed">
 {!isNotificationSupported()
 ? 'Your browser does not support native desktop alerts.'
 : permissionState === 'granted'
 ? 'You will receive native desktop notifications for session updates, confirmations, and alerts.'
 : permissionState === 'denied'
 ? 'Desktop notifications are blocked. Reset permission in your browser address bar to enable alerts.'
 : 'Enable browser notifications to stay updated about your coaching schedules and session links.'}
 </p>
 </div>

 <div className="flex gap-2 shrink-0">
 {isNotificationSupported() && permissionState === 'default' && (
 <button
 type="button"
 onClick={handleEnableNotifications}
 className="min-h-[36px] px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 rounded-full text-xs font-semibold transition cursor-pointer border-none shadow-md"
 >
 Enable Notifications
 </button>
 )}
 {isNotificationSupported() && permissionState === 'granted' && (
 <button
 type="button"
 onClick={handleTestNotification}
 className="min-h-[36px] px-4 py-2 bg-zinc-955 border border-zinc-800 text-zinc-300 hover:text-white rounded-full text-xs font-semibold transition cursor-pointer"
 >
 Test Alert Notification
 </button>
 )}
 {isNotificationSupported() && permissionState === 'denied' && (
 <span className="text-[10px] text-rose-500 font-bold bg-rose-955/25 border border-rose-900/30 p-2 rounded-lg block max-w-[200px]">
 🔒 Unblock in browser settings
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Broadcast Announcement Dispatcher */}
 <form onSubmit={handleSendAnnouncement} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-4 shadow-lg">
 <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800/60">
 <div className="w-8 h-8 rounded-lg bg-zinc-955 border border-zinc-800/60 flex items-center justify-center">
 <Send className="w-4 h-4 text-indigo-400" />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-white">Broadcast System Announcement</h3>
 <p className="text-xs text-zinc-500 font-medium mt-0.5">Send real-time push/desktop local alerts to active users and consultants</p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Target Audience</label>
 <select
 value={announcementRole}
 onChange={(e) => setAnnouncementRole(e.target.value)}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold cursor-pointer transition-colors"
 >
 <option value="user">All Students / Users</option>
 <option value="counsellor">All Counsellors / Psychologists</option>
 <option value="everyone">Everyone (Students & Counsellors)</option>
 </select>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Announcement Title</label>
 <input
 type="text"
 required
 value={announcementTitle}
 onChange={(e) => setAnnouncementTitle(e.target.value)}
 className="w-full px-3.5 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none font-semibold transition-colors"
 placeholder="e.g. Schedule Maintenance"
 />
 </div>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 tracking-wide">Announcement Message</label>
 <textarea
 rows={3}
 required
 value={announcementMessage}
 onChange={(e) => setAnnouncementMessage(e.target.value)}
 className="w-full px-3.5 py-2.5 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold transition-colors"
 placeholder="Write message content here..."
 />
 </div>

 <button
 type="submit"
 disabled={isSendingAnnouncement}
 className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
 >
 {isSendingAnnouncement && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>{isSendingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
 </button>
 </div>
 </form>
 </div>
 )}

 {/* TAB 6: Promo Codes */}
 {activeSettingsTab === 'promo' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-5 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
 <div className="flex items-center gap-2">
 <FileSpreadsheet className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Promotional Codes</h4>
 </div>
 <button
 type="button"
 onClick={handleAddPromoCode}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-955 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-full text-xs font-bold transition cursor-pointer"
 >
 <Plus className="w-3.5 h-3.5" />
 Add Code
 </button>
 </div>

 <div className="pt-2 space-y-4">
 {settingsForm.promoCodes && settingsForm.promoCodes.length > 0 ? (
 <div className="space-y-3">
 {settingsForm.promoCodes.map((promo, idx) => (
 <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-955/40 border border-zinc-800 rounded-xl relative group">
 <button
 type="button"
 onClick={() => handleRemovePromoCode(idx)}
 className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md border-none"
 title="Remove Promo Code"
 >
 <X className="w-3 h-3" />
 </button>

 <div className="flex-1 w-full space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Code (e.g. SAVE20)</label>
 <input
 type="text"
 required
 value={promo.code}
 onChange={(e) => handleUpdatePromoCode(idx, 'code', e.target.value.toUpperCase())}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 placeholder="CODE"
 />
 </div>

 <div className="w-full sm:w-32 space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Type</label>
 <select
 value={promo.type}
 onChange={(e) => handleUpdatePromoCode(idx, 'type', e.target.value)}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold cursor-pointer transition-colors"
 >
 <option value="PERCENTAGE">Percentage (%)</option>
 <option value="FLAT">Flat (₹)</option>
 </select>
 </div>

 <div className="w-full sm:w-24 space-y-1">
 <label className="text-xs font-bold text-zinc-500 ">Value</label>
 <input
 type="number"
 required
 min={0}
 value={promo.value}
 onChange={(e) => handleUpdatePromoCode(idx, 'value', Number(e.target.value))}
 className="w-full px-3 py-2 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold transition-colors"
 />
 </div>

 <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-2 sm:pt-4 justify-center sm:w-20">
 <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300 select-none">
 <input
 type="checkbox"
 checked={promo.isActive !== false}
 onChange={(e) => handleUpdatePromoCode(idx, 'isActive', e.target.checked)}
 className="w-4 h-4 rounded border-zinc-800 bg-zinc-955 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
 />
 <span className={promo.isActive !== false ? "text-emerald-400" : "text-zinc-500"}>Active</span>
 </label>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-955/20 text-center">
 <p className="text-xs text-zinc-500 font-medium">No promotional codes configured.</p>
 </div>
 )}
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Promo Codes</span>
 </button>
 </div>
 </form>
 )}

 {/* TAB 7: Policies & Legal */}
 {activeSettingsTab === 'legal' && (
 <form onSubmit={handleSaveSettings} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-xl space-y-5 animate-in fade-in duration-200 shadow-lg">
 <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60">
 <ShieldCheck className="w-4 h-4 text-brand" />
 <h4 className="text-sm font-bold text-white tracking-wider">Policies & Legal</h4>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Terms of Use Document</label>
 <textarea
 rows={12}
 required
 value={settingsForm.termsOfUse}
 onChange={(e) => setSettingsForm({ ...settingsForm, termsOfUse: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold resize-y transition-colors font-mono text-xs leading-relaxed"
 placeholder="Write Platform Terms & Conditions..."
 />
 </div>

 <div className="space-y-1">
 <label className="text-xs font-bold text-zinc-400 ">Privacy Policy Document</label>
 <textarea
 rows={12}
 required
 value={settingsForm.privacyPolicy}
 onChange={(e) => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
 className="w-full px-3.5 py-3 bg-zinc-955 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold resize-y transition-colors font-mono text-xs leading-relaxed"
 placeholder="Write Platform Privacy Policy..."
 />
 </div>
 </div>

 {settingsSuccess && (
 <p className="text-xs text-emerald-500 font-bold tracking-wide">{settingsSuccess}</p>
 )}

 <div className="pt-2">
 <button
 type="submit"
 disabled={isSavingSettings}
 className={`px-5 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs rounded-full cursor-pointer transition shadow-md border-none flex items-center justify-center gap-1.5 ${isSavingSettings ? 'opacity-50 cursor-not-allowed' : ''}`}
 >
 {isSavingSettings && <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />}
 <span>Save Policies & Legal</span>
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 </div>
 </>
 );
}
