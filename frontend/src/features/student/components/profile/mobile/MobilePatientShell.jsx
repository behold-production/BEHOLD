import React, { useState, useEffect } from 'react';
import MobileAppNavBar from './MobileAppNavBar';
import MobileHomeScreen from './MobileHomeScreen';
import MobileAppointmentsScreen from './MobileAppointmentsScreen';
import MobileRecordsScreen from './MobileRecordsScreen';
import MobileProfileScreen from './MobileProfileScreen';

/**
 * MobilePatientShell
 * Native mobile app shell matching CarePro PatientShell (care_pro)
 * Renders on mobile screens with bottom navigation bar and native screens.
 */
export default function MobilePatientShell({
  initialTab = 0,
  profile = {},
  user = {},
  formData = {},
  displayName = 'Client',
  completion = 0,
  bookedSessions = [],
  completedSessions = [],
  nextSession = null,
  onOpenBooking,
  handleCancelSession,
  downloadPDFReceiptForSession,
  downloadConsultationReportPDF,
  onSubmitFeedback,
  submittedFeedbackIds,
  handleChange,
  handleSave,
  isSaving,
  handleProfilePicUpload,
  permissionState,
  handleEnableNotifications,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync with initialTab prop if updated from URL
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const upcomingCount = bookedSessions.filter((s) => {
    const st = (s.status || '').toLowerCase();
    return st !== 'completed' && st !== 'cancelled' && st !== 'refunded';
  }).length;

  return (
    <div className="block md:hidden min-h-screen bg-[#F8FAFC]">
      {/* Active Screen */}
      <main className="min-h-screen">
        {activeTab === 0 && (
          <MobileHomeScreen
            displayName={displayName}
            profile={profile}
            nextSession={nextSession}
            onOpenBooking={onOpenBooking}
            onNavigateTab={setActiveTab}
            onEnableNotifications={handleEnableNotifications}
          />
        )}

        {activeTab === 1 && (
          <MobileAppointmentsScreen
            bookedSessions={bookedSessions}
            completedSessions={completedSessions}
            onOpenBooking={onOpenBooking}
            handleCancelSession={handleCancelSession}
            downloadPDFReceiptForSession={downloadPDFReceiptForSession}
            downloadConsultationReportPDF={downloadConsultationReportPDF}
            onSubmitFeedback={onSubmitFeedback}
            submittedFeedbackIds={submittedFeedbackIds}
          />
        )}

        {activeTab === 2 && (
          <MobileRecordsScreen
            completedSessions={completedSessions}
            profile={profile}
            formData={formData}
            downloadPDFReceiptForSession={downloadPDFReceiptForSession}
            downloadConsultationReportPDF={downloadConsultationReportPDF}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 3 && (
          <MobileProfileScreen
            profile={profile}
            formData={formData}
            handleChange={handleChange}
            handleSave={handleSave}
            isSaving={isSaving}
            handleProfilePicUpload={handleProfilePicUpload}
            permissionState={permissionState}
            handleEnableNotifications={handleEnableNotifications}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Bottom App Navigation Bar */}
      <MobileAppNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        upcomingCount={upcomingCount}
      />
    </div>
  );
}
