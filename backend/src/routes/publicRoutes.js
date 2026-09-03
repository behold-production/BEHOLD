const express = require('express');
const PublicController = require('../controllers/publicController');
const reviewController = require('../controllers/reviewController');
const { verifyJWT } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

const AppointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.post('/inquiries', PublicController.submitInquiry);
router.get('/faqs', cacheMiddleware(300), PublicController.getFaqs);
router.get('/settings', cacheMiddleware(300), PublicController.getSettings);
router.post('/test-results', PublicController.saveTestResult);
router.get('/aptitude-questions', cacheMiddleware(300), PublicController.getAptitudeQuestions);
router.get('/sitemap.xml', cacheMiddleware(3600), PublicController.getSitemap);
router.get('/booking-confirmation/:id', AppointmentController.getPublicBookingConfirmation);
router.get('/check-introductory-eligibility', AppointmentController.checkIntroductoryEligibility);

// Campaign & Meta Ads Event Tracking Routes
router.post('/campaign-event', PublicController.recordCampaignEvent);
router.post('/meta-events', PublicController.recordCampaignEvent);
router.post('/meta-conversions', PublicController.recordCampaignEvent);
router.get('/campaigns/stats', PublicController.getCampaignStats);
router.get('/meta-ads/stats', PublicController.getCampaignStats);

// Review routes
router.get('/reviews', cacheMiddleware(300), reviewController.getPublicReviews);
router.post('/reviews', verifyJWT, reviewController.submitReview);

module.exports = router;
