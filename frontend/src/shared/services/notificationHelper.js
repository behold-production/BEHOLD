import React from 'react';
import toast from 'react-hot-toast';
import ApiService from './api';

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'denied';
  try {
    return Notification.permission;
  } catch (e) {
    return 'denied';
  }
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'denied';
  try {
    return await new Promise((resolve) => {
      try {
        const res = Notification.requestPermission((perm) => {
          resolve(perm);
        });
        if (res && typeof res.then === 'function') {
          res.then(resolve).catch(() => resolve('default'));
        }
      } catch (err) {
        resolve('default');
      }
    });
  } catch (e) {
    return 'default';
  }
};

export const sendLocalNotification = async (title, body, options = {}) => {
  // Always trigger interactive in-app toast so users see alerts on all devices (mobile & desktop)
  try {
    toast(
      (t) => React.createElement(
        'div',
        {
          onClick: () => {
            toast.dismiss(t.id);
            if (options.onClickUrl && window.spaNavigate) {
              window.spaNavigate(options.onClickUrl);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          },
          className: 'cursor-pointer flex flex-col gap-1 pr-2 max-w-xs'
        },
        React.createElement('span', { className: 'font-bold text-xs text-[#0f172a] font-sans uppercase tracking-wide' }, title),
        React.createElement('span', { className: 'text-[11px] text-surface-600 font-normal leading-tight' }, body)
      ),
      {
        icon: '🔔',
        duration: 6000,
        id: options.tag || undefined
      }
    );
  } catch (e) {
    console.error('Error rendering toast notification', e);
  }

  // If native Notification is supported & granted, also send OS/device system notification
  if (isNotificationSupported() && getNotificationPermission() === 'granted') {
    const notificationOptions = {
      body,
      tag: options.tag || 'behold-alert',
      renotify: options.renotify !== false,
      icon: options.icon || '/favicon.svg',
      badge: options.badge || '/favicon.svg',
      data: {
        onClickUrl: options.onClickUrl || '/'
      },
      ...options
    };

    // Try service worker first (mobile Android / PWA)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && 'showNotification' in registration) {
          await registration.showNotification(title, notificationOptions);
          return true;
        }
      } catch (e) {}
    }

    // Fallback for desktop browsers
    try {
      const notification = new Notification(title, notificationOptions);
      notification.onclick = () => {
        window.focus();
        if (options.onClickUrl && window.spaNavigate) {
          window.spaNavigate(options.onClickUrl);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        notification.close();
      };
      return notification;
    } catch (e) {
      return null;
    }
  }

  return true;
};

// Tracks and fetches unread notifications from backend and fires local device & toast alerts
export const syncAndNotifyLocal = async (userId, userRole) => {
  if (!userId || !userRole) return;

  try {
    const res = await ApiService.getNotifications();
    if (res.success && Array.isArray(res.data)) {
      // Get list of already notified notification IDs from localStorage
      let notifiedList = [];
      try {
        const stored = localStorage.getItem(`behold_notified_${userId}`);
        if (stored) notifiedList = JSON.parse(stored);
      } catch (e) {}

      const unreadNotifications = res.data.filter(n => !n.isRead);
      const newNotifications = unreadNotifications.filter(n => !notifiedList.includes(n.id || n._id));

      if (newNotifications.length > 0) {
        // Trigger a notification for each new alert
        newNotifications.forEach(n => {
          const notifId = n.id || n._id;
          sendLocalNotification(n.title, n.message, {
            tag: notifId,
            onClickUrl: userRole.toUpperCase() === 'ADMIN' || userRole.toUpperCase() === 'SUPER_ADMIN' || userRole.toUpperCase() === 'SUB_ADMIN'
              ? '/admin' 
              : userRole.toUpperCase() === 'PSYCHOLOGIST' || userRole.toUpperCase() === 'COUNSELLOR'
                ? '/counsellor'
                : '/profile?tab=booked'
          });
          notifiedList.push(notifId);
          // Sync read status to backend database
          ApiService.markNotificationRead(notifId).catch(err => {
            console.error(`Failed to mark notification ${notifId} as read on backend:`, err);
          });
        });

        // Save back to localStorage (keep max 100 items to avoid swelling)
        if (notifiedList.length > 100) {
          notifiedList = notifiedList.slice(notifiedList.length - 100);
        }
        localStorage.setItem(`behold_notified_${userId}`, JSON.stringify(notifiedList));
      }
    }
  } catch (err) {
    console.error('Failed to sync local notifications:', err);
  }
};
