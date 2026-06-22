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
    <div className="pt-5 sm:pt-20 pb-24 lg:pb-12 min-h-screen bg-zinc-50 text-zinc-900 font-sans text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
        {(isLoading || authLoading) ? (
          <div className="animate-pulse space-y-5 sm:space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-zinc-200">
              <div className="w-20 h-20 rounded-2xl bg-zinc-200 shrink-0"></div>
              <div className="flex-1 w-full space-y-3">
                <div className="h-6 bg-zinc-200 rounded-md w-1/3"></div>
                <div className="h-4 bg-zinc-200 rounded-md w-1/4"></div>
                <div className="flex gap-4 mt-4">
                  <div className="h-4 bg-zinc-200 rounded-md w-24"></div>
                  <div className="h-4 bg-zinc-200 rounded-md w-24"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <aside className="lg:col-span-3">
                <div className="card-luxury border-none rounded-xl p-3 space-y-2">
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                  <div className="h-10 bg-zinc-200 rounded-lg w-full"></div>
                </div>
              </aside>
              <main className="lg:col-span-9 space-y-5">
                <div className="h-8 bg-zinc-200 rounded-md w-1/4 mb-4"></div>
                <div className="h-32 bg-zinc-200 rounded-xl w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="h-24 bg-zinc-200 rounded-xl w-full"></div>
                  <div className="h-24 bg-zinc-200 rounded-xl w-full"></div>
                </div>
              </main>
            </div>
          </div>
        ) : (
          <>
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
