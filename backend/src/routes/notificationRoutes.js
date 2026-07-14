const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, NotificationController.getNotifications);
router.put('/read-all', verifyJWT, NotificationController.markAllAsRead);
router.put('/:id/read', verifyJWT, NotificationController.markAsRead);

module.exports = router;
