import React from 'react';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send } from 'lucide-react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { formatDateString } from '../utils';

export default function BookingManagementTab(props) {
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
    canAddBookings,
    canEditBookings,
    canDeleteBookings
  } = props;


            const filteredBookings = bookingsDb.filter(b => {
              const matchesSearch = (b.userName && b.userName.toLowerCase().includes(searchBooking.toLowerCase())) ||
                (b.advisorName && b.advisorName.toLowerCase().includes(searchBooking.toLowerCase())) ||
                (b.status && b.status.toLowerCase().includes(searchBooking.toLowerCase()));
              if (bookingStatusFilter === 'ALL') return matchesSearch;
              return matchesSearch && b.status === bookingStatusFilter;
            }).sort((a, b) => {
              if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
              if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
              if (a.status === 'CONFIRMED' && b.status !== 'CONFIRMED' && b.status !== 'PENDING') return -1;
              if (b.status === 'CONFIRMED' && a.status !== 'CONFIRMED' && a.status !== 'PENDING') return 1;
              return (b.date || '').localeCompare(a.date || '');
            });

            return (
              <div className="space-y-6 animate-in fade-in duration-200 text-sm">
                <div className="border-b border-zinc-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold capitalize  text-white font-header">Consultation Bookings</h3>
                    <p className="text-sm text-zinc-500 font-medium pt-1">Schedule new consultations, manage session statuses, and meeting links</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:max-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchBooking}
                        onChange={(e) => setSearchBooking(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm font-semibold focus:border-brand text-white outline-none"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                    {canAddBookings && (
                      <button
                        onClick={() => {
                          const firstStudent = usersDb.find(u => u.role === 'USER' || !u.role);
                          const firstPsy = usersDb.find(u => u.role === 'PSYCHOLOGIST');
                          let firstSlot = '';
                          if (firstPsy && firstPsy.availability?.availableSlots?.length > 0) {
                            firstSlot = firstPsy.availability.availableSlots[0];
                          }
                          setBookingForm({
                            id: '',
                            userId: firstStudent?.id || '',
                            advisorId: firstPsy?.id || '',
                            service: 'counselling',
                            mode: 'ONLINE',
                            date: getLocalTodayString(),
                            time: firstSlot,
                            meetLink: '',
                            status: 'CONFIRMED'
                          });
                          setBookingFormError('');
                          setBookingFormSuccess('');
                          setIsAddBookingOpen(true);
                        }}
                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-zinc-950 text-sm font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 capitalize shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-955" /> Schedule Booking
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Filter Tabs & Revenue Estimate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850">
                  <div className="flex flex-wrap gap-1.5">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED', 'CANCELLED'].map(status => (
                      <button
                        key={status}
                        onClick={() => { setBookingStatusFilter(status); setSelectedBookingIds([]); }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize  transition cursor-pointer border ${bookingStatusFilter === status
                          ? 'bg-brand text-zinc-955 border-brand font-bold'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                      >
                        {status} ({
                          status === 'ALL'
                            ? bookingsDb.length
                            : bookingsDb.filter(b => b.status === status).length
                        })
                      </button>
                    ))}
                  </div>

                  <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-right">
                    <span className="text-sm text-zinc-500 font-bold capitalize  block">Estimated Revenue</span>
                    <span className="text-sm font-bold text-emerald-450">₹{
                      filteredBookings.reduce((acc, b) => {
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
                      }, 0)
                    } Completed</span>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {selectedBookingIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 animate-in slide-in-from-top duration-200">
                    <span className="text-sm font-bold capitalize  text-brand ">{selectedBookingIds.length} Selected</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkBookingStatus('CONFIRMED')}
                        className="px-2.5 py-1 bg-emerald-955/20 text-emerald-400 hover:bg-emerald-900 hover:text-white rounded border border-emerald-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('COMPLETED')}
                        className="px-2.5 py-1 bg-indigo-955/20 text-indigo-400 hover:bg-indigo-900 hover:text-white rounded border border-indigo-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleBulkBookingStatus('CANCELLED')}
                        className="px-2.5 py-1 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBulkDeleteBookings}
                        className="px-2.5 py-1 bg-rose-950/40 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/50 transition text-sm font-bold capitalize cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div className="border border-zinc-850 rounded-lg overflow-hidden bg-zinc-950">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm border-collapse min-w-[850px]">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize  border-b border-zinc-850 text-left">
                          <th className="p-3 text-center w-10 whitespace-nowrap">
                            {(() => {
                              const pagedBookings = filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit);
                              return (
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBookingIds(pagedBookings.map(b => b.id));
                                    } else {
                                      setSelectedBookingIds([]);
                                    }
                                  }}
                                  checked={pagedBookings.length > 0 && pagedBookings.every(b => selectedBookingIds.includes(b.id))}
                                  className="cursor-pointer"
                                />
                              );
                            })()}
                          </th>
                          <th className="p-3 whitespace-nowrap">Student</th>
                          <th className="p-3 whitespace-nowrap">Psychologist</th>
                          <th className="p-3 whitespace-nowrap">Service / Mode</th>
                          <th className="p-3 whitespace-nowrap">Schedule</th>
                          <th className="p-3 whitespace-nowrap">Meeting Room</th>
                          <th className="p-3 text-center whitespace-nowrap">Status</th>
                          <th className="p-3 text-center font-bold whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isDbLoading ? (
                          <SkeletonTableRows cols={8} />
                        ) : filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-zinc-500 italic whitespace-nowrap">No bookings scheduled in the system matching the active filters.</td>
                          </tr>
                        ) : (
                          filteredBookings.slice((bookingPage - 1) * bookingLimit, bookingPage * bookingLimit).map(booking => (
                            <tr key={booking.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                              <td className="p-3 text-center whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedBookingIds.includes(booking.id)}
                                  onChange={() => handleToggleSelectBooking(booking.id)}
                                  className="cursor-pointer"
                                />
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold text-white block leading-tight">{booking.userName}</span>
                                <span className="text-sm text-zinc-500">ID: {booking.userId}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-bold text-white block leading-tight">{booking.advisorName}</span>
                                <span className="text-sm text-zinc-500">{booking.advisorRole}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="font-semibold block capitalize text-white leading-tight">
                                  {booking.service === 'counselling' ? 'Emotional Wellbeing' : 'Career Mapping'}
                                </span>
                                <span className="text-sm text-zinc-555 font-bold capitalize">{booking.mode}</span>
                              </td>
                              <td className="p-3 font-semibold text-zinc-300 whitespace-nowrap">
                                <span className="block">{formatDateString(booking.date)}</span>
                                <span className="text-sm text-zinc-500 font-bold">{booking.time}</span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                {booking.meetLink ? (
                                  <a
                                    href={booking.meetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand hover:underline font-bold inline-flex items-center gap-1 text-sm"
                                  >
                                    <Link className="w-3 h-3" /> Virtual Room
                                  </a>
                                ) : (
                                  <span className="text-zinc-555 italic text-sm">No Link Set</span>
                                )}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold capitalize   ${booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-955/30 border border-emerald-900/40 text-emerald-450'
                                  : booking.status === 'COMPLETED'
                                    ? 'bg-indigo-955/30 border border-indigo-900/40 text-indigo-400'
                                    : booking.status === 'EXPIRED'
                                      ? 'bg-rose-955/30 border border-rose-900/40 text-rose-400'
                                      : booking.status === 'CANCELLED'
                                        ? 'bg-rose-955/20 border border-rose-900/30 text-rose-500'
                                        : 'bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] text-zinc-455'
                                  }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  {booking.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() => downloadPDFReceipt(booking)}
                                    className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                    title="Download Receipt PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {booking.status === 'COMPLETED' && (
                                  <button
                                    onClick={() => downloadDiagnosticPDF(booking)}
                                    className="p-1.5 bg-zinc-900 text-emerald-500 hover:text-white hover:bg-emerald-900 rounded border border-zinc-800 transition cursor-pointer"
                                    title="Download Clinical Report PDF"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {canEditBookings && (
                                <button
                                  onClick={() => handleOpenEditBooking(booking)}
                                  className="p-1.5 bg-zinc-900 text-zinc-400 hover:text-white rounded border border-zinc-800 transition cursor-pointer"
                                  title="Edit / Reschedule"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                )}
                                {canDeleteBookings && (
                                <button
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                  title="Cancel Booking"
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
                  total={filteredBookings.length}
                  page={bookingPage}
                  limit={bookingLimit}
                  onPageChange={setBookingPage}
                  onLimitChange={setBookingLimit}
                />
              </div>
            );
          

          {/* TAB: STUDENT INQUIRIES & LEADS */}
}