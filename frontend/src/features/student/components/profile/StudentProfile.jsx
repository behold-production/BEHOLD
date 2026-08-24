import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  requestNotificationPermission, 
  sendLocalNotification,
  getNotificationPermission
} from '../../../../services/notificationHelper';
import { useCustomDialog } from '../../../../context/CustomDialogContext';
import ApiService from '../../../../services/api';

import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useStudentSessions } from '../../hooks/useStudentSessions';
import { useStudentAptitude } from '../../hooks/useStudentAptitude';
import { downloadPDFReceiptForSession, downloadCertificatePDF as downloadCertPDF, downloadConsultationReportPDF, getMeetLinkStatus } from '../../utils/utils';
import HeroHeader from './HeroHeader';
import SidebarNav from './SidebarNav';
import OverviewTab from './OverviewTab';
import ProfileDetailsTab from './ProfileDetailsTab';
import BookedSessionsTab from './BookedSessionsTab';
import ResultsTab from './ResultsTab';
import SEO from '../../../../components/common/SEO';

export default function StudentProfile({ onOpenBooking }) {
  const { showAlert } = useCustomDialog();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSection = useMemo(() => {
    const rawTab = (searchParams.get('tab') || 'overview').toLowerCase();
    if (rawTab === 'cdat' || rawTab === 'aptitude') return 'results';
    if (rawTab === 'sessions' || rawTab === 'appointments' || rawTab === 'bookings') return 'booked';
    if (rawTab === 'profile' || rawTab === 'settings' || rawTab === 'account') return 'details';
    if (['overview', 'details', 'booked', 'results'].includes(rawTab)) return rawTab;
    return 'overview';
  }, [searchParams]);
  const [permissionState, setPermissionState] = useState(() => getNotificationPermission());

  const handleSectionChange = (sectionId) => {
    setSearchParams({ tab: sectionId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const {
    profile, setProfile, formData, isSaved, isSaving, errors, isLoading,
    completion, greeting, displayName, handleChange, handleDiscard, handleSave, handleProfilePicUpload
  } = useStudentProfile();

  const {
    bookedSessions, completedSessions, sessionFilter, sessionSubTab,
    filteredBooked, filterChips, stats, setSessionFilter, setSessionSubTab, handleCancelSession
  } = useStudentSessions();

  const {
    testProfile, cigiFile, cigiDate, cigiTime, cigiNote, isCigiUploading,
    fileInputRef, setCigiFile, setCigiDate, setCigiTime, setCigiNote, handleCigiUpload, handleCigiDelete
  } = useStudentAptitude(setProfile);

  const authLoading = isLoading; // alias for UI compatibility
  const user = { name: displayName, role: 'USER' }; // simplified compatibility

  // Track which sessions have already been reviewed (persist in localStorage)
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState(() => {
    try {
      const stored = localStorage.getItem('behold_submitted_feedbacks');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  const handleSubmitFeedback = useCallback(async (session, rating, comment) => {
    const sessionId = session._id || session.id || session.bookingId;
    try {
      await ApiService.post('/api/feedbacks', {
        counsellorId: session.advisorId || session.counsellorId,
        rating: parseInt(rating),
        comment: comment.trim()
      });
      setSubmittedFeedbackIds(prev => {
        const next = new Set(prev);
        next.add(sessionId);
        try { localStorage.setItem('behold_submitted_feedbacks', JSON.stringify([...next])); } catch {}
        return next;
      });
      toast.success('Thank you for your review! ⭐');
    } catch (err) {
      toast.error('Failed to submit review. Please try again.');
    }
  }, []);

  // App settings
  const enablePsychology = useMemo(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) return JSON.parse(stored).enablePsychology !== false;
    } catch (e) {}
    return true;
  }, []);
  
  const enableCareerMentoring = useMemo(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) return JSON.parse(stored).enableCareerMentoring !== false;
    } catch (e) {}
    return true;
  }, []);
  
  const enableAptitude = useMemo(() => {
    try {
      const stored = localStorage.getItem('behold_site_settings');
      if (stored) return JSON.parse(stored).enableAptitude !== false;
    } catch (e) {}
    return true;
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermissionState(result);
    if (result === 'granted') {
      toast.success('Browser notifications enabled successfully!');
      sendLocalNotification('Notifications Active!', 'You will now receive desktop alerts from BEHOLD.');
    } else if (result === 'denied') {
      toast.error('Notification permission was denied. You may need to enable it in your browser settings.');
    }
  };

  const handleTestNotification = () => {
    const sent = sendLocalNotification('Test Notification', 'Hello! This is a test notification from BEHOLD.');
    if (sent) toast.success('Test notification sent successfully!');
    else toast.error('Failed to send test notification. Make sure permissions are granted.');
  };

  const downloadCertificatePDF = async (session) => {
    await downloadCertPDF(session, profile, user);
  };

  const nextSession = bookedSessions[0];

 return (
 <div className="pt-24 sm:pt-32 pb-24 lg:pb-12 min-h-screen bg-transparent text-surface-900 font-sans text-left relative overflow-hidden">
 <SEO title="Student Profile | BEHOLD." noindex={true} />
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

 <main className="lg:col-span-9 min-w-0 animate-fade-scale">
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
 onOpenBooking={onOpenBooking}
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
 enableAptitude={enableAptitude}
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
 downloadConsultationReportPDF={(session) => downloadConsultationReportPDF(session, profile, user)}
 onOpenBooking={onOpenBooking}
 submittedFeedbackIds={submittedFeedbackIds}
 onSubmitFeedback={handleSubmitFeedback}
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
