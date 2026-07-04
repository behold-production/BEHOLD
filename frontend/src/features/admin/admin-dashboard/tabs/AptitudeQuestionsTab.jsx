import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';

export default function AptitudeQuestionsTab(props) {
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
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Aptitude Questions</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Manage assessment questions and cognitive profiles</p>
                </div>
                <button
                  onClick={() => {
                    setAptitudeForm({
                      id: '',
                      question: '',
                      category: 'Logical',
                      options: [
                        { text: '', weight: 1 },
                        { text: '', weight: 1 },
                        { text: '', weight: 1 },
                        { text: '', weight: 1 }
                      ],
                      isActive: true
                    });
                    setAptitudeFormError('');
                    setAptitudeFormSuccess('');
                    setIsAddAptitudeOpen(true);
                  }}
                  className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0 border-none"
                >
                  <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Question
                </button>
              </div>

              <div className="bg-zinc-955 border border-zinc-850 p-4 rounded-xl flex items-center gap-3">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search questions by text or category..."
                  value={searchAptitude}
                  onChange={(e) => setSearchAptitude(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-white outline-none placeholder-zinc-550"
                />
              </div>

              <div className="space-y-4">
                {isDbLoading ? (
                  [...Array(3)].map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col gap-4">
                      <div className="flex gap-2">
                        <div className="h-5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] rounded w-8" />
                        <div className="h-5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] rounded w-16" />
                      </div>
                      <div className="h-5 bg-zinc-900 rounded w-3/4" />
                      <div className="space-y-2 mt-2">
                        <div className="h-3 bg-zinc-900 rounded w-1/2" />
                        <div className="h-3 bg-zinc-900 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    {aptitudeQuestionsDb
                      .filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase()))
                      .slice((aptitudePage - 1) * aptitudeLimit, aptitudePage * aptitudeLimit)
                      .map((q, index) => (
                        <div
                          key={q.id || index}
                          className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-5"
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="w-5 h-5 rounded bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-sm text-brand flex items-center justify-center font-bold shrink-0">{((aptitudePage - 1) * aptitudeLimit) + index + 1}</span>
                              <span className="text-xs font-bold capitalize  text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">{q.category}</span>
                              {!q.isActive && <span className="text-xs font-bold capitalize  text-rose-500 bg-rose-955/20 px-2 py-0.5 rounded border border-rose-900/30">Disabled</span>}
                            </div>
                            <h4 className="font-header font-bold text-sm capitalize text-white mb-3">
                              {q.question}
                            </h4>
                            <ul className="space-y-1.5 pl-2 mt-2 border-l border-zinc-850">
                              {q.options?.map((opt, oIdx) => (
                                <li key={oIdx} className="text-xs text-zinc-400 font-medium leading-relaxed pl-3 flex items-center justify-between group">
                                  <span>{opt.text}</span>
                                  <span className="text-xs  text-zinc-600 bg-zinc-900 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Weight: {opt.weight}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="shrink-0 flex items-center gap-2 self-end sm:self-start">
                            <button
                              onClick={() => handleOpenEditAptitudeQuestion(q)}
                              className="p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                              title="Edit Question"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAptitudeQuestion(q.id)}
                              className="p-2 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                              title="Delete Question"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                    {aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length === 0 && (
                      <div className="text-center py-10 bg-zinc-955 border border-zinc-850 rounded-xl space-y-3">
                        <Brain className="w-8 h-8 text-zinc-650 mx-auto" />
                        <p className="text-zinc-500 font-bold text-sm capitalize ">No Questions Found.</p>
                      </div>
                    )}

                    {aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length > 0 && (
                      <PaginationBar
                        total={aptitudeQuestionsDb.filter(q => (q.question + q.category).toLowerCase().includes(searchAptitude.toLowerCase())).length}
                        page={aptitudePage}
                        limit={aptitudeLimit}
                        onPageChange={setAptitudePage}
                        onLimitChange={setAptitudeLimit}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          

          {/* TAB: FAQ DESK MANAGER */}
    </>
  );
}
