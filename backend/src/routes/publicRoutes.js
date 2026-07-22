const express = require('express');
const PublicController = require('../controllers/publicController');
const reviewController = require('../controllers/reviewController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/inquiries', PublicController.submitInquiry);
router.get('/faqs', PublicController.getFaqs);
router.get('/settings', PublicController.getSettings);
router.post('/test-results', PublicController.saveTestResult);
router.get('/aptitude-questions', PublicController.getAptitudeQuestions);

// Review routes
router.get('/reviews', reviewController.getPublicReviews);
router.post('/reviews', verifyJWT, reviewController.submitReview);

module.exports = router;
