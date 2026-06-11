const express = require('express');
const PublicController = require('../controllers/publicController');

const router = express.Router();

router.post('/inquiries', PublicController.submitInquiry);
router.get('/faqs', PublicController.getFaqs);
router.get('/settings', PublicController.getSettings);
router.post('/test-results', PublicController.saveTestResult);
router.get('/aptitude-questions', PublicController.getAptitudeQuestions);

module.exports = router;
