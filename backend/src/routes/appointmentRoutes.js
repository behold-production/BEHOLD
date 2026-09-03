const express = require('express');
const AppointmentController = require('../controllers/appointmentController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyJWT, AppointmentController.getUserAppointments);
router.get('/introductory-eligibility', verifyJWT, AppointmentController.checkIntroductoryEligibility);
router.post('/', verifyJWT, requireRole('user'), AppointmentController.createAppointment);
router.put('/:id/approve', verifyJWT, requireRole('counsellor', 'psychologist', 'admin', 'super_admin', 'sub_admin'), AppointmentController.approveAppointment);
router.put('/:id/reject', verifyJWT, requireRole('counsellor', 'psychologist', 'admin', 'super_admin', 'sub_admin'), AppointmentController.rejectAppointment);
router.put('/:id/complete', verifyJWT, requireRole('counsellor', 'psychologist', 'admin', 'super_admin', 'sub_admin'), AppointmentController.completeAppointment);
router.put('/:id/send-report', verifyJWT, requireRole('counsellor', 'psychologist', 'admin', 'super_admin', 'sub_admin'), AppointmentController.sendReportToAdmin);
router.put('/:id/revert', verifyJWT, requireRole('counsellor', 'psychologist', 'admin', 'super_admin', 'sub_admin'), AppointmentController.revertToConfirmed);
router.put('/:id/reschedule', verifyJWT, AppointmentController.rescheduleAppointment);
router.put('/:id/cancel', verifyJWT, AppointmentController.cancelAppointment);
router.put('/:id/meet-link', verifyJWT, AppointmentController.updateMeetLink);
router.put('/:id/feedback', verifyJWT, AppointmentController.updateFeedback);

module.exports = router;
