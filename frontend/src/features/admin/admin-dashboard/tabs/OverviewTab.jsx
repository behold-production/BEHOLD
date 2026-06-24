import React from 'react';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { formatDateString } from '../utils';

export default function OverviewTab(props) {
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
    subAdminsList
  } = props;


            const studentsCount = usersDb.filter(u => u.role === 'USER' || !u.role).length;
            const activeStudentsCount = usersDb.filter(u => (u.role === 'USER' || !u.role) && u.status !== 'SUSPENDED').length;
            const suspendedStudentsCount = usersDb.filter(u => (u.role === 'USER' || !u.role) && u.status === 'SUSPENDED').length;

            const psyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST').length;
            const approvedPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && (u.status === 'APPROVED' || u.status === 'ACTIVE')).length;
            const pendingPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status !== 'APPROVED' && u.status !== 'ACTIVE' && u.status !== 'REJECTED').length;
            const rejectedPsyCount = usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'REJECTED').length;

            const totalBookingsCount = bookingsDb.length;
            const confirmedBookingsCount = bookingsDb.filter(b => b.status === 'CONFIRMED').length;
            const pendingBookingsCount = bookingsDb.filter(b => b.status === 'PENDING').length;
            const completedBookingsCount = bookingsDb.filter(b => b.status === 'COMPLETED').length;
            const expiredBookingsCount = bookingsDb.filter(b => b.status === 'EXPIRED').length;
            const cancelledBookingsCount = bookingsDb.filter(b => b.status === 'CANCELLED').length;

            const pendingInquiriesCount = inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).length;
            const resolvedInquiriesCount = inquiriesDb.filter(i => i.status === 'RESOLVED').length;
            const totalInquiriesCount = inquiriesDb.length;
            const inquiryResolutionRate = totalInquiriesCount > 0 ? Math.round((resolvedInquiriesCount / totalInquiriesCount) * 100) : 0;

            const totalRevenue = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'COMPLETED' && b.status !== 'EXPIRED') return acc;
              if (b.amountPaid !== undefined && b.amountPaid !== null) {
                return acc + Number(b.amountPaid);
              }
              const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
              let price = 1250;
              if (advisor && advisor.price) {
                price = Number(advisor.price);
              }
              return acc + Number(price);
            }, 0);

            const projectedRevenue = bookingsDb.reduce((acc, b) => {
              if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return acc;
              if (b.amountPaid !== undefined && b.amountPaid !== null) {
                return acc + Number(b.amountPaid);
              }
              const advisor = usersDb.find(u => u.id === b.advisorId) || usersDb.find(u => u.name === b.advisorName);
              let price = 1250;
              if (advisor && advisor.price) {
                price = Number(advisor.price);
              }
              return acc + Number(price);
            }, 0);

            const counsellingCount = bookingsDb.filter(b => b.service === 'counselling').length;
            const aptitudeCount = bookingsDb.filter(b => b.service === 'aptitude').length;
            const onlineCount = bookingsDb.filter(b => b.mode === 'ONLINE').length;
            const offlineCount = bookingsDb.filter(b => b.mode === 'OFFLINE').length;
            const doorstepCount = bookingsDb.filter(b => b.mode === 'DOOR_STEP').length;

            const activeBookings = bookingsDb.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length;
            const bookingCompletionRate = totalBookingsCount > 0 ? Math.round((completedBookingsCount / totalBookingsCount) * 100) : 0;

            // Storage usage calculation
            let totalChars = 0;
            for (let key in localStorage) {
              if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                totalChars += key.length + localStorage[key].length;
              }
            }
            const kbUsed = (totalChars / 1024).toFixed(2);

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                  <h3 className="text-sm font-bold capitalize  text-zinc-400">Super Admin Command Center</h3>
                </div>

                {/* KPI stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  {/* Students Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'students' ? null : 'students')}
                    className={`bg-zinc-950 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'students'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Students</span>
                      <User className={`w-3.5 h-3.5 ${activeStatHighlight === 'students' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{studentsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-emerald-450">{activeStudentsCount} Active</span>
                      <span className=" text-zinc-600">{suspendedStudentsCount} Suspended</span>
                    </div>
                  </div>

                  {/* Psychologists Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'psychologists' ? null : 'psychologists')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'psychologists'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Psychologists</span>
                      <Award className={`w-3.5 h-3.5 ${activeStatHighlight === 'psychologists' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{psyCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-emerald-450">{approvedPsyCount} Verified</span>
                      <span className=" text-amber-500">{pendingPsyCount} Pending</span>
                    </div>
                  </div>

                  {/* Total Bookings Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'bookings' ? null : 'bookings')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'bookings'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Total Bookings</span>
                      <Calendar className={`w-3.5 h-3.5 ${activeStatHighlight === 'bookings' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-white text-left pt-0.5">{totalBookingsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-zinc-400">{confirmedBookingsCount} Confirmed</span>
                      <span className=" text-zinc-650">{pendingBookingsCount} Pending</span>
                    </div>
                  </div>

                  {/* Inquiries Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'inquiries' ? null : 'inquiries')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'inquiries'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Inquiries</span>
                      <MessageSquare className={`w-3.5 h-3.5 ${activeStatHighlight === 'inquiries' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-amber-500 text-left pt-0.5">{pendingInquiriesCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-550 font-semibold pt-0.5">
                      <span className="capitalize text-amber-900/60 font-bold">Pending</span>
                      <span className=" text-zinc-500">{resolvedInquiriesCount} Solved</span>
                    </div>
                  </div>

                  {/* Completed Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'completed' ? null : 'completed')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'completed'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Completed</span>
                      <Check className={`w-3.5 h-3.5 ${activeStatHighlight === 'completed' ? 'text-brand' : 'text-zinc-500'}`} />
                    </div>
                    <p className="text-xl font-bold text-brand text-left pt-0.5">{completedBookingsCount}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-brand/70">{bookingCompletionRate}% rate</span>
                      <span className=" text-zinc-650">{totalBookingsCount} total</span>
                    </div>
                  </div>

                  {/* Revenue Card */}
                  <div
                    onClick={() => setActiveStatHighlight(activeStatHighlight === 'revenue' ? null : 'revenue')}
                    className={`bg-zinc-955 border p-4 rounded-xl text-center space-y-1.5 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5 select-none ${activeStatHighlight === 'revenue'
                      ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                      : 'border-zinc-850 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-500 font-bold capitalize  block">Revenue Est.</span>
                      <span className={`text-sm font-bold ${activeStatHighlight === 'revenue' ? 'text-brand' : 'text-zinc-500'}`}>₹</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-450 text-left pt-0.5">₹{totalRevenue}</p>
                    <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 text-zinc-500 font-semibold pt-0.5">
                      <span className="capitalize text-zinc-400">Completed</span>
                      <span className=" text-zinc-600">₹{projectedRevenue} Proj.</span>
                    </div>
                  </div>
                </div>

                {/* Interactive KPI Detail Drawer/Panel */}
                {activeStatHighlight && (
                  <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 animate-in slide-in-from-top-4 duration-300 relative">
                    <button
                      onClick={() => setActiveStatHighlight(null)}
                      className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-805 text-zinc-450 hover:text-white rounded border border-zinc-800 cursor-pointer transition border-none"
                      title="Close Details Panel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    {activeStatHighlight === 'students' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <User className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Students Registry Breakdown</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Activity Distribution</span>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-zinc-950 p-2.5 rounded border border-zinc-850 text-center">
                                <span className="text-sm text-emerald-450 font-bold capitalize  block">Active Accounts</span>
                                <p className="text-lg font-bold text-white">{activeStudentsCount}</p>
                              </div>
                              <div className="flex-1 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-center">
                                <span className="text-sm text-rose-500 font-bold capitalize  block">Suspended Accounts</span>
                                <p className="text-lg font-bold text-white">{suspendedStudentsCount}</p>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm text-zinc-500 font-bold capitalize">
                                <span>Active: {studentsCount > 0 ? Math.round((activeStudentsCount / studentsCount) * 100) : 100}%</span>
                                <span>Suspended: {studentsCount > 0 ? Math.round((suspendedStudentsCount / studentsCount) * 100) : 0}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850 flex">
                                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${studentsCount > 0 ? (activeStudentsCount / studentsCount) * 100 : 100}%` }} />
                                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${studentsCount > 0 ? (suspendedStudentsCount / studentsCount) * 100 : 0}%` }} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Latest Registrations</span>
                            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                              {usersDb.filter(u => u.role === 'USER' || !u.role).reverse().slice(0, 3).map(st => (
                                <div key={st.id} className="flex justify-between items-center text-sm bg-zinc-955 p-2 rounded border border-zinc-855">
                                  <div>
                                    <span className="font-bold text-white block truncate max-w-[140px]">{st.name}</span>
                                    <span className="text-sm text-zinc-500  block break-all">{st.email}</span>
                                  </div>
                                  <span className={`text-sm px-1.5 py-0.2 rounded capitalize font-bold ${st.status === 'SUSPENDED' ? 'bg-rose-955/20 text-rose-500 border border-rose-900/30' : 'bg-emerald-955/20 text-emerald-450 border border-emerald-900/30'
                                    }`}>{st.status || 'ACTIVE'}</span>
                                </div>
                              ))}
                              {studentsCount === 0 && <p className="text-zinc-650 italic text-center py-4">No students registered yet.</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'psychologists' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Award className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Psychologists Status & Verification</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                          <div className="sm:col-span-4 bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block text-center">Verification Ratio</span>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm bg-zinc-950 p-2.5 rounded border border-zinc-850">
                                <span className="text-zinc-400 font-bold capitalize text-sm">Approved Advisors</span>
                                <span className="text-brand font-bold ">{approvedPsyCount}</span>
                              </div>
                              <div className="flex justify-between text-sm bg-zinc-950 p-2.5 rounded border border-zinc-850">
                                <span className="text-zinc-400 font-bold capitalize text-sm">Pending Approval</span>
                                <span className="text-amber-500 font-bold ">{pendingPsyCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-8 bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Pending Acceptance Requests ({pendingPsyCount})</span>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                              {usersDb.filter(u => u.role === 'PSYCHOLOGIST' && u.status === 'PENDING').map(psy => (
                                <div key={psy.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-sm">
                                  <div>
                                    <span className="font-bold text-white capitalize block leading-tight">{psy.name}</span>
                                    <span className="text-zinc-500  text-sm break-all">{psy.email}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                    <button
                                      onClick={() => handleTogglePsyVerification(psy.id, false)}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectPsy(psy.id)}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {pendingPsyCount === 0 && (
                                <div className="text-zinc-550 italic text-sm py-6 text-center">No pending verification requests. All psychologists are fully approved.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'bookings' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Calendar className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Consultation Bookings Analytics</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Status Breakdown</span>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Confirmed Sessions</span>
                                <span className="text-white font-bold ">{confirmedBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Pending Requests</span>
                                <span className="text-white font-bold ">{pendingBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Completed Sessions</span>
                                <span className="text-brand font-bold ">{completedBookingsCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Expired/No-Show</span>
                                <span className="text-rose-500 font-bold ">{expiredBookingsCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Cancelled/Released</span>
                                <span className="text-rose-500 font-bold ">{cancelledBookingsCount}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Service Breakdown</span>
                            <div className="space-y-2.5 text-sm">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold capitalize">
                                  <span className="text-zinc-450">Emotional Wellbeing</span>
                                  <span className="text-white ">{counsellingCount} booked</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850 flex">
                                  <div className="bg-brand h-full rounded-full" style={{ width: `${totalBookingsCount > 0 ? (counsellingCount / totalBookingsCount) * 100 : 0}%` }} />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm font-bold capitalize">
                                  <span className="text-zinc-450">Career Mapping (Aptitude)</span>
                                  <span className="text-white ">{aptitudeCount} booked</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850 flex">
                                  <div className="bg-brand h-full rounded-full" style={{ width: `${totalBookingsCount > 0 ? (aptitudeCount / totalBookingsCount) * 100 : 0}%` }} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                            <span className="text-sm capitalize font-bold  text-zinc-500 block">Session Mode Breakdown</span>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Online Google Meet</span>
                                <span className="text-white font-bold ">{onlineCount}</span>
                              </div>
                              <div className="flex justify-between border-b border-zinc-950 pb-1">
                                <span className="text-zinc-400">Offline Center Visit</span>
                                <span className="text-white font-bold ">{offlineCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Doorstep Outreach</span>
                                <span className="text-white font-bold ">{doorstepCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'inquiries' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <MessageSquare className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Student Inquiries Desk</h4>
                        </div>
                        <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-850 space-y-3">
                          <span className="text-sm capitalize font-bold  text-zinc-500 block">Pending Inquiries ({pendingInquiriesCount})</span>
                          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                            {inquiriesDb.filter(i => i.status === 'PENDING' || !i.status).map(inq => (
                              <div key={inq.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-955 p-2.5 rounded border border-zinc-850 text-sm">
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-white capitalize block leading-tight break-all">{inq.name} ({inq.email})</span>
                                  <p className="text-zinc-450 font-medium italic mt-1 ">"{inq.message}"</p>
                                </div>
                                <button
                                  onClick={() => handleResolveInquiry(inq.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold capitalize  cursor-pointer border-none transition shrink-0 self-end sm:self-auto"
                                >
                                  Quick Resolve
                                </button>
                              </div>
                            ))}
                            {pendingInquiriesCount === 0 && (
                              <div className="text-zinc-550 italic text-sm py-6 text-center">All inquiries resolved. Excellent response rate!</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'completed' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                          <Check className="w-4 h-4 text-brand" />
                          <h4 className="font-header font-bold text-sm capitalize text-white">Session Fulfilment Rates</h4>
                        </div>
                        <div className="bg-zinc-900/60 p-5 rounded-lg border border-zinc-850 space-y-4 text-center">
                          <span className="text-sm capitalize font-bold  text-zinc-500 block">Session Completion Analysis</span>
                          <div className="max-w-md mx-auto space-y-3">
                            <p className="text-zinc-350 text-sm font-semibold">
                              Overall Completion Rate: <span className="text-brand font-bold ">{bookingCompletionRate}%</span>
                            </p>
                            <div className="w-full bg-zinc-955 h-3 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                              <div className="bg-gradient-to-r from-brand to-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${bookingCompletionRate}%` }} />
                            </div>
                            <p className="text-sm text-zinc-550 leading-relaxed pt-2">
                              Out of {totalBookingsCount} total scheduled consultations, {completedBookingsCount} sessions have been completed, {expiredBookingsCount} expired, and {cancelledBookingsCount} cancelled. Active/Scheduled sessions total {activeBookings}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStatHighlight === 'revenue' && (() => {
                      const splitPercent = settingsForm && settingsForm.counsellorSplitPercent !== undefined ? Number(settingsForm.counsellorSplitPercent) : 50;
                      const splitRatio = splitPercent / 100;
                      const platformRatio = (100 - splitPercent) / 100;
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                            <span className="text-brand font-bold text-sm">₹</span>
                            <h4 className="font-header font-bold text-sm capitalize text-white">Revenue Audits</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                              <span className="text-sm text-zinc-500 font-bold capitalize  block">Completed Gross Revenue</span>
                              <p className="text-xl font-bold text-emerald-450 ">₹{totalRevenue}</p>
                              <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">INR Fulfilled</span>
                            </div>
                            <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                              <span className="text-sm text-zinc-500 font-bold capitalize  block">Projected Booked Revenue</span>
                              <p className="text-xl font-bold text-white ">₹{projectedRevenue}</p>
                              <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">Scheduled (CONFIRMED/PENDING)</span>
                            </div>
                            <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                              <span className="text-sm text-zinc-500 font-bold capitalize  block">Platform Share ({100 - splitPercent}% Split)</span>
                              <p className="text-xl font-bold text-brand ">₹{Math.round(totalRevenue * platformRatio)}</p>
                              <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">{100 - splitPercent}% Platform service share</span>
                            </div>
                            <div className="bg-zinc-900/60 p-4.5 rounded-lg border border-zinc-850 space-y-1">
                              <span className="text-sm text-zinc-500 font-bold capitalize  block">Counsellor Payouts ({splitPercent}% Split)</span>
                              <p className="text-xl font-bold text-emerald-400 ">₹{Math.round(totalRevenue * splitRatio)}</p>
                              <span className="text-xs text-zinc-650 font-bold block capitalize mt-1">{splitPercent}% routed to Linked Accounts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Quick actions panel */}
                <div className="bg-zinc-955 border border-zinc-855 p-4.5 rounded-xl space-y-3">
                  <span className="text-sm capitalize font-bold  text-zinc-500 block">Quick Action Gateways</span>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setUserForm({ id: '', name: '', email: '', password: '', phone: '', schoolName: '', grade: '', guardianName: '', guardianPhone: '', groupCode: '' });
                        setUserProfilePicFile(null);
                        setUserFormError('');
                        setUserFormSuccess('');
                        setIsAddUserOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-brand" /> Provision Student
                    </button>
                    <button
                      onClick={() => {
                        setPsyForm({
                          id: '', name: '', email: '', password: '',
                          education: 'MPhil Clinical Psychology',
                          specialties: 'Anxiety Stress & Panic, Depression & Mood Concerns, Relationship',
                          price: 1250, lang: 'Malayalam, English', bio: ''
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
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand" /> Register Psychologist
                    </button>
                    <button
                      onClick={() => {
                        const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                        const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                        let firstSlot = '';
                        if (firstPsy && firstPsy.availability?.availableSlots?.length > 0) {
                          firstSlot = firstPsy.availability.availableSlots[0];
                        }
                        setBookingForm({
                          id: '', userId: firstStudent?.id || '', advisorId: firstPsy?.id || '',
                          service: 'counselling', mode: 'ONLINE',
                          date: getLocalTodayString(), time: firstSlot,
                          meetLink: '', status: 'CONFIRMED'
                        });
                        setBookingFormError('');
                        setBookingFormSuccess('');
                        setIsAddBookingOpen(true);
                      }}
                      className="px-4.5 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg border border-zinc-800 transition cursor-pointer text-sm font-bold capitalize  flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand" /> Schedule Booking
                    </button>
                  </div>
                </div>

                {/* Main overview columns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Live Activity Feed Segmented Panel (Col Span 8) */}
                  <div className="lg:col-span-8 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                      <span className="text-sm capitalize font-bold  text-zinc-400">Live Activity Feed</span>
                      <span className="text-sm text-zinc-500  capitalize">Sync OK • {formatDateString(new Date())}</span>
                    </div>

                    {/* Tab Segment Controls */}
                    <div className="flex gap-2 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 overflow-x-auto hide-scrollbar">
                      <button
                        onClick={() => setOverviewActivityTab('bookings')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'bookings'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-950'
                          }`}
                      >
                        <Calendar className="w-3.5 h-3.5" /> Bookings
                      </button>
                      <button
                        onClick={() => setOverviewActivityTab('inquiries')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'inquiries'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-955'
                          }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Inquiries
                      </button>
                      <button
                        onClick={() => setOverviewActivityTab('results')}
                        className={`flex-1 px-4 py-2 whitespace-nowrap rounded-md text-sm font-bold capitalize transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 shrink-0 ${overviewActivityTab === 'results'
                          ? 'bg-brand text-zinc-955 font-bold shadow-sm'
                          : 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-955'
                          }`}
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> Aptitude Results
                      </button>
                    </div>

                    {/* Tab Lists */}
                    <div className="space-y-3.5">
                      {overviewActivityTab === 'bookings' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                              {[...bookingsDb].reverse().slice(0, 3).map(b => (
                                <div key={b.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-3 flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-bold text-white capitalize shrink-0">{b.userName}</span>
                                        <span className="text-zinc-550 text-xs shrink-0">booked with</span>
                                        <span className="font-bold text-brand capitalize shrink-0">{b.advisorName}</span>
                                        <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap mt-1 sm:mt-0">
                                          {formatDateString(b.date)} • {b.time}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.mode}</span>
                                        <span className="text-[11px] bg-zinc-950 text-zinc-500 border border-zinc-850 px-2 py-1 rounded font-bold uppercase tracking-wider shrink-0 whitespace-nowrap">{b.service}</span>
                                        <span className={`text-[11px] px-2 py-1 rounded uppercase tracking-wider font-bold border shrink-0 whitespace-nowrap ${b.status === 'CONFIRMED' ? 'bg-emerald-955/20 border-emerald-900/40 text-emerald-450' :
                                          b.status === 'PENDING' ? 'bg-amber-955/20 border-amber-900/40 text-amber-500' :
                                          b.status === 'COMPLETED' ? 'bg-brand/10 border-brand/20 text-brand' :
                                          b.status === 'CANCELLED' ? 'bg-rose-955/20 border-rose-900/30 text-rose-500' :
                                          'bg-zinc-800 border-zinc-700 text-zinc-400'
                                        }`}>{b.status}</span>
                                      </div>
                                    </div>
                                    <div className="w-full md:w-auto flex justify-start md:justify-end shrink-0 pt-2 md:pt-0">
                                      <button
                                        onClick={() => setSelectedOverviewBooking(selectedOverviewBooking === b.id ? null : b.id)}
                                        className="px-4 py-2 bg-zinc-955 hover:bg-zinc-900 border border-zinc-850 hover:border-brand/40 text-brand rounded-lg text-sm font-bold capitalize transition-colors cursor-pointer w-full md:w-auto shadow-sm relative z-20"
                                      >
                                        {selectedOverviewBooking === b.id ? 'Hide Details' : 'View Details'}
                                      </button>
                                    </div>
                                  </div>
                                  {selectedOverviewBooking === b.id && (
                                    <div className="w-full mt-3 pt-3 border-t border-zinc-900/60 space-y-2 text-zinc-455 animate-in slide-in-from-top-2 duration-200">
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-zinc-955/60 p-2.5 rounded border border-zinc-900">
                                        <div>
                                          <span className="text-zinc-550 block font-bold capitalize text-xs ">Advisor Designation</span>
                                          <span className="text-white font-medium block mt-0.5">{b.advisorRole || 'Consultant Psychologist'}</span>
                                        </div>
                                        <div>
                                          <span className="text-zinc-550 block font-bold capitalize text-xs ">Appointment ID</span>
                                          <span className="text-zinc-400 block mt-0.5 break-all select-all">{b.id}</span>
                                        </div>
                                      </div>
                                      {b.meetLink ? (
                                        <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-2">
                                          <span className="truncate text-brand  select-all text-sm pr-2">{b.meetLink}</span>
                                          <button
                                            onClick={async () => {
                                              navigator.clipboard.writeText(b.meetLink);
                                              await showAlert("Google Meet Link copied!", "Success");
                                            }}
                                            className="px-2.5 py-1 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] hover:border-brand/40 text-white rounded text-sm font-bold cursor-pointer transition shrink-0"
                                          >
                                            Copy Link
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="text-sm text-zinc-555 italic mt-1 pb-1">No video meeting link generated for this booking.</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              {bookingsDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent bookings recorded.</p>}
                            </>
                          )}
                        </div>
                      )}

                      {overviewActivityTab === 'inquiries' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                                                            {[...inquiriesDb].reverse().slice(0, 3).map(i => {
                                                              const isResolved = i.status === 'RESOLVED';
                                                              return (
                                                                <div key={i.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm space-y-3.5 hover:border-zinc-800 transition-colors">
                                                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                                                                    <div>
                                                                      <span className="text-white font-bold capitalize block leading-tight">{i.name}</span>
                                                                      <span className="text-zinc-550 text-xs block mt-0.5 break-all">{i.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                      <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-bold capitalize">{formatDateString(i.date)}</span>
                                                                      <span className={`text-xs px-2 py-0.5 rounded capitalize font-bold border ${isResolved ? 'bg-emerald-955/20 border-emerald-900/30 text-emerald-455' : 'bg-amber-955/20 border-amber-900/30 text-amber-500'}`}>{i.status || 'PENDING'}</span>
                                                                    </div>
                                                                  </div>
                                                                  <p className="text-zinc-350 font-medium italic border-l-2 border-brand/30 pl-2.5 leading-relaxed bg-zinc-955/20 p-2.5 rounded-r-lg">"{i.message}"</p>
                              
                                                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-900/40">
                                                                    <button
                                                                      onClick={() => handleResolveInquiry(i.id)}
                                                                      className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize cursor-pointer border transition-colors shrink-0 ${isResolved
                                                                        ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-white'
                                                                        : 'bg-emerald-600 hover:bg-emerald-700 border-none text-white'
                                                                        }`}
                                                                    >
                                                                      {isResolved ? 'Mark Pending' : 'Mark Resolved'}
                                                                    </button>
                                                                    <div className="flex items-center gap-2 w-full sm:max-w-md shrink-0">
                                                                      <input
                                                                        type="text"
                                                                        placeholder="Add staff summary note..."
                                                                        value={inquiryNotesText[i.id] !== undefined ? inquiryNotesText[i.id] : (i.note || '')}
                                                                        onChange={(e) => setInquiryNotesText({ ...inquiryNotesText, [i.id]: e.target.value })}
                                                                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-850 focus:border-brand rounded-lg text-sm text-white outline-none"
                                                                      />
                                                                      <button
                                                                        onClick={() => handleSaveInquiryNote(i.id, inquiryNotesText[i.id] || '')}
                                                                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-brand text-brand font-bold rounded-lg text-sm capitalize cursor-pointer transition shrink-0"
                                                                      >
                                                                        Save
                                                                      </button>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                              {inquiriesDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent inquiries recorded.</p>}
                            </>
                          )}
                        </div>
                      )}

                      {overviewActivityTab === 'results' && (
                        <div className="space-y-2.5 animate-in fade-in duration-200">
                          {isDbLoading ? (
                            [...Array(3)].map((_, idx) => (
                              <div key={idx} className="animate-pulse bg-zinc-900/40 p-3 rounded-lg border border-zinc-855 flex items-center justify-between h-[64px]">
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-zinc-900 rounded w-1/3" />
                                  <div className="h-3 bg-zinc-900 rounded w-1/2" />
                                </div>
                                <div className="h-8 bg-zinc-900 rounded w-20" />
                              </div>
                            ))
                          ) : (
                            <>
                              {[...testResultsDb].reverse().slice(0, 3).map(res => (
                                <div key={res.id} className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-855 text-sm space-y-3.5 hover:border-zinc-800 transition-colors">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                                    <div>
                                      <span className="text-white font-bold capitalize block leading-tight">{res.studentName}</span>
                                      <span className="text-zinc-550 text-xs block mt-0.5">{res.studentEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-xs bg-zinc-950 text-zinc-400 border border-zinc-850 px-2 py-0.5 rounded font-bold capitalize">{formatDateString(res.date)}</span>
                                      <span className="text-xs bg-brand/10 border border-brand/20 text-brand px-2 py-0.5 rounded font-bold capitalize">
                                        Dominant: {res.dominantDomain.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="border-t border-zinc-900/60 pt-3 space-y-2.5">
                                    <span className="text-[11px] font-bold text-zinc-550 uppercase tracking-wider block">Cognitive Domain Breakdown</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {Object.entries(res.scores || {}).slice(0, 3).map(([key, val]) => (
                                        <div key={key} className="space-y-1 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                                          <div className="flex flex-wrap justify-between items-center text-xs gap-x-2 font-bold text-zinc-400 capitalize">
                                            <span>{key}</span>
                                            <span className="text-white">{val}%</span>
                                          </div>
                                          <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden border border-zinc-850">
                                            <div className="bg-brand h-full rounded-full transition-all duration-500" style={{ width: `${val}%` }} />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {testResultsDb.length === 0 && <p className="text-zinc-550 italic text-sm text-center py-6">No recent aptitude results recorded.</p>}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System health & visual meters (Col Span 4) */}
                  <div className="lg:col-span-4 bg-zinc-955 border border-zinc-850 rounded-xl p-5 space-y-5 text-sm">
                    <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                      <span className="text-sm capitalize font-bold  text-zinc-400">Database & System Health</span>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm text-zinc-500 font-bold capitalize ">LIVE SYNC</span>
                      </div>
                    </div>

                    {/* Progress Ratios and Meters */}
                    <div className="space-y-3 pb-3 border-b border-zinc-900">
                      <span className="text-sm capitalize font-bold  text-zinc-550 block">Ratios & Fulfillment</span>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-sm font-bold capitalize">
                          <span className="text-zinc-400">Booking Completion</span>
                          <span className="text-brand  font-bold">{bookingCompletionRate}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                          <div className="bg-gradient-to-r from-brand to-brand-accent h-full rounded-full transition-all duration-500" style={{ width: `${bookingCompletionRate}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 block text-right font-medium">{completedBookingsCount} of {totalBookingsCount} sessions</span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-sm font-bold capitalize">
                          <span className="text-zinc-400">Inquiry Resolution</span>
                          <span className="text-brand  font-bold">{inquiryResolutionRate}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                          <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${inquiryResolutionRate}%` }} />
                        </div>
                        <span className="text-xs text-zinc-500 block text-right font-medium">{resolvedInquiriesCount} of {totalInquiriesCount} queries</span>
                      </div>
                    </div>

                    {/* Storage details */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-450 font-bold capitalize text-sm">Sandbox Storage</span>
                        <span className="text-white font-bold ">{kbUsed} KB Used</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                        <div className="bg-brand h-full rounded-full" style={{ width: `${Math.min(100, Number(kbUsed) * 2)}%` }} />
                      </div>

                      <div className="space-y-2.5 pt-2 font-bold capitalize text-sm tracking-wide">
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Seed Accounts Intact</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Local Auth Resolver OK</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-450">
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Security Gate Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Security scan console */}
                    <div className="pt-3 border-t border-zinc-900 space-y-2">
                      <span className="text-sm capitalize font-bold  text-zinc-550 block">Database Security Check</span>
                      {isScanning ? (
                        <div className="space-y-2 bg-zinc-950 p-2.5 rounded border border-zinc-900">
                          <div className="flex justify-between items-center text-sm  text-zinc-455">
                            <span className="animate-pulse">Scanning database...</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-zinc-800">
                            <div className="bg-brand h-full rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
                          </div>
                        </div>
                      ) : scanResults ? (
                        <div className="bg-zinc-905 p-2.5 rounded border border-zinc-850 space-y-2 animate-in fade-in duration-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 px-2 py-0.5 rounded font-bold  capitalize ">SECURE</span>
                            <span className="text-sm text-zinc-550 ">{scanResults.timestamp}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 text-sm text-zinc-400 font-semibold capitalize">
                            {scanResults.checks.map(chk => (
                              <div key={chk.name} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-450 shrink-0" />
                                <span className="truncate">{chk.name}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setScanResults(null)}
                            className="w-full py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-855 text-zinc-500 hover:text-white rounded text-sm font-bold capitalize  cursor-pointer transition"
                          >
                            Dismiss Report
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleRunSecurityCheck}
                          className="w-full py-2 bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 border border-brand/20 hover:border-brand rounded text-sm font-bold capitalize  cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-brand hover:text-zinc-955 transition-colors" /> Scan Integrity & Schemas
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub-admins list table */}
                <div className="pt-4 space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                    <h4 className="font-header font-bold text-zinc-300 text-sm capitalize ">Active Sub-Admin Personnel</h4>
                    <div className="flex gap-2">
                      <button onClick={() => handleExportPDF('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize">Export PDF</button>
                      <button onClick={() => handleExportImage('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize">Export Image</button>
                    </div>
                  </div>
                  <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-955">
                    <div className="overflow-x-auto w-full">
                      <table id="subadmins-table" className="w-full text-sm border-collapse min-w-[650px]">
                        <thead>
                          <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                            <th className="p-3 whitespace-nowrap">Staff Name</th>
                            <th className="p-3 whitespace-nowrap">Email Address</th>
                            <th className="p-3 whitespace-nowrap">Scopes Enabled</th>
                            <th className="p-3 text-center whitespace-nowrap">Edit Scopes</th>
                            <th className="p-3 text-center whitespace-nowrap">Delete</th>
                          </tr>
                        </thead>
                         <tbody>
                          {isDbLoading ? (
                            <SkeletonTableRows cols={5} />
                          ) : subAdminsList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-5 text-center text-zinc-500 italic whitespace-nowrap">No sub-admin accounts registered. Create accounts inside the "Roles & Scopes" tab.</td>
                            </tr>
                          ) : (
                            subAdminsList.map(admin => {
                              const { cleanName, roleTitle } = parseStaffDetails(admin);
                              return (
                                <tr key={admin.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                  <td className="p-3 whitespace-nowrap">
                                    <span className="font-bold text-white block">{cleanName}</span>
                                    {roleTitle && (
                                      <span className="text-sm bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded font-bold  capitalize  inline-block mt-1">
                                        {roleTitle}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-zinc-400 whitespace-nowrap">{admin.email}</td>
                                  <td className="p-3 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                      {(() => {
                                        const perms = admin.permissions || [];
                                        const activeModules = PRIVILEGE_MODULES.filter(m =>
                                          perms.includes(m.id) ||
                                          m.actions.some(act => perms.includes(act.id)) ||
                                          (m.id === 'manage_users' && perms.includes('MANAGE_USERS')) ||
                                          (m.id === 'manage_psychologists' && perms.includes('MANAGE_PSYCHOLOGISTS')) ||
                                          (m.id === 'manage_bookings' && perms.includes('MANAGE_BOOKINGS'))
                                        );
                                        if (activeModules.length === 0) {
                                          return <span className="text-xs text-zinc-600 italic">No permissions</span>;
                                        }
                                        const visible = activeModules.slice(0, 3);
                                        const hidden = activeModules.length - 3;
                                        return (
                                          <>
                                            {visible.map(m => (
                                              <span key={m.id} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-[10px] font-bold text-zinc-400 capitalize">
                                                {m.name.replace(' Management', '').replace(' & Leads', '')}
                                              </span>
                                            ))}
                                            {hidden > 0 && (
                                              <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-[10px] font-bold text-brand capitalize">
                                                +{hidden} more
                                              </span>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => handleOpenEditSubAdmin(admin)}
                                      className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-855 transition cursor-pointer text-sm font-bold capitalize "
                                    >
                                      Edit
                                    </button>
                                  </td>
                                  <td className="p-3 text-center space-x-1 whitespace-nowrap">
                                    <button
                                      onClick={() => handleGenerateResetToken(admin.email)}
                                      className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer inline-flex"
                                      title="Generate Password Reset Link"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(admin.id)}
                                      className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                      title="Delete sub-admin account"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            );
}