import React from 'react';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';

export default function PsychologistManagementTab(props) {
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
    canAddPsy,
    psychologistsList,
    canEditPsy,
    canDeletePsy
  } = props;

  return (
    <>

            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold capitalize  text-white font-header">Psychologists Directory</h3>
                  <p className="text-sm text-zinc-500 font-medium pt-1">Register psychologist staff, update clinic credentials, or remove accounts</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:max-w-[200px]">
                    <input
                      type="text"
                      placeholder="Search advisors..."
                      value={searchPsy}
                      onChange={(e) => setSearchPsy(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                  <button onClick={() => handleExportPDF('counsellors-table', 'Psychologists_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                    Export PDF
                  </button>
                  <button onClick={() => handleExportImage('counsellors-table', 'Psychologists_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                    Export Image
                  </button>
                  {canAddPsy && (
                    <button
                      onClick={() => {
                        setPsyForm({
                          id: '',
                          name: '',
                          email: '',
                          password: '',
                          education: 'MPhil Clinical Psychology',
                          specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                          price: 1250,
                          lang: 'Malayalam, English',
                          bio: ''
                        });
                        setAdminActiveDays({
                          1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 0: false
                        });
                        setAdminAvailableSlots([]);
                        setAdminAllSlots([]);
                        setPsyFormError('');
                        setPsyFormSuccess('');
                        setIsAddPsyOpen(true);
                      }}
                      className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-955 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Psychologist
                    </button>
                  )}
                </div>
              </div>

              {/* Psychologist filter sub-tabs */}
              <div className="flex flex-wrap gap-2 pb-4">
                {[
                  { id: 'all', label: 'All Psychologists', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST').length },
                  { id: 'pending', label: 'Pending Verification', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status !== 'APPROVED' && u.status !== 'ACTIVE' && u.status !== 'REJECTED').length },
                  { id: 'approved', label: 'Approved', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && (u.status === 'APPROVED' || u.status === 'ACTIVE')).length },
                  { id: 'rejected', label: 'Rejected', count: usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'REJECTED').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setPsyFilter(tab.id);
                      setPsyPage(1);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition duration-200 cursor-pointer flex items-center gap-1.5 ${
                      psyFilter === tab.id
                        ? 'bg-brand text-zinc-955'
                        : 'bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      psyFilter === tab.id ? 'bg-zinc-955/20 text-zinc-955' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="border-0 sm:border border-zinc-850 rounded-none sm:rounded-lg overflow-hidden bg-transparent sm:bg-zinc-950">
                <div className="overflow-x-auto w-full">
                  <table id="counsellors-table" className="w-full text-sm border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                        <th className="p-3 whitespace-nowrap">Psychologist Name</th>
                        <th className="p-3 whitespace-nowrap">Email Address</th>
                        <th className="p-3 text-center whitespace-nowrap">Featured (Top 5)</th>
                        <th className="p-3 text-center whitespace-nowrap">Clearance Status</th>
                        <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isDbLoading ? (
                        <SkeletonTableRows cols={5} />
                      ) : psychologistsList.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No psychologist registries match the active query.</td>
                        </tr>
                      ) : (
                        psychologistsList.slice((psyPage - 1) * psyLimit, psyPage * psyLimit).map(psy => (
                          <tr key={psy.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                  {psy.profilePic || psy.image ? (
                                    <img src={psy.profilePic || psy.image} alt={psy.name} className="w-full h-full object-cover" />
                                  ) : (
                                    getInitials(psy.name)
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-white block leading-tight">{psy.name}</span>
                                  <span className="text-sm text-zinc-500 break-all">ID: {psy.id} • Active Profile</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{psy.email}</td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => handleTogglePsyTopFive(psy)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border ${
                                  psy.isTopFive
                                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-850'
                                }`}
                                title="Toggle Top 5 featured status"
                              >
                                {psy.isTopFive ? '★ Featured' : '☆ Feature'}
                              </button>
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              {(psy.status === 'APPROVED' || psy.status === 'ACTIVE') ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 text-sm font-bold capitalize ">
                                    <Check className="w-3.5 h-3.5 text-emerald-450" /> Approved
                                  </span>
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, true)}
                                    className="text-sm text-zinc-500 hover:text-rose-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                    title="Revoke acceptance"
                                  >
                                    Revoke
                                  </button>
                                </div>
                              ) : psy.status === 'REJECTED' ? (
                                <div className="flex items-center justify-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-955/20 border border-rose-900/40 text-rose-450 text-sm font-bold capitalize ">
                                    Rejected
                                  </span>
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, false)}
                                    className="text-sm text-zinc-500 hover:text-emerald-500 underline cursor-pointer bg-transparent border-none p-0 animate-in fade-in duration-200"
                                    title="Accept counselor"
                                  >
                                    Accept
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleTogglePsyVerification(psy.id, false)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none shadow-sm transition-colors"
                                    title="Accept and verify counselor"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectPsy(psy.id)}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none shadow-sm transition-colors"
                                    title="Reject counselor request"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => setViewingPsychologist(psy)}
                                className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold capitalize "
                              >
                                Details
                              </button>
                              {canEditPsy && (
                                <button
                                  onClick={() => handleGenerateResetToken(psy.email)}
                                  className="px-2.5 py-1 bg-zinc-900 text-amber-500 hover:text-amber-400 rounded border border-zinc-800 hover:bg-amber-900/30 transition cursor-pointer text-sm font-bold capitalize "
                                  title="Generate Password Reset Link"
                                >
                                  <KeyRound className="w-4 h-4 inline-block" />
                                </button>
                              )}
                              {canEditPsy && (
                                <button
                                  onClick={() => handleOpenEditPsy(psy)}
                                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                  title="Edit Psychologist"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canDeletePsy && (
                                <button
                                  onClick={() => handleDeletePsy(psy.id)}
                                  className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                  title="Remove Psychologist"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <PaginationBar
                total={psychologistsList.length}
                page={psyPage}
                limit={psyLimit}
                onPageChange={setPsyPage}
                onLimitChange={setPsyLimit}
              />
            </div>
          

          {/* TAB 4: SUB-ADMIN CREATOR & ROLES */}
    </>
  );
}
