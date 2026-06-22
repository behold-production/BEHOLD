import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { formatDateString } from '../utils';

export default function InquiriesTab(props) {
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
    filteredInquiries
  } = props;

  return (
    <>

            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Student Inquiries & Leads</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Review contact requests submitted from the landing page</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {inquiriesDb.some(i => i.status === 'RESOLVED') && (
                    <button
                      onClick={handleBulkClearResolvedInquiries}
                      className="px-3.5 py-2 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-sm font-bold capitalize  shrink-0"
                    >
                      Clear Resolved
                    </button>
                  )}
                  <div className="relative w-full sm:max-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={searchInquiry}
                      onChange={(e) => setSearchInquiry(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-955 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isDbLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                          <div className="h-4 bg-zinc-900 rounded w-16" />
                          <div className="h-4 bg-zinc-900 rounded w-24" />
                        </div>
                        <div className="h-5 bg-zinc-900 rounded w-1/4" />
                        <div className="h-4 bg-zinc-900 rounded w-1/3" />
                        <div className="h-16 bg-zinc-900 rounded w-full mt-2" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {filteredInquiries.slice((inquiryPage - 1) * inquiryLimit, inquiryPage * inquiryLimit).map((inq) => (
                      <div
                        key={inq.id}
                        className="bg-zinc-955 border border-zinc-850 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-sm font-bold capitalize  ${inq.status === 'RESOLVED'
                              ? 'bg-emerald-955/20 border border-emerald-900/40 text-emerald-450'
                              : 'bg-amber-955/20 border border-amber-900/40 text-amber-500'
                              }`}>
                              {inq.status || 'PENDING'}
                            </span>
                            <span className="text-sm text-zinc-500 font-bold capitalize ">{formatDateString(inq.date)}</span>
                          </div>

                          <div className="space-y-0.5">
                            <h4 className="font-header font-bold text-sm capitalize text-white truncate">{inq.name}</h4>
                            <p className="text-sm text-brand font-semibold  break-all">{inq.email}</p>
                          </div>

                          <p className="text-[12.5px] text-zinc-400 font-medium leading-relaxed bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 whitespace-pre-wrap">
                            {inq.message}
                          </p>

                          {/* Internal Notes field */}
                          <div className="pt-3 border-t border-zinc-900 mt-2 space-y-2">
                            <span className="text-sm capitalize  font-bold text-zinc-500 block">Internal Staff Notes</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add diagnostic notes or followup details..."
                                defaultValue={inq.note || ''}
                                id={`note-${inq.id}`}
                                className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-850 focus:border-brand rounded text-[12.5px] text-white outline-none font-semibold"
                              />
                              <button
                                onClick={() => {
                                  const noteVal = document.getElementById(`note-${inq.id}`).value;
                                  handleSaveInquiryNote(inq.id, noteVal);
                                }}
                                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-sm text-zinc-300 hover:text-brand hover:border-brand rounded font-bold capitalize transition cursor-pointer"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => handleResolveInquiry(inq.id)}
                            className={`px-4.5 py-2.5 rounded-lg text-sm font-bold capitalize  transition cursor-pointer flex items-center gap-1 border border-zinc-800 ${inq.status === 'RESOLVED'
                              ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                              : 'bg-brand hover:bg-brand-dark text-zinc-955'
                              }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{inq.status === 'RESOLVED' ? 'Re-open' : 'Mark Resolved'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="px-3 py-2.5 bg-rose-955/20 hover:bg-rose-900 hover:text-white text-rose-500 rounded-lg border border-rose-900/30 transition cursor-pointer text-sm font-bold capitalize "
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {filteredInquiries.length === 0 && (
                      <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <MessageSquare className="w-8 h-8 text-zinc-650 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No student inquiries submitted yet.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              <PaginationBar
                total={filteredInquiries.length}
                page={inquiryPage}
                limit={inquiryLimit}
                onPageChange={setInquiryPage}
                onLimitChange={setInquiryLimit}
              />
            </div>
          

          {/* TAB: APTITUDE TEST RESULTS */}
    </>
  );
}
