const express = require('express');
const FeedbackController = require('../controllers/feedbackController');
const { verifyJWT, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyJWT, requireRole('user'), FeedbackController.submitFeedback);
router.get('/counsellor/:counsellorId', verifyJWT, FeedbackController.getCounsellorFeedbacks);

module.exports = router;
