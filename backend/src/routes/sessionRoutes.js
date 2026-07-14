const express = require('express');
const SessionController = require('../controllers/sessionController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, SessionController.getSessions);
router.get('/:id', verifyJWT, SessionController.getSessionById);
router.put('/:id', verifyJWT, SessionController.updateSession);
router.put('/:id/meet-link', verifyJWT, requireRole('counsellor', 'admin'), SessionController.addMeetingLink);

module.exports = router;
