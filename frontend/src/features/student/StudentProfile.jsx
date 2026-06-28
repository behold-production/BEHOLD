import React from 'react';
import { useStudentProfileViewModel } from './student-profile/useStudentProfileViewModel';
import { downloadPDFReceiptForSession, getMeetLinkStatus } from './student-profile/utils';

import HeroHeader from './student-profile/tabs/HeroHeader';
import SidebarNav from './student-profile/tabs/SidebarNav';
import OverviewTab from './student-profile/tabs/OverviewTab';
import ProfileDetailsTab from './student-profile/tabs/ProfileDetailsTab';
import BookedSessionsTab from './student-profile/tabs/BookedSessionsTab';
import ResultsTab from './student-profile/tabs/ResultsTab';

export default function StudentProfile() {
  const {
    profile,
    formData,
    isSaved,
    isSaving,
    errors,
    isLoading,
    bookedSessions,
    completedSessions,
    testProfile,
    sessionFilter,
    sessionSubTab,
    cigiFile,
    cigiDate,
    cigiTime,
    cigiNote,
    isCigiUploading,
    permissionState,
    fileInputRef,
    user,
    authLoading,
    showAlert,
    navigate,
    currentSection,
    enablePsychology,
    completion,
    greeting,
    displayName,
    downloadCertificatePDF,
    handleEnableNotifications,
    handleTestNotification,
    handleSectionChange,
    handleChange,
    handleDiscard,
    handleSave,
    handleCancelSession,
    filteredBooked,
    filterChips,
    setSessionFilter,
    setSessionSubTab,
    handleCigiUpload,
    handleCigiDelete,
    handleProfilePicUpload,
    setCigiFile,
    setCigiDate,
    setCigiTime,
    setCigiNote
  } = useStudentProfileViewModel();

  const stats = {
    total: bookedSessions.length + completedSessions.length,
    completed: completedSessions.length,
    upcoming: bookedSessions.length,
    hours: completedSessions.length,
  };
  const nextSession = bookedSessions[0];

  return (
    <div className="pt-24 sm:pt-32 pb-24 lg:pb-12 min-h-screen bg-white text-surface-900 font-sans text-left relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-45 pointer-events-none" />

      {/* Decorative Line Drawings (Faint career icons) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.03] text-surface-900">
        {/* Graduation Cap - top left */}
        <svg className="absolute left-[3%] top-[15%] w-48 h-48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>

        {/* Compass/Target - top right */}
        <svg className="absolute right-[3%] top-[25%] w-56 h-56" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v20M2 12h20" />
        </svg>

        {/* Lightbulb - middle left */}
        <svg className="absolute left-[4%] top-[55%] w-52 h-52" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6M10 22h4" />
        </svg>

        {/* Career Map / Connected Nodes - bottom right */}
        <svg className="absolute right-[5%] top-[70%] w-60 h-60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <circle cx="4" cy="4" r="2" />
          <circle cx="20" cy="4" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="8" cy="20" r="2" />
          <circle cx="16" cy="20" r="2" />
          <path d="M6 4h12M12 10V6M4 6l6 5M20 6l-6 5M10 13l-2 5M14 13l2 5" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
        {(isLoading || authLoading) ? (
          <div className="animate-pulse space-y-5 sm:space-y-6">
            <div className="bg-white rounded-none p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-surface-200">
              <div className="w-20 h-20 rounded-none bg-surface-200 shrink-0"></div>
              <div className="flex-1 w-full space-y-3">
                <div className="h-6 bg-surface-200 rounded-none w-1/3"></div>
                <div className="h-4 bg-surface-200 rounded-none w-1/4"></div>
                <div className="flex gap-4 mt-4">
                  <div className="h-4 bg-surface-200 rounded-none w-24"></div>
                  <div className="h-4 bg-surface-200 rounded-none w-24"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <aside className="lg:col-span-3">
                <div className="bg-white border border-surface-200 rounded-none p-3 space-y-2">
                  <div className="h-10 bg-surface-200 rounded-none w-full"></div>
                  <div className="h-10 bg-surface-200 rounded-none w-full"></div>
                  <div className="h-10 bg-surface-200 rounded-none w-full"></div>
                  <div className="h-10 bg-surface-200 rounded-none w-full"></div>
                </div>
              </aside>
              <main className="lg:col-span-9 space-y-5">
                <div className="h-8 bg-surface-200 rounded-none w-1/4 mb-4"></div>
                <div className="h-32 bg-surface-200 rounded-none w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-24 bg-surface-200 rounded-none w-full"></div>
                  <div className="h-24 bg-surface-200 rounded-none w-full"></div>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <>
            <div className={currentSection === 'overview' ? 'block' : 'hidden lg:block'}>
              <HeroHeader
                profile={profile}
                user={user}
                displayName={displayName}
                greeting={greeting}
                completion={completion}
                testProfile={testProfile}
                stats={stats}
                handleProfilePicUpload={handleProfilePicUpload}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <aside className="lg:col-span-3">
                <SidebarNav
                  currentSection={currentSection}
                  handleSectionChange={handleSectionChange}
                  bookedSessions={bookedSessions}
                  testProfile={testProfile}
                />
              </aside>

              <main className="lg:col-span-9 min-w-0">
                {currentSection === 'overview' && (
                  <OverviewTab
                     nextSession={nextSession}
                     enablePsychology={enablePsychology}
                     navigate={navigate}
                     handleSectionChange={handleSectionChange}
                     setSessionSubTab={setSessionSubTab}
                     stats={stats}
                     testProfile={testProfile}
                     bookedSessions={bookedSessions}
                     completedSessions={completedSessions}
                     profile={profile}
                  />
                )}
                {currentSection === 'details' && (
                  <ProfileDetailsTab
                    completion={completion}
                    handleSave={handleSave}
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    permissionState={permissionState}
                    handleEnableNotifications={handleEnableNotifications}
                    handleTestNotification={handleTestNotification}
                    handleDiscard={handleDiscard}
                    isSaving={isSaving}
                    isSaved={isSaved}
                  />
                )}
                {currentSection === 'booked' && (
                  <BookedSessionsTab
                    sessionSubTab={sessionSubTab}
                    setSessionSubTab={setSessionSubTab}
                    bookedSessions={bookedSessions}
                    completedSessions={completedSessions}
                    enablePsychology={enablePsychology}
                    navigate={navigate}
                    filterChips={filterChips}
                    setSessionFilter={setSessionFilter}
                    sessionFilter={sessionFilter}
                    filteredBooked={filteredBooked}
                    getMeetLinkStatus={getMeetLinkStatus}
                    showAlert={showAlert}
                    handleCancelSession={handleCancelSession}
                    downloadPDFReceiptForSession={(session) => downloadPDFReceiptForSession(session, profile, user, showAlert)}
                    downloadCertificatePDF={downloadCertificatePDF}
                  />
                )}
                {currentSection === 'results' && (
                  <ResultsTab
                    profile={profile}
                    testProfile={testProfile}
                    navigate={navigate}
                    handleCigiUpload={handleCigiUpload}
                    fileInputRef={fileInputRef}
                    setCigiFile={setCigiFile}
                    cigiDate={cigiDate}
                    setCigiDate={setCigiDate}
                    cigiTime={cigiTime}
                    setCigiTime={setCigiTime}
                    cigiNote={cigiNote}
                    setCigiNote={setCigiNote}
                    isCigiUploading={isCigiUploading}
                    handleCigiDelete={handleCigiDelete}
                  />
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
