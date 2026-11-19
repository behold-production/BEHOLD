import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../context/AuthContext';
import ApiService from '../../../../../services/api';
import MobileHomeScreen from './MobileHomeScreen';
import MobileAppNavBar from './MobileAppNavBar';

/**
 * MobileHomeContainer
 * Top-level mobile screen for `/` matching CarePro PatientShell (care_pro)
 */
export default function MobileHomeContainer({ onOpenBooking }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextSession, setNextSession] = useState(null);
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    ApiService.getMyBookings()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const upcoming = list.filter((s) => {
          const st = (s.status || '').toLowerCase();
          return st !== 'completed' && st !== 'cancelled' && st !== 'refunded';
        });
        setUpcomingCount(upcoming.length);
        if (upcoming.length > 0) {
          setNextSession(upcoming[0]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [user]);

  const handleTabChange = (tabId) => {
    if (tabId === 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!user) {
      window.dispatchEvent(new CustomEvent('behold:open_auth'));
      return;
    }
    if (tabId === 1) {
      navigate('/profile?tab=booked');
    } else if (tabId === 2) {
      navigate('/profile?tab=records');
    } else if (tabId === 3) {
      navigate('/profile?tab=details');
    }
  };

  const displayName = user?.name || user?.profile?.name || (user ? 'Client' : 'Friend');

  return (
    <div className="block md:hidden min-h-screen bg-[#F8FAFC]">
      <MobileHomeScreen
        displayName={displayName}
        profile={user?.profile || {}}
        nextSession={nextSession}
        onOpenBooking={onOpenBooking}
        onNavigateTab={(tab) => handleTabChange(tab)}
        onEnableNotifications={() => {
          if (!user) window.dispatchEvent(new CustomEvent('behold:open_auth'));
        }}
      />

      <MobileAppNavBar
        activeTab={0}
        onTabChange={handleTabChange}
        upcomingCount={upcomingCount}
      />
    </div>
  );
}
