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
 enableCareerMentoring,
 enableAptitude,
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

 const actualCompletedCount = completedSessions.filter(s => !['EXPIRED', 'CANCELLED', 'REJECTED'].includes(s.status)).length;
 const stats = {
 total: bookedSessions.length + completedSessions.length,
 completed: actualCompletedCount,
 upcoming: bookedSessions.length,
 hours: actualCompletedCount,
 };
 const nextSession = bookedSessions[0];

 return (
 <div className="pt-24 sm:pt-32 pb-24 lg:pb-12 min-h-screen bg-transparent text-surface-900 font-sans text-left relative overflow-hidden">
 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
 {(isLoading || authLoading) ? (
 <div className="animate-pulse space-y-5 sm:space-y-6">
 <div className="bg-white rounded-[10px] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-surface-200">
 <div className="w-20 h-20 rounded-[10px] bg-surface-200 shrink-0"></div>
 <div className="flex-1 w-full space-y-3">
 <div className="h-6 bg-surface-200 rounded-[10px] w-1/3"></div>
 <div className="h-4 bg-surface-200 rounded-[10px] w-1/4"></div>
 <div className="flex gap-4 mt-4">
 <div className="h-4 bg-surface-200 rounded-[10px] w-24"></div>
 <div className="h-4 bg-surface-200 rounded-[10px] w-24"></div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
 <aside className="lg:col-span-3">
 <div className="bg-white border border-surface-200 rounded-[10px] p-3 space-y-2">
 <div className="h-10 bg-surface-200 rounded-[10px] w-full"></div>
 <div className="h-10 bg-surface-200 rounded-[10px] w-full"></div>
 <div className="h-10 bg-surface-200 rounded-[10px] w-full"></div>
 <div className="h-10 bg-surface-200 rounded-[10px] w-full"></div>
 </div>
 </aside>
 <main className="lg:col-span-9 space-y-5">
 <div className="h-8 bg-surface-200 rounded-[10px] w-1/4 mb-4"></div>
 <div className="h-32 bg-surface-200 rounded-[10px] w-full"></div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="h-24 bg-surface-200 rounded-[10px] w-full"></div>
 <div className="h-24 bg-surface-200 rounded-[10px] w-full"></div>
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
 <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
 <SidebarNav
 currentSection={currentSection}
 handleSectionChange={handleSectionChange}
 bookedSessions={bookedSessions}
 testProfile={testProfile}
 enableAptitude={enableAptitude}
 />
 </aside>

 <main className="lg:col-span-9 min-w-0">
 {currentSection === 'overview' && (
 <OverviewTab
 nextSession={nextSession}
 enablePsychology={enablePsychology}
 enableCareerMentoring={enableCareerMentoring}
 navigate={navigate}
 handleSectionChange={handleSectionChange}
 setSessionSubTab={setSessionSubTab}
 stats={stats}
 testProfile={testProfile}
 bookedSessions={bookedSessions}
 completedSessions={completedSessions}
 profile={profile}
 enableAptitude={enableAptitude}
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
 enableCareerMentoring={enableCareerMentoring}
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
 enableAptitude={enableAptitude}
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
