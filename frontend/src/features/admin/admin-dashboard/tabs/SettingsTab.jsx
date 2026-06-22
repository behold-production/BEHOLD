import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';

const isNotificationSupported = 'Notification' in window;

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
    hasBookingPermission
  } = props;

  return (
    <>

            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold capitalize  text-white font-header">Site Configuration Panel</h3>
                <p className="text-sm text-zinc-500 font-medium pt-1">Manage global landing page titles, subheadings, and contact support endpoints</p>
              </div>

              <form onSubmit={handleSaveSettings} className="bg-zinc-955 border border-zinc-850 p-6 rounded-xl space-y-5">
                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Hero Section Heading</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.heroTitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                    placeholder="e.g. Bridging You To Your {True Growth.}"
                  />
                  <span className="text-sm text-zinc-550 block font-medium">Use curly braces `{ }` around words you want highlighted with the neon gradient.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-sm capitalize  font-bold text-zinc-400">Hero Section Subtitle</label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.heroSub}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSub: e.target.value })}
                    className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none resize-none font-semibold"
                    placeholder="Write a compelling landing subheading..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Custom Site Brand Name</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. BEHOLD"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Footer Copyright Text</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.siteCopyright}
                      onChange={(e) => setSettingsForm({ ...settingsForm, siteCopyright: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. © BEHOLD Ltd., 2026. All rights reserved."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">WhatsApp Support Endpoint Link</label>
                    <input
                      type="url"
                      required
                      value={settingsForm.whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none  font-semibold"
                      placeholder="e.g. https://wa.me/919497174011"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Contact Support Email Address</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none  font-semibold"
                      placeholder="e.g. support@behold.com"
                    />
                  </div>
                </div>

                {/* Top Alert Banner Notice */}
                <div className="border border-zinc-850 p-4 rounded-xl space-y-4 bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm capitalize  font-bold text-zinc-400 block">System Banner Notification Bar</span>
                      <span className="text-sm text-zinc-550 block font-medium">Display an alert message at the very top of all student-facing views.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
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
                      <label className="text-sm capitalize  font-bold text-zinc-500">Alert Message Text</label>
                      <input
                        type="text"
                        value={settingsForm.bannerNotice}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bannerNotice: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                        placeholder="Write dynamic alert banner message..."
                      />
                    </div>
                  )}
                </div>

                {/* Feature Toggles */}
                <div className="border border-zinc-850 p-4 rounded-xl space-y-4 bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm capitalize  font-bold text-brand block">Enable Psychology & Booking Services</span>
                      <span className="text-sm text-zinc-550 block font-medium mt-1">If disabled, the site will only display Aptitude Test features. Psychologists and booking sections will be hidden from the public website.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.enablePsychology}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enablePsychology: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-955 peer-checked:after:border-none" />
                    </label>
                  </div>
                </div>

                {/* GST / Tax Configuration */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-zinc-300 capitalize tracking-wide flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Tax / GST Configuration
                  </h4>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-sm capitalize font-bold text-brand block">Enable GST on Bookings</span>
                      <span className="text-sm text-zinc-550 block font-medium mt-1">When enabled, GST will be applied to the session fee on the booking checkout page.</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
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
                    <div className="space-y-1 max-w-xs animate-in slide-in-from-top-2 duration-200">
                      <label className="text-sm capitalize font-bold text-zinc-400">GST Percentage (%)</label>
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
                        className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                        placeholder="e.g. 18"
                      />
                      <p className="text-xs text-zinc-550 font-medium">Set to 0 to show ₹0 for GST. Common values: 5%, 12%, 18%, 28%</p>
                    </div>
                  )}
                </div>

                {/* Policies & Documents */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Terms of Use Document</label>
                    <textarea
                      rows={6}
                      required
                      value={settingsForm.termsOfUse}
                      onChange={(e) => setSettingsForm({ ...settingsForm, termsOfUse: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold "
                      placeholder="Write Platform Terms & Conditions..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize  font-bold text-zinc-400">Privacy Policy Document</label>
                    <textarea
                      rows={6}
                      required
                      value={settingsForm.privacyPolicy}
                      onChange={(e) => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold "
                      placeholder="Write Platform Privacy Policy..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm capitalize font-bold text-zinc-400">C-DAT Default Group Code</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.cdatGroupCode}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cdatGroupCode: e.target.value })}
                      className="w-full px-3.5 py-3 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                      placeholder="e.g. cdat@behold"
                    />
                  </div>
                </div>

                {/* Promotional Codes */}
                <div className="pt-4 border-t border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white capitalize ">Promotional Codes</h4>
                      <p className="text-xs text-zinc-500 font-medium">Manage discount codes for service bookings</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPromoCode}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg text-xs font-bold capitalize transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Code
                    </button>
                  </div>
                  
                  {settingsForm.promoCodes && settingsForm.promoCodes.length > 0 ? (
                    <div className="space-y-3">
                      {settingsForm.promoCodes.map((promo, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-900 border border-zinc-850 rounded-xl relative group">
                          <button
                            type="button"
                            onClick={() => handleRemovePromoCode(idx)}
                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer shadow-md"
                            title="Remove Promo Code"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          
                          <div className="flex-1 w-full space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Code (e.g. SAVE20)</label>
                            <input
                              type="text"
                              required
                              value={promo.code}
                              onChange={(e) => handleUpdatePromoCode(idx, 'code', e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold uppercase"
                              placeholder="CODE"
                            />
                          </div>
                          
                          <div className="w-full sm:w-32 space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Type</label>
                            <select
                              value={promo.type}
                              onChange={(e) => handleUpdatePromoCode(idx, 'type', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold cursor-pointer"
                            >
                              <option value="PERCENTAGE">Percentage (%)</option>
                              <option value="FLAT">Flat (₹)</option>
                            </select>
                          </div>
                          
                          <div className="w-full sm:w-24 space-y-1">
                            <label className="text-xs font-bold text-zinc-500">Value</label>
                            <input
                              type="number"
                              required
                              min={0}
                              value={promo.value}
                              onChange={(e) => handleUpdatePromoCode(idx, 'value', Number(e.target.value))}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-brand rounded-lg text-sm text-white outline-none font-semibold"
                            />
                          </div>
                          
                          <div className="flex items-center gap-2 mt-4 sm:mt-0 pt-2 sm:pt-4 justify-center sm:w-20">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-300 select-none">
                              <input
                                type="checkbox"
                                checked={promo.isActive !== false}
                                onChange={(e) => handleUpdatePromoCode(idx, 'isActive', e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                              />
                              <span className={promo.isActive !== false ? "text-emerald-400" : "text-zinc-500"}>Active</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 text-center">
                      <p className="text-sm text-zinc-500 font-medium">No promotional codes configured.</p>
                    </div>
                  )}
                </div>

                {settingsSuccess && (
                  <p className="text-sm text-emerald-500 font-bold capitalize tracking-wide">{settingsSuccess}</p>
                )}

                <button
                  type="submit"
                  className="px-6 py-3 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-sm capitalize  rounded-lg cursor-pointer transition border-none shadow-md animate-in fade-in duration-300"
                >
                  Save Global Configurations
                </button>
              </form>

              {/* Browser Notification Settings Widget */}
              <div className="bg-zinc-955 border border-zinc-850 p-6 rounded-xl mt-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] flex items-center justify-center">
                    <Bell className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-header">Desktop Alerts & Reminders</h3>
                    <p className="text-xs text-zinc-500 font-medium">Receive real-time notifications for system alerts and platform events</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        !isNotificationSupported()
                          ? 'bg-rose-500'
                          : permissionState === 'granted'
                            ? 'bg-emerald-555'
                            : permissionState === 'denied'
                              ? 'bg-rose-500'
                              : 'bg-zinc-600'
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
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
                        className="min-h-[36px] px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 rounded-lg text-xs font-semibold transition cursor-pointer border-none shadow-md"
                      >
                        Enable Notifications
                      </button>
                    )}
                    {isNotificationSupported() && permissionState === 'granted' && (
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="min-h-[36px] px-4 py-2 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-zinc-355 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer"
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
              <form onSubmit={handleSendAnnouncement} className="bg-zinc-955 border border-zinc-850 p-6 rounded-xl mt-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] flex items-center justify-center">
                    <Send className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-header">Broadcast System Announcement</h3>
                    <p className="text-xs text-zinc-500 font-medium">Send real-time push/desktop local alerts to active users and consultants</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Target Audience</label>
                      <select
                        value={announcementRole}
                        onChange={(e) => setAnnouncementRole(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-xs text-white outline-none font-semibold cursor-pointer"
                      >
                        <option value="user">All Students / Users</option>
                        <option value="counsellor">All Counsellors / Psychologists</option>
                        <option value="everyone">Everyone (Students & Counsellors)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Announcement Title</label>
                      <input
                        type="text"
                        required
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-xs text-white outline-none font-semibold"
                        placeholder="e.g. Schedule Maintenance"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Announcement Message</label>
                    <textarea
                      rows={3}
                      required
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-xs text-white outline-none resize-none font-semibold"
                      placeholder="Write message content here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingAnnouncement}
                    className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-955 font-bold text-xs capitalize rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1.5"
                  >
                    {isSendingAnnouncement ? 'Broadcasting...' : 'Broadcast Announcement'}
                  </button>
                </div>
              </form>
            </div>
          

          {/* TAB: ANALYTICS COMMAND CENTER */}
    </>
  );
}
