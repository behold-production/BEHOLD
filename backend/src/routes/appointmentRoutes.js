const express = require('express');
const AppointmentController = require('../controllers/appointmentController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, AppointmentController.getUserAppointments);
router.post('/', verifyJWT, requireRole('user'), AppointmentController.createAppointment);
router.put('/:id/approve', verifyJWT, requireRole('counsellor', 'admin'), AppointmentController.approveAppointment);
router.put('/:id/reject', verifyJWT, requireRole('counsellor', 'admin'), AppointmentController.rejectAppointment);
router.put('/:id/complete', verifyJWT, requireRole('counsellor', 'admin'), AppointmentController.completeAppointment);
router.put('/:id/send-report', verifyJWT, requireRole('counsellor', 'admin'), AppointmentController.sendReportToAdmin);
router.put('/:id/revert', verifyJWT, requireRole('counsellor', 'admin'), AppointmentController.revertToConfirmed);
router.put('/:id/reschedule', verifyJWT, AppointmentController.rescheduleAppointment);
router.put('/:id/cancel', verifyJWT, AppointmentController.cancelAppointment);
router.put('/:id/meet-link', verifyJWT, AppointmentController.updateMeetLink);
router.put('/:id/feedback', verifyJWT, AppointmentController.updateFeedback);

module.exports = router;
