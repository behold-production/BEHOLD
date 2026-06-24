const express = require('express');
const AdminController = require('../controllers/adminController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All admin routes require verifyJWT and admin role
router.use(verifyJWT, requireRole('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.put('/users/:userId/profile-pic', upload.single('profilePic'), AdminController.updateUserProfilePic);

// Admin CIGI Aptitude Test Results management
router.post('/users/:userId/cigi-results', upload.single('file'), AdminController.addCigiResult);
router.put('/users/:userId/cigi-results/:resultId', upload.single('file'), AdminController.editCigiResult);
router.delete('/users/:userId/cigi-results/:resultId', AdminController.deleteCigiResult);

router.get('/counsellors', AdminController.getCounsellors);
router.post('/counsellors', AdminController.createCounsellor);
router.put('/counsellors/:id', AdminController.updateCounsellor);
router.delete('/counsellors/:id', AdminController.deleteCounsellor);
router.put(
  '/counsellors/:counsellorId/profile-pic',
  upload.single('profilePic'),
  AdminController.updateCounsellorProfilePic
);
router.put('/counsellors/:id/verify', AdminController.verifyCounsellor);
router.put('/counsellors/:id/reject', AdminController.rejectCounsellor);

router.get('/appointments', AdminController.getAppointments);
router.post('/appointments', AdminController.createAppointment);
router.put('/appointments/:id', AdminController.updateAppointment);
router.delete('/appointments/:id', AdminController.deleteAppointment);
router.get('/feedbacks', AdminController.getFeedbacks);
router.put('/feedbacks/:id/moderate', AdminController.moderateFeedback);
router.post('/notifications', AdminController.sendSystemNotification);

// FAQs management
router.get('/faqs', AdminController.getFaqs);
router.post('/faqs', AdminController.createFaq);
router.put('/faqs/:id', AdminController.updateFaq);
router.delete('/faqs/:id', AdminController.deleteFaq);

// Inquiries management
router.get('/inquiries', AdminController.getInquiries);
router.put('/inquiries/:id/resolve', AdminController.resolveInquiry);
router.put('/inquiries/:id/note', AdminController.saveInquiryNote);
router.delete('/inquiries/:id', AdminController.deleteInquiry);
router.post('/inquiries/clear-resolved', AdminController.clearResolvedInquiries);

// Settings management
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

// IP Blocklist management
router.get('/settings/blocked-ips', AdminController.getBlockedIps);
router.post('/settings/blocked-ips', AdminController.addBlockedIp);
router.delete('/settings/blocked-ips/:ip', AdminController.removeBlockedIp);

// Roles management
router.get('/roles', AdminController.getRoles);
router.post('/roles', AdminController.createRole);
router.put('/roles/:id', AdminController.updateRole);
router.delete('/roles/:id', AdminController.deleteRole);

// Test Results management
router.get('/test-results', AdminController.getTestResults);
router.delete('/test-results/:id', AdminController.deleteTestResult);

// Aptitude Questions management
router.get('/aptitude-questions', AdminController.getAptitudeQuestions);
router.post('/aptitude-questions', AdminController.createAptitudeQuestion);
router.put('/aptitude-questions/:id', AdminController.updateAptitudeQuestion);
router.delete('/aptitude-questions/:id', AdminController.deleteAptitudeQuestion);

// Refund management routes
router.get('/refunds', AdminController.getRefundRequests);
router.post('/appointments/:id/approve-refund', AdminController.approveRefund);
router.post('/appointments/:id/reject-refund', AdminController.rejectRefund);

module.exports = router;
