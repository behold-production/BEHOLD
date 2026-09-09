const StorageService = require('../services/storageService');

const normalizeRecipientRole = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin' || r === 'super_admin' || r === 'sub_admin') return 'admin';
  if (r === 'counsellor' || r === 'psychologist') return 'counsellor';
  return 'user';
};

const NotificationController = {
  // Get notifications for logged in user
  async getNotifications(req, res, next) {
    try {
      const recipientId = req.user.id;
      const userRole = normalizeRecipientRole(req.user.role);

      // Find direct notifications + global notifications
      const list = await StorageService.findAll('notifications');

      const filtered = list
        .filter((n) => {
          const nRole = normalizeRecipientRole(n.recipientRole);
          const isDirect = n.recipientId === recipientId && (nRole === userRole || !n.recipientRole);
          const isGlobal =
            (n.recipientId === 'ALL' || n.recipientId === 'all') &&
            (nRole === userRole || n.recipientRole === 'ALL' || n.recipientRole === 'all');
          return isDirect || isGlobal;
        })
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: filtered
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark notification as read
  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await StorageService.findById('notifications', id);

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      // Check authorization
      const isAuthorized = notification.recipientId === 'ALL' || notification.recipientId === req.user.id;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      let updated = notification;
      // Do NOT set isRead = true for global notifications, as they are shared across users.
      // The frontend tracks read state in localStorage for globals.
      if (notification.recipientId !== 'ALL') {
        updated = await StorageService.update('notifications', id, { isRead: true });
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark all as read
  async markAllAsRead(req, res, next) {
    try {
      const recipientId = req.user.id;
      const userRole = normalizeRecipientRole(req.user.role);

      const list = await StorageService.findAll('notifications');

      let updatedCount = 0;
      for (const n of list) {
        // We only modify direct notifications
        const nRole = normalizeRecipientRole(n.recipientRole);
        const isMatch = n.recipientId === recipientId && (nRole === userRole || !n.recipientRole) && !n.isRead;

        if (isMatch) {
          await StorageService.update('notifications', n.id, { isRead: true });
          updatedCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully marked ${updatedCount} direct notifications as read`
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = NotificationController;
