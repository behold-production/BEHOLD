import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';

export default function AnalyticsTab(props) {
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
 hasUserPermission,
 hasPsyPermission,
 hasBookingPermission,
 filteredTestResults
 } = props;


 const monthlyCounts = bookingsDb.reduce((acc, b) => {
 if (!b.date) return acc;
 const month = b.date.substring(0, 7); // YYYY-MM
 acc[month] = (acc[month] || 0) + 1;
 return acc;
 }, {});
 const sortedMonths = Object.entries(monthlyCounts).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);

 const advisorCounts = bookingsDb.reduce((acc, b) => {
 if (b.status !== 'COMPLETED') return acc;
 acc[b.advisorName] = (acc[b.advisorName] || 0) + 1;
 return acc;
 }, {});
 const sortedAdvisors = Object.entries(advisorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

 const serviceCounts = bookingsDb.reduce((acc, b) => {
 acc[b.service] = (acc[b.service] || 0) + 1;
 return acc;
 }, { counselling: 0, career: 0 });

 const maxBookings = sortedMonths.length > 0 ? Math.max(...sortedMonths.map(m => m[1])) : 1;

 return (
 <div className="space-y-6 animate-in fade-in duration-200 text-sm">
 <div className="border-b border-zinc-800 pb-3">
 <h3 className="text-sm font-bold text-white font-header">Platform Analytics & Insights</h3>
 <p className="text-sm text-zinc-500 font-medium pt-1">Analyze platform booking volume, consultant loads, and product performance</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 {/* Monthly bookings vertical chart */}
 <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
 <span className="text-sm font-bold text-zinc-400 block border-b border-zinc-900 pb-2">Monthly Booking Volumes</span>
 <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
 {sortedMonths.map(([month, count]) => {
 const pct = ((count / maxBookings) * 100).toFixed(0);
 return (
 <div key={month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
 <span className="text-sm text-brand font-bold opacity-0 group-hover:opacity-100 transition-opacity ">{count} Booking(s)</span>
 <div
 className="w-full bg-brand/15 hover:bg-brand border border-brand/30 hover:border-brand rounded-t transition-all duration-500 relative"
 style={{ height: `${pct}%`, minHeight: '6%' }}
 >
 <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 pointer-events-none" />
 </div>
 <span className="text-sm text-zinc-500 font-bold ">{month}</span>
 </div>
 );
 })}
 {sortedMonths.length === 0 && (
 <div className="w-full h-full flex items-center justify-center text-zinc-600 italic">No bookings registered for monthly logging.</div>
 )}
 </div>
 </div>

 {/* Right: Service and psychologist breakdown */}
 <div className="lg:col-span-4 space-y-4">
 {/* Service Type Breakdown */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
 <span className="text-sm font-bold text-zinc-400 block border-b border-zinc-900 pb-2">Service Breakdown</span>
 <div className="space-y-3 text-sm">
 <div className="space-y-1">
 <div className="flex justify-between font-bold">
 <span className="text-zinc-400">Emotional Wellbeing</span>
 <span className="text-white ">{serviceCounts.counselling} booked</span>
 </div>
 <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
 <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.counselling / (bookingsDb.length || 1)) * 100}%` }} />
 </div>
 </div>

 <div className="space-y-1">
 <div className="flex justify-between font-bold">
 <span className="text-zinc-400">Career Mapping</span>
 <span className="text-white ">{serviceCounts.career} booked</span>
 </div>
 <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
 <div className="bg-brand h-full rounded-full" style={{ width: `${(serviceCounts.career / (bookingsDb.length || 1)) * 100}%` }} />
 </div>
 </div>
 </div>
 </div>

 {/* Top psychologist list */}
 <div className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-3">
 <span className="text-sm font-bold text-zinc-400 block border-b border-zinc-900 pb-2">Top Performers (Completed)</span>
 <div className="space-y-2 text-sm">
 {sortedAdvisors.map(([name, count], idx) => (
 <div key={name} className="flex items-center justify-between p-2 bg-zinc-900/40 rounded border border-zinc-855">
 <div className="flex items-center gap-2">
 <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-brand text-sm font-bold flex items-center justify-center ">#{idx + 1}</span>
 <span className="font-bold text-white truncate max-w-[120px]">{name}</span>
 </div>
 <span className="text-brand font-bold text-sm">{count} Sessions</span>
 </div>
 ))}
 {sortedAdvisors.length === 0 && (
 <div className="text-zinc-650 italic text-center py-4">No completed consultations.</div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}