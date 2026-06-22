import ApiService from './api';

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (e) {
    return 'default';
  }
};

export const sendLocalNotification = (title, body, options = {}) => {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(title, {
      body,
      tag: options.tag || 'behold-alert',
      renotify: options.renotify !== false,
      ...options
    });

    notification.onclick = () => {
      window.focus();
      if (options.onClickUrl && window.spaNavigate) {
        window.spaNavigate(options.onClickUrl);
      }
      notification.close();
    };

    return notification;
  } catch (e) {
    console.error('Failed to show notification', e);
    return null;
  }
};

// Tracks and fetches new notifications from backend and fires local device notification alerts
export const syncAndNotifyLocal = async (userId, userRole) => {
  if (!userId || !userRole) return;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

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
      const newNotifications = unreadNotifications.filter(n => !notifiedList.includes(n.id));

      if (newNotifications.length > 0) {
        // Trigger a native notification for each new alert
        newNotifications.forEach(n => {
          sendLocalNotification(n.title, n.message, {
            tag: n.id,
            onClickUrl: userRole.toUpperCase() === 'ADMIN' 
              ? '/admin' 
              : userRole.toUpperCase() === 'PSYCHOLOGIST' || userRole.toUpperCase() === 'COUNSELLOR'
                ? '/counsellor'
                : '/profile?tab=booked'
          });
          notifiedList.push(n.id);
          // Sync read status to backend database
          ApiService.markNotificationRead(n.id).catch(err => {
            console.error(`Failed to mark notification ${n.id} as read on backend:`, err);
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
