const express = require('express');
const AdminController = require('../controllers/adminController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// All admin routes require verifyJWT and admin role
router.use(verifyJWT, requireRole('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

router.get('/counsellors', AdminController.getCounsellors);
router.post('/counsellors', AdminController.createCounsellor);
router.put('/counsellors/:id', AdminController.updateCounsellor);
router.delete('/counsellors/:id', AdminController.deleteCounsellor);
router.put('/counsellors/:id/verify', AdminController.verifyCounsellor);

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

// Roles management
router.get('/roles', AdminController.getRoles);
router.post('/roles', AdminController.createRole);
router.delete('/roles/:id', AdminController.deleteRole);

// Test Results management
router.get('/test-results', AdminController.getTestResults);
router.delete('/test-results/:id', AdminController.deleteTestResult);

// Aptitude Questions management
router.get('/aptitude-questions', AdminController.getAptitudeQuestions);
router.post('/aptitude-questions', AdminController.createAptitudeQuestion);
router.put('/aptitude-questions/:id', AdminController.updateAptitudeQuestion);
router.delete('/aptitude-questions/:id', AdminController.deleteAptitudeQuestion);

module.exports = router;
