import { useState, useEffect, useMemo } from 'react';
import ApiService from '../../../services/api';
import { isSessionCompleted } from '../utils/utils';
import { useAuth } from '../../../context/AuthContext';
import { useCustomDialog } from '../../../context/CustomDialogContext';

/**
 * Hook to manage student bookings and sessions logic.
 *
 * @returns {Object} Booked sessions, filters, and handlers.
 */
export function useStudentSessions() {
  const [bookedSessions, setBookedSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [sessionFilter, setSessionFilter] = useState('all');
  const [sessionSubTab, setSessionSubTab] = useState('upcoming');
  
  const { user, isLoading: authLoading } = useAuth();
  const { showPrompt, showAlert } = useCustomDialog();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsRes = await ApiService.getSessions();
        if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
          const list = sessionsRes.data;
          setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
          setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
        }
      } catch (err) {
        console.error('Failed to load student sessions:', err);
      }
    };

    const hasToken = !!localStorage.getItem('behold_token');
    const isStudent = user && user.role?.toUpperCase() === 'USER';

    if (isStudent && hasToken && !authLoading) {
      fetchSessions();
    }
  }, [user, authLoading]);

  const handleCancelSession = async (sessionId) => {
    const reason = await showPrompt('Please provide a reason for cancelling this session:', '', 'Cancel Session', 'Enter reason here...');
    if (reason === null) return;

    try {
      const session = bookedSessions.find(b => b.id === sessionId);
      if (session) {
        if (isSessionCompleted(session)) {
          await showAlert('Cannot cancel a session that is already in the past or completed.', 'Error');
          return;
        }

        try {
          const [year, month, day] = session.date.split('-').map(Number);
          const timeParts = session.time.split(' ');
          let [hours, minutes] = timeParts[0].split(':').map(Number);
          const meridiem = timeParts[1];
          if (meridiem === 'PM' && hours < 12) hours += 12;
          if (meridiem === 'AM' && hours === 12) hours = 0;
          
          const sessionTime = new Date(year, month - 1, day, hours, minutes);
          const now = new Date();
          const diffMs = sessionTime - now;
          const diffHours = diffMs / (1000 * 60 * 60);
          
          if (diffHours < 1) {
            await showAlert('Cannot cancel a session less than 1 hour before the scheduled time.', 'Error');
            return;
          }
        } catch (e) {
          console.error("Error parsing session datetime for cancel check", e);
        }
      }

      // Optimistic local removal
      setBookedSessions(prev => prev.filter(b => b.id !== sessionId));

      await ApiService.cancelAppointment(sessionId, reason);

      ApiService.getSessions().then(sessionsRes => {
        if (sessionsRes.success && Array.isArray(sessionsRes.data)) {
          const list = sessionsRes.data;
          setBookedSessions(list.filter(b => b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && !isSessionCompleted(b)));
          setCompletedSessions(list.filter(b => b.status === 'COMPLETED' || isSessionCompleted(b)));
        }
      }).catch(() => {});
    } catch (error) {
      await showAlert(error.message || 'Failed to cancel session', 'Error');
    }
  };

  const filteredBooked = useMemo(() => {
    if (sessionFilter === 'all') return bookedSessions;
    if (sessionFilter === 'online') return bookedSessions.filter(s => s.mode === 'ONLINE');
    if (sessionFilter === 'offline') return bookedSessions.filter(s => s.mode !== 'ONLINE');
    if (sessionFilter === 'pending') return bookedSessions.filter(s => s.status === 'PENDING');
    return bookedSessions;
  }, [bookedSessions, sessionFilter]);

  const filterChips = useMemo(() => [
    { id: 'all', label: 'All', count: bookedSessions.length },
    { id: 'online', label: 'Online', count: bookedSessions.filter(s => s.mode === 'ONLINE').length },
    { id: 'offline', label: 'In-Person', count: bookedSessions.filter(s => s.mode !== 'ONLINE').length },
    { id: 'pending', label: 'Pending', count: bookedSessions.filter(s => s.status === 'PENDING').length },
  ], [bookedSessions]);

  const actualCompletedCount = completedSessions.filter(s => !['EXPIRED', 'CANCELLED', 'REJECTED'].includes(s.status)).length;
  const stats = {
    total: bookedSessions.length + completedSessions.length,
    completed: actualCompletedCount,
    upcoming: bookedSessions.length,
    hours: actualCompletedCount,
  };

  return {
    bookedSessions,
    completedSessions,
    sessionFilter,
    sessionSubTab,
    filteredBooked,
    filterChips,
    stats,
    setSessionFilter,
    setSessionSubTab,
    handleCancelSession
  };
}
