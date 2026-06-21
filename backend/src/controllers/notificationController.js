const StorageService = require('../services/storageService');

const NotificationController = {
  // Get notifications for logged in user
  async getNotifications(req, res, next) {
    try {
      const recipientId = req.user.id;
      const recipientRole = req.user.role;

      // Find direct notifications + global notifications
      const list = await StorageService.findAll('notifications');

      const filtered = list
        .filter(
          (n) =>
            (n.recipientId === recipientId && n.recipientRole === recipientRole) ||
            (n.recipientId === 'ALL' && n.recipientRole === recipientRole)
        )
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

      // Check authorization (recipient must match user id or be a global notification)
      const isAuthorized = notification.recipientId === 'ALL' || notification.recipientId === req.user.id;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const updated = await StorageService.update('notifications', id, { isRead: true });

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
      const recipientRole = req.user.role;

      const list = await StorageService.findAll('notifications');

      let updatedCount = 0;
      for (const n of list) {
        const isMatch =
          (n.recipientId === recipientId || n.recipientId === 'ALL') && n.recipientRole === recipientRole && !n.isRead;

        if (isMatch) {
          await StorageService.update('notifications', n.id, { isRead: true });
          updatedCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully marked ${updatedCount} notifications as read`
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = NotificationController;
