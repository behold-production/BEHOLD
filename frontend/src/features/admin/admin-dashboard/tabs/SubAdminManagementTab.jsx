import React from 'react';
import { SkeletonTableRows, PaginationBar } from '../components/SharedAdminUI';
import { User, ShieldAlert, Award, Trash, Check, Plus, Lock, Settings, KeyRound, BarChart3, LogOut, Search, ShieldCheck, Calendar, Clock, Link, AlertCircle, Edit, Video, UserPlus, MessageSquare, FileSpreadsheet, HelpCircle, X, ChevronRight, ChevronLeft, Mail, Shield, Menu, Brain, Download, FileText, Eye, EyeOff, Bell, Send, Loader2 } from 'lucide-react';
import { formatDateString } from '../utils';

export default function SubAdminManagementTab(props) {
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
    isSavingForm,
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

  return (
            <div className="space-y-6 animate-in fade-in duration-200 text-sm">
              <div className="border-b border-zinc-805 pb-3">
                <h3 className="text-sm font-bold capitalize  text-white font-header">Staff Roles & Permissions Scopes</h3>
                <p className="text-sm text-zinc-500 font-medium pt-1">Create sub-admin staff, configure dynamic role titles, and adjust access permissions</p>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex gap-2 border-b border-zinc-800 pb-px">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('roles');
                    setEditingRoleId(null);
                    setNewRoleName('');
                    setNewRoleDescription('');
                    setNewRolePermissions({});
                  }}
                  className={`px-4 py-2 border-b-2 text-sm font-bold capitalize transition-all cursor-pointer border-none bg-transparent ${activeRoleTab === 'roles'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                  Roles & Staff Registry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveRoleTab('new_role');
                  }}
                  className={`px-4 py-2 border-b-2 text-sm font-bold capitalize transition-all cursor-pointer border-none bg-transparent ${activeRoleTab === 'new_role'
                    ? 'border-brand text-brand font-bold'
                    : 'border-transparent text-zinc-400 hover:text-white'
                    }`}
                >
                  {editingRoleId ? 'Edit Role' : 'Create Custom Role'}
                </button>
              </div>

              {activeRoleTab === 'roles' ? (
                <div className="space-y-6">
                  {/* Roles Registry List (Grid of roles) */}
                  <div className="border border-zinc-850 p-5 rounded-xl bg-zinc-955/40 space-y-4 text-left">
                    <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-855 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-brand" /> Active Custom Roles Registry
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRoleId(null);
                          setNewRoleName('');
                          setNewRoleDescription('');
                          setNewRolePermissions({});
                          setActiveRoleTab('new_role');
                        }}
                        className="text-xs bg-brand/10 hover:bg-brand text-brand hover:text-zinc-955 px-2.5 py-1 rounded border border-brand/20 hover:border-brand font-bold capitalize transition-all cursor-pointer"
                      >
                        + Add Custom Role
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[350px] overflow-y-auto pr-1">
                      {isDbLoading ? (
                        [...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse bg-zinc-900 border border-zinc-850 p-4 rounded-lg flex flex-col justify-between space-y-3 h-[110px]">
                            <div className="h-4 bg-zinc-800 rounded w-1/3" />
                            <div className="h-3 bg-zinc-850 rounded w-2/3" />
                            <div className="flex gap-1.5">
                              <div className="h-5 bg-zinc-850 rounded w-16" />
                              <div className="h-5 bg-zinc-850 rounded w-16" />
                            </div>
                          </div>
                        ))
                      ) : rolesDb.length === 0 ? (
                        <div className="col-span-3 text-center text-zinc-550 italic py-6">No custom roles defined yet.</div>
                      ) : (
                        rolesDb.map(role => {
                          const isProtected = ['role_hr', 'role_state', 'role_scheduler', 'role_finance'].includes(role.id);
                          const enabledModules = PRIVILEGE_MODULES.filter(m =>
                            role.permissions.includes(m.id) ||
                            m.actions.some(act => role.permissions.includes(act.id)) ||
                            (m.id === 'manage_users' && role.permissions.includes('MANAGE_USERS')) ||
                            (m.id === 'manage_psychologists' && role.permissions.includes('MANAGE_PSYCHOLOGISTS')) ||
                            (m.id === 'manage_bookings' && role.permissions.includes('MANAGE_BOOKINGS'))
                          );
                          const memberCount = subAdminsList.filter(a => a.customRoleTitle === role.name).length;
                          return (
                            <div key={role.id} className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-1">
                                  <div className="min-w-0">
                                    <span className="font-header font-bold text-white capitalize text-sm truncate block">{role.name}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-block mt-1 ${
                                      memberCount > 0
                                        ? 'bg-brand/10 border-brand/20 text-brand'
                                        : 'bg-zinc-950 border-zinc-800 text-zinc-550'
                                    }`}>
                                      {memberCount} {memberCount === 1 ? 'staff' : 'staff'} assigned
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleEditRoleClick(role)}
                                      className="text-brand hover:underline font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDuplicateRole(role)}
                                      className="text-zinc-400 hover:text-white font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                      title="Duplicate this role"
                                    >
                                      Clone
                                    </button>
                                    {!isProtected && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRole(role)}
                                        className="text-rose-500 hover:text-rose-455 font-bold text-xs capitalize cursor-pointer border-none bg-transparent"
                                      >
                                        Delete
                                      </button>
                                    )}
                                    {isProtected && (
                                      <span className="text-[10px] text-zinc-550 border border-zinc-800 bg-zinc-950 px-1 py-0.2 rounded capitalize font-bold">System</span>
                                    )}
                                  </div>
                                </div>
                                {role.description ? (
                                  <p className="text-xs text-zinc-400 font-medium leading-normal line-clamp-2">{role.description}</p>
                                ) : (
                                  <p className="text-xs text-zinc-600 font-medium italic">No description provided</p>
                                )}
                              </div>

                              <div className="space-y-1.5 border-t border-zinc-900/60 pt-3">
                                <span className="text-[10px] text-zinc-500 font-bold capitalize block">Modules ({enabledModules.length})</span>
                                <div className="flex flex-wrap gap-1">
                                  {enabledModules.length > 0 ? (
                                    enabledModules.map(m => (
                                      <span key={m.id} className="px-1.5 py-0.5 rounded bg-zinc-955 text-[10px] text-zinc-400 capitalize border border-zinc-850">
                                        {m.name.replace(' Management', '').replace(' & Leads', '')}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs text-zinc-650 italic">No access permissions</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Staff Provisioning Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Registration form */}
                    <form onSubmit={handleCreateSubAdmin} className="lg:col-span-7 bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4 text-left">
                      <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-brand" /> Register Staff Profile
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Staff Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sandra Tomy"
                            value={subAdminForm.name}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Role Title</label>
                          <select
                            value={subAdminForm.roleName}
                            onChange={(e) => handleRoleChangeInForm(e.target.value)}
                            disabled={rolesDb.length === 0}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {rolesDb.length === 0 ? (
                              <option value="">-- No Roles Defined --</option>
                            ) : (
                              rolesDb.map(r => (
                                <option key={r.id} value={r.name}>{r.name}</option>
                              ))
                            )}
                          </select>
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="staff@example.com"
                            value={subAdminForm.email}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-zinc-400 font-bold capitalize text-sm ">Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={subAdminForm.password}
                            onChange={(e) => setSubAdminForm({ ...subAdminForm, password: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                          />
                        </div>
                      </div>

                      {subAdminError && (
                        <p className="text-sm text-rose-500 font-bold capitalize ">{subAdminError}</p>
                      )}

                      {subAdminSuccess && (
                        <p className="text-sm text-emerald-500 font-bold capitalize">{subAdminSuccess}</p>
                      )}

                      <button
                        type="submit"
                        disabled={isRegistering || isSavingForm}
                        className="w-full py-3 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize rounded-lg cursor-pointer transition border-none shadow-md flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRegistering || isSavingForm ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-955" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-zinc-955" />
                        )}
                        Register Sub-Admin Profile
                      </button>
                    </form>

                    {/* Role Scopes Viewer */}
                    <div className="lg:col-span-5 border border-zinc-850 p-5 rounded-xl bg-zinc-955/40 space-y-4 text-left">
                      <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-brand" /> Role Scope Permissions
                      </div>

                      {rolesDb.length === 0 ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm rounded-xl space-y-2">
                          <p className="font-bold">No Custom Roles Defined</p>
                          <p className="text-sm text-zinc-400 leading-normal">
                            To register sub-admin staff, you must first define a role title and assign its permission scopes using the "Create Custom Role Title" form above.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm text-zinc-450 font-bold capitalize">Inherited Scopes for {subAdminForm.roleName}</p>

                          <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {PRIVILEGE_MODULES.map(module => {
                              const isModuleEnabled = selectedPermissions.includes(module.id) ||
                                                     module.actions.some(act => selectedPermissions.includes(act.id)) ||
                                                     (module.id === 'manage_users' && selectedPermissions.includes('MANAGE_USERS')) ||
                                                     (module.id === 'manage_psychologists' && selectedPermissions.includes('MANAGE_PSYCHOLOGISTS')) ||
                                                     (module.id === 'manage_bookings' && selectedPermissions.includes('MANAGE_BOOKINGS'));

                              const activeActions = module.actions.filter(act => selectedPermissions.includes(act.id));

                              return (
                                <div key={module.id} className={`p-3 border rounded-xl flex items-center justify-between transition-colors duration-200 ${isModuleEnabled ? 'border-brand/30 bg-brand/5 text-white' : 'border-zinc-800 bg-zinc-950/20 text-zinc-500'}`}>
                                  <div className="text-sm min-w-0">
                                    <span className={`font-bold block ${isModuleEnabled ? 'text-white' : 'text-zinc-500'}`}>{module.name}</span>
                                    {isModuleEnabled && activeActions.length > 0 ? (
                                      <span className="text-xs text-zinc-400 block mt-0.5 capitalize">
                                        Privileges: {activeActions.map(act => act.name.split(' ')[0]).join(', ')}
                                      </span>
                                    ) : isModuleEnabled ? (
                                      <span className="text-xs text-zinc-400 block mt-0.5 capitalize">
                                        Full Access (All Privileges)
                                      </span>
                                    ) : (
                                      <span className="text-xs text-zinc-600 block mt-0.5">No Access</span>
                                    )}
                                  </div>
                                  <div className={`w-5 h-5 rounded-full border transition flex items-center justify-center shrink-0 ml-2 ${isModuleEnabled ? 'border-brand bg-brand text-zinc-955' : 'border-zinc-800 text-zinc-800'}`}>
                                    {isModuleEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-admins list table */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-header font-bold text-zinc-300 text-sm capitalize ">Active Sub-Admin Personnel</h4>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleExportPDF('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize bg-transparent">Export PDF</button>
                        <button type="button" onClick={() => handleExportImage('subadmins-table', 'SubAdmins_Directory')} className="px-2 py-1 border border-zinc-800 hover:bg-zinc-850 hover:text-white text-zinc-400 text-xs font-bold rounded transition-colors cursor-pointer capitalize bg-transparent">Export Image</button>
                      </div>
                    </div>
                    <div className="border-0 sm:border border-zinc-850 rounded-none sm:rounded-lg overflow-hidden bg-transparent sm:bg-zinc-955">
                      <div className="overflow-x-auto w-full">
                        <table id="subadmins-table" className="w-full text-sm border-collapse min-w-[650px]">
                          <thead>
                            <tr className="bg-zinc-900 text-zinc-400 font-bold capitalize border-b border-zinc-850 text-left">
                              <th className="p-3">Staff Name</th>
                              <th className="p-3">Email Address</th>
                              <th className="p-3">Scopes Enabled</th>
                              <th className="p-3 text-center">Edit Scopes</th>
                              <th className="p-3 text-center">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subAdminsList.map(admin => {
                              const { cleanName, roleTitle } = parseStaffDetails(admin);
                              const perms = admin.permissions || [];
                              const enabledModules = PRIVILEGE_MODULES.filter(m =>
                                perms.includes(m.id) ||
                                m.actions.some(act => perms.includes(act.id)) ||
                                (m.id === 'manage_users' && perms.includes('MANAGE_USERS')) ||
                                (m.id === 'manage_psychologists' && perms.includes('MANAGE_PSYCHOLOGISTS')) ||
                                (m.id === 'manage_bookings' && perms.includes('MANAGE_BOOKINGS'))
                              );
                              return (
                                <tr key={admin.id} className="border-b border-zinc-900 hover:bg-zinc-900/50">
                                  <td className="p-3">
                                    <span className="font-bold text-white block">{cleanName}</span>
                                    {roleTitle && (
                                      <span className="text-sm bg-brand/10 border border-brand/20 text-brand px-1.5 py-0.5 rounded font-bold capitalize inline-block mt-1">
                                        {roleTitle}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-zinc-400">{admin.email}</td>
                                  <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                      {enabledModules.map(m => (
                                        <span key={m.id} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 capitalize">
                                          {m.name.replace(' Management', '').replace(' & Leads', '')}
                                        </span>
                                      ))}
                                      {enabledModules.length === 0 && (
                                        <span className="text-xs text-zinc-650 italic">No access permissions</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditSubAdmin(admin)}
                                      className="px-2.5 py-1 bg-zinc-900 text-brand hover:text-white rounded border border-zinc-800 hover:bg-zinc-855 transition cursor-pointer text-sm font-bold capitalize"
                                    >
                                      Edit
                                    </button>
                                  </td>
                                  <td className="p-3 text-center space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => handleGenerateResetToken(admin.email)}
                                      className="p-1.5 bg-zinc-900 text-amber-500 hover:bg-amber-900/30 hover:text-amber-400 rounded border border-zinc-800 transition cursor-pointer inline-flex"
                                      title="Generate Password Reset Link"
                                    >
                                      <KeyRound className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(admin.id)}
                                      className="p-1.5 bg-rose-955/20 text-rose-500 hover:bg-rose-900 hover:text-white rounded border border-rose-900/30 transition cursor-pointer"
                                      title="Delete sub-admin account"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {subAdminsList.length === 0 && (
                              <tr>
                                <td colSpan={5} className="p-5 text-center text-zinc-500 italic">No sub-admin accounts registered. Create accounts inside the "Roles & Scopes" tab.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* NEW ROLE / EDIT ROLE FORM */
                <form onSubmit={handleCreateRole} className="bg-zinc-950 border border-zinc-850 p-6 rounded-xl space-y-6 text-left">
                  <div className="text-sm font-bold capitalize text-zinc-400 pb-1.5 border-b border-zinc-850 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand" /> {editingRoleId ? 'Modify Custom Role details' : 'Define New Custom Role'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold capitalize text-sm">Role Title Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Admissions Lead"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold capitalize text-sm">Role Description</label>
                      <input
                        type="text"
                        placeholder="Provide a brief summary description of this role's access area..."
                        value={newRoleDescription}
                        onChange={(e) => setNewRoleDescription(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800/60 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(11,20,36,0.04),0_6px_20px_-6px_rgba(11,20,36,0.08)] focus:border-brand rounded-lg text-sm text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-zinc-400 font-bold capitalize text-sm block">All Privileges & Scope Toggles</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {PRIVILEGE_MODULES.map(module => {
                        const isParentChecked = !!newRolePermissions[module.id] ||
                                               (module.id === 'manage_users' && !!newRolePermissions['MANAGE_USERS']) ||
                                               (module.id === 'manage_psychologists' && !!newRolePermissions['MANAGE_PSYCHOLOGISTS']) ||
                                               (module.id === 'manage_bookings' && !!newRolePermissions['MANAGE_BOOKINGS']);
                        return (
                          <div key={module.id} className={`bg-zinc-950 border rounded-xl overflow-hidden shadow-md text-left transition-colors duration-200 ${isParentChecked ? 'border-brand/40 bg-brand/5' : 'border-zinc-850 bg-zinc-950'}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-900/60 bg-zinc-900/40">
                              <span className="font-header font-bold text-sm text-white capitalize">{module.name}</span>
                              {/* Parent Toggle Switch */}
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isParentChecked}
                                  onChange={(e) => toggleModuleAllPermissions(module.id, module.actions, e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand peer-checked:after:bg-zinc-950 peer-checked:after:border-zinc-955"></div>
                              </label>
                            </div>

                            {/* Body (granular checkboxes) */}
                            <div className="p-4 space-y-2">
                              {module.actions.map(action => {
                                const isChecked = !!newRolePermissions[action.id];
                                return (
                                  <label key={action.id} className="flex items-center justify-between cursor-pointer text-sm select-none hover:text-white text-zinc-400 transition-colors">
                                    <span className="capitalize">{action.name.split(' ')[0]}</span>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleChildAction(module.id, action.id, module.actions)}
                                      className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-brand focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand"
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {roleError && (
                    <p className="text-sm text-rose-500 font-bold capitalize">{roleError}</p>
                  )}
                  {roleSuccess && (
                    <p className="text-sm text-emerald-500 font-bold capitalize">{roleSuccess}</p>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRoleId(null);
                        setNewRoleName('');
                        setNewRoleDescription('');
                        setNewRolePermissions({});
                        setActiveRoleTab('roles');
                      }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 text-sm font-bold capitalize transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingForm}
                      className="px-6 py-2.5 bg-brand hover:bg-brand-dark text-zinc-950 font-bold text-sm capitalize rounded-lg cursor-pointer transition shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingForm ? (
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-955" />
                      ) : (
                        <Plus className="w-4 h-4 text-zinc-955" />
                      )}
                      {editingRoleId ? 'Update Role' : 'Save Custom Role'}
                    </button>
                  </div>
                </form>
              )}
            </div>
  );
}