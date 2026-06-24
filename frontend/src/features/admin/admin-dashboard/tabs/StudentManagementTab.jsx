import React from 'react';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';

export default function StudentManagementTab(props) {
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
    handleOpenAddUser,
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
    studentsList,
    canAddStudents,
    canEditStudents,
    canDeleteStudents
  } = props;


            const handleExportStudentsCSV = async () => {
              const headers = "ID,Name,Email,Status,BookingsCount\n";
              const rows = studentsList.map(s => {
                const count = bookingsDb.filter(b => b.userId === s.id).length;
                return `"${s.id}","${s.name}","${s.email}","${s.status || 'ACTIVE'}",${count}`;
              }).join('\n');
              navigator.clipboard.writeText(headers + rows);
              await showAlert("Student directory CSV copied to clipboard!");
            };

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold capitalize  text-white font-header">Students Directory</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-1">Register new student accounts, edit profiles, suspend/unsuspend access</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search students..."
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    <button
                      onClick={handleExportStudentsCSV}
                      className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0"
                    >
                      Export CSV
                    </button>
                    <button onClick={() => handleExportPDF('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                      Export PDF
                    </button>
                    <button onClick={() => handleExportImage('students-table', 'Students_Directory')} className="px-3 py-2 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-sm font-bold rounded-lg transition-colors cursor-pointer capitalize shrink-0">
                      Export Image
                    </button>
                    {canAddStudents && (
                      <button
                        onClick={handleOpenAddUser}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-955" /> Add Student
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-0 sm:border border-zinc-850 rounded-none sm:rounded-lg overflow-hidden bg-transparent sm:bg-zinc-950">
                  <div className="overflow-x-auto w-full">
                    <table id="students-table" className="w-full text-sm border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                          <th className="p-3 whitespace-nowrap">Student Name</th>
                          <th className="p-3 whitespace-nowrap">Email Address</th>
                          <th className="p-3 text-center whitespace-nowrap">Status</th>
                          <th className="p-3 text-center whitespace-nowrap">Consultations</th>
                          <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isDbLoading ? (
                          <SkeletonTableRows cols={5} />
                        ) : studentsList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No student registries match the active query.</td>
                          </tr>
                        ) : (
                          studentsList.slice((studentPage - 1) * studentLimit, studentPage * studentLimit).map(student => (
                            <tr key={student.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-brand flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                                    {student.profilePic || student.image ? (
                                      <img src={student.profilePic || student.image} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                      getInitials(student.name)
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-white block leading-tight">{student.name}</span>
                                    <span className="text-sm text-zinc-500 break-all">ID: {student.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-zinc-350 font-medium whitespace-nowrap">{student.email}</td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleToggleStudentStatus(student.id, student.status || 'ACTIVE')}
                                  className={`px-2 py-0.5 rounded text-sm font-bold capitalize  transition cursor-pointer border ${(student.status || 'ACTIVE') === 'ACTIVE'
                                    ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450 hover:bg-rose-955/20 hover:border-rose-900 hover:text-rose-500'
                                    : 'bg-rose-955/20 border-rose-900/40 text-rose-500 hover:bg-emerald-955/20 hover:border-emerald-900 hover:text-emerald-450'
                                    }`}
                                  title={(student.status || 'ACTIVE') === 'ACTIVE' ? "Click to Suspend Student" : "Click to Unsuspend Student"}
                                >
                                  {student.status || 'ACTIVE'}
                                </button>
                              </td>
                              <td className="p-3 text-center font-bold text-zinc-300 whitespace-nowrap">
                                {bookingsDb.filter(b => b.userId === student.id).length} Booked
                              </td>
                                <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setViewingStudent(student)}
                                  className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-850 transition cursor-pointer text-sm font-bold capitalize "
                                >
                                  Details
                                </button>
                                {canEditStudents && (
                                  <button
                                    onClick={() => handleOpenEditUser(student)}
                                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                    title="Edit Student"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canEditStudents && (
                                  <button
                                    onClick={() => handleGenerateResetToken(student.email)}
                                    className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer"
                                    title="Generate Password Reset Link"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canDeleteStudents && (
                                  <button
                                    onClick={() => handleDeleteUser(student.id)}
                                    className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                    title="Delete Student"
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
                  total={studentsList.length}
                  page={studentPage}
                  limit={studentLimit}
                  onPageChange={setStudentPage}
                  onLimitChange={setStudentLimit}
                />
              </div>
            );
          }